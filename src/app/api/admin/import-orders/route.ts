import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Dynamic import for xlsx to avoid SSR issues
async function parseExcel(buffer: ArrayBuffer) {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'array' });
    return workbook;
}

export async function POST(request: Request) {
    try {
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
        let imported = 0;
        const orderMap = new Map<string, any>();

        // Group orders by order number
        for (const row of data as any[]) {
            const orderNumber = row['Order Number'] || row['orderNumber'] || row['OrderNumber'];
            if (!orderNumber) {
                errors.push(`Row missing Order Number: ${JSON.stringify(row)}`);
                continue;
            }

            if (!orderMap.has(orderNumber.toString())) {
                orderMap.set(orderNumber.toString(), {
                    orderNumber: orderNumber.toString(),
                    customerName: row['Customer Name'] || row['customerName'] || row['CustomerName'] || '',
                    customerEmail: row['Customer Email'] || row['customerEmail'] || row['CustomerEmail'] || '',
                    customerPhone: row['Customer Phone'] || row['customerPhone'] || row['CustomerPhone'] || '',
                    totalAmount: parseFloat(row['Total Amount'] || row['totalAmount'] || row['TotalAmount'] || 0),
                    orderStatus: row['Order Status'] || row['orderStatus'] || row['OrderStatus'] || 'PENDING',
                    paymentStatus: row['Payment Status'] || row['paymentStatus'] || row['PaymentStatus'] || 'PENDING',
                    paymentMethod: row['Payment Method'] || row['paymentMethod'] || row['PaymentMethod'] || 'ONLINE',
                    orderDate: row['Order Date'] || row['orderDate'] || row['OrderDate'] || new Date().toISOString(),
                    address: row['Shipping Address'] || row['shippingAddress'] || row['ShippingAddress'] || '',
                    items: [],
                });
            }

            const order = orderMap.get(orderNumber.toString());
            const productName = row['Product Name'] || row['productName'] || row['ProductName'] || '';
            const quantity = parseInt(row['Quantity'] || row['quantity'] || 1);
            const price = parseFloat(row['Price'] || row['price'] || 0);

            if (productName) {
                order.items.push({
                    productName,
                    quantity,
                    price,
                });
            }
        }

        // Import orders
        for (const [orderNumber, orderData] of orderMap.entries()) {
            try {
                // Check if order already exists
                const existingOrder = await prisma.order.findFirst({
                    where: {
                        orderNumber: parseInt(orderNumber) || undefined,
                    },
                });

                if (existingOrder) {
                    errors.push(`Order #${orderNumber} already exists, skipping`);
                    continue;
                }

                // Find or create user
                let user = null;
                if (orderData.customerEmail) {
                    user = await prisma.user.upsert({
                        where: { email: orderData.customerEmail },
                        update: {},
                        create: {
                            email: orderData.customerEmail,
                            name: orderData.customerName || null,
                            role: 'customer',
                        },
                    });
                }

                // Create products if they don't exist (simplified - you may want to match existing products)
                const productIds: string[] = [];
                for (const item of orderData.items) {
                    // Try to find existing product by name
                    let product = await prisma.product.findFirst({
                        where: {
                            name: {
                                contains: item.productName,
                                mode: 'insensitive',
                            },
                        },
                    });

                    // If product doesn't exist, create a placeholder
                    if (!product) {
                        product = await prisma.product.create({
                            data: {
                                name: item.productName,
                                slug: item.productName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
                                category: 'Imported',
                                type: 'Imported',
                                gender: 'Unisex',
                                price: item.price,
                                originPrice: item.price,
                                description: 'Imported product',
                                images: JSON.stringify([]),
                                thumbImage: JSON.stringify(''),
                                quantity: 0,
                            },
                        });
                    }

                    productIds.push(product.id);
                }

                // Create order
                const order = await prisma.order.create({
                    data: {
                        orderNumber: parseInt(orderNumber) || undefined,
                        userId: user?.id || null,
                        total: orderData.totalAmount,
                        status: orderData.orderStatus,
                        paymentStatus: orderData.paymentStatus,
                        paymentMethod: orderData.paymentMethod,
                        address: orderData.address || null,
                        createdAt: new Date(orderData.orderDate),
                    },
                });

                // Create order items
                for (let i = 0; i < orderData.items.length; i++) {
                    const item = orderData.items[i];
                    const productId = productIds[i];

                    if (productId) {
                        await prisma.orderItem.create({
                            data: {
                                orderId: order.id,
                                productId: productId,
                                quantity: item.quantity,
                                price: item.price,
                            },
                        });
                    }
                }

                imported++;
            } catch (error: any) {
                errors.push(`Error importing order #${orderNumber}: ${error.message}`);
            }
        }

        return NextResponse.json({
            message: `Import completed. ${imported} orders imported successfully.`,
            imported,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error: any) {
        console.error('Error importing orders:', error);
        return NextResponse.json(
            { error: `Failed to import orders: ${error.message}` },
            { status: 500 }
        );
    }
}

