import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

// Helper to parse Excel dates correctly
function parseExcelDate(val: any): string {
    if (!val) return new Date().toISOString();
    if (val instanceof Date) return val.toISOString();

    // If it's a number (Excel serial date)
    if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 864e5));
        return date.toISOString();
    }

    // Fallback to trying to parse string
    try {
        const date = new Date(val);
        if (!isNaN(date.getTime())) return date.toISOString();
    } catch (e) { }

    return new Date().toISOString();
}

// Dynamic import for xlsx to avoid SSR issues
async function parseExcel(buffer: ArrayBuffer) {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    return workbook;
}

export async function POST(request: Request) {
    try {
        await requireAdmin();
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const workbook = await parseExcel(buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const XLSX = await import('xlsx');
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (!Array.isArray(data) || data.length === 0) {
            return NextResponse.json(
                { error: 'Excel file is empty or invalid' },
                { status: 400 }
            );
        }

        const errors: string[] = [];
        let importedCount = 0;
        const orderMap = new Map<string, any>();

        // Group orders by order number or row index if missing
        const rowData = data as any[];
        for (let i = 0; i < rowData.length; i++) {
            const row = rowData[i];

            // Mandatory check: name, product, amount, payment method, payment status
            const customerName = row['Customer Name'] || row['customerName'] || row['CustomerName'] || row['Name'] || row['name'] || row['Customer'] || row['customer'] || row['Client Name'] || row['Client'] || row['User'] || row['Contact'] || row['Full Name'];
            const customerEmail = row['Customer Email'] || row['customerEmail'] || row['CustomerEmail'] || row['Email'] || row['email'] || row['User Email'] || row['Account'] || row['Contact Email'] || '';
            const productName = row['Product Name'] || row['productName'] || row['ProductName'] || row['Product'] || row['product'] || row['Item'] || row['item'];
            const totalAmountStr = row['Total Amount'] || row['totalAmount'] || row['TotalAmount'] || row['Amount'] || row['amount'];
            const totalAmount = parseFloat(totalAmountStr || 0);
            const paymentMethod = row['Payment Method'] || row['paymentMethod'] || row['PaymentMethod'] || 'ONLINE';
            const paymentStatus = row['Payment Status'] || row['paymentStatus'] || row['PaymentStatus'] || 'PENDING';

            if (!customerName || !productName || isNaN(totalAmount) || !totalAmountStr) {
                errors.push(`Row ${i + 1} missing mandatory fields (Name, Product, or Amount). Skipping.`);
                continue;
            }

            // Grouping logic: Use Order Number if exists, otherwise treat each row as a unique order
            const excelOrderNumber = row['Order Number'] || row['orderNumber'] || row['OrderNumber'];
            const groupKey = excelOrderNumber ? excelOrderNumber.toString() : `row-${i}`;

            if (!orderMap.has(groupKey)) {
                orderMap.set(groupKey, {
                    customerName,
                    customerEmail,
                    customerPhone: row['Customer Phone'] || row['customerPhone'] || row['CustomerPhone'] || row['Phone'] || row['phone'] || '',
                    totalAmount,
                    orderStatus: row['Order Status'] || row['orderStatus'] || row['OrderStatus'] || 'PENDING',
                    paymentStatus,
                    paymentMethod,
                    orderDate: parseExcelDate(row['Order Date'] || row['orderDate'] || row['OrderDate']),
                    address: row['Shipping Address'] || row['shippingAddress'] || row['ShippingAddress'] || row['Address'] || row['address'] || '',
                    items: [],
                });
            }

            const order = orderMap.get(groupKey);
            const quantity = parseInt(row['Quantity'] || row['quantity'] || 1);
            const price = parseFloat(row['Price'] || row['price'] || totalAmount);

            order.items.push({
                productName,
                quantity,
                price,
            });
        }

        // Import orders
        for (const [groupKey, orderData] of orderMap.entries()) {
            try {
                // Find or create user if email is provided (Optional for records, but Order will hold the source name)
                let userId = null;
                if (orderData.customerEmail) {
                    const user = await prisma.user.upsert({
                        where: { email: orderData.customerEmail },
                        update: { name: orderData.customerName },
                        create: {
                            email: orderData.customerEmail,
                            name: orderData.customerName || null,
                            role: 'customer',
                        },
                    });
                    userId = user.id;
                }

                // Match or create products
                const productIds: string[] = [];
                for (const item of orderData.items) {
                    let product = await prisma.product.findFirst({
                        where: {
                            name: {
                                equals: item.productName,
                                mode: 'insensitive',
                            },
                        },
                    });

                    if (!product) {
                        product = await prisma.product.create({
                            data: {
                                name: item.productName,
                                slug: item.productName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7),
                                category: 'Imported',
                                type: 'Imported',
                                gender: 'Unisex',
                                price: item.price,
                                originPrice: item.price,
                                description: 'Imported product',
                                images: JSON.stringify([]),
                                thumbImage: '',
                                quantity: 0,
                            },
                        });
                    }
                    productIds.push(product.id);
                }

                // Create order - AUTOMATIC numbering & Store Customer Details directly
                const order = await prisma.order.create({
                    data: {
                        userId: userId,
                        customerName: orderData.customerName,
                        customerEmail: orderData.customerEmail,
                        customerPhone: orderData.customerPhone,
                        total: orderData.totalAmount,
                        status: orderData.orderStatus.toUpperCase(),
                        paymentStatus: orderData.paymentStatus.toUpperCase(),
                        paymentMethod: orderData.paymentMethod.toUpperCase(),
                        address: orderData.address || null,
                        createdAt: new Date(orderData.orderDate),
                    },
                });

                // Create order items
                await Promise.all(orderData.items.map((item: any, idx: number) => {
                    return prisma.orderItem.create({
                        data: {
                            orderId: order.id,
                            productId: productIds[idx],
                            quantity: item.quantity,
                            price: item.price,
                        },
                    });
                }));

                importedCount++;
            } catch (error: any) {
                errors.push(`Error importing order from row/group ${groupKey}: ${error.message}`);
                console.error(`Import error for ${groupKey}:`, error);
            }
        }

        return NextResponse.json({
            message: `Import completed. ${importedCount} orders imported successfully.`,
            imported: importedCount,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error: any) {
        console.error('Global import error:', error);
        return NextResponse.json(
            { error: `Failed to import orders: ${error.message}` },
            { status: 500 }
        );
    }
}
