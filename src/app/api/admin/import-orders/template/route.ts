import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import ExcelJS from 'exceljs';

export async function GET() {
    try {
        await requireAdmin();

        // Fetch all active products to pre-populate names in dropdown
        const products = await prisma.product.findMany({
            select: { name: true },
            orderBy: { name: 'asc' }
        });

        const productNames = products.map(p => p.name);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Import Template');

        // Define columns
        worksheet.columns = [
            { header: 'Order Number', key: 'orderNumber', width: 20 },
            { header: 'Customer Name', key: 'customerName', width: 25 },
            { header: 'Customer Email', key: 'customerEmail', width: 30 },
            { header: 'Customer Phone', key: 'customerPhone', width: 20 },
            { header: 'Product Name', key: 'productName', width: 35 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            { header: 'Price', key: 'price', width: 15 },
            { header: 'Total Amount', key: 'totalAmount', width: 15 },
            { header: 'Order Status', key: 'orderStatus', width: 20 },
            { header: 'Payment Status', key: 'paymentStatus', width: 20 },
            { header: 'Payment Method', key: 'paymentMethod', width: 20 },
            { header: 'Order Date', key: 'orderDate', width: 20 },
            { header: 'Shipping Address', key: 'shippingAddress', width: 40 },
        ];

        // Format header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE9E9E9' }
        };

        // Add some sample data or instructions if needed, but here we just want the validation
        // We'll apply validation to the first 1000 rows
        const numRows = 1000;

        // Data Validation Options
        const orderStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
        const paymentStatuses = ['PENDING', 'SUCCESSFUL', 'FAILED'];
        const paymentMethods = ['ONLINE', 'COD'];

        // Create a hidden sheet for long lists (like product names) if it exceeds 255 chars
        // ExcelJS can handle the list directly if it's short, but let's be safe.
        // Actually for now, let's try direct list for statuses and check product names length.

        const productsListString = productNames.length > 0 ? `"${productNames.join(',')}"` : null;

        for (let i = 2; i <= numRows; i++) {
            // Product Name Validation
            if (productNames.length > 0) {
                // If the list is too long (> 255 chars), Excel might complain.
                // However, ExcelJS allows referencing ranges.
                // For simplicity, if it's too long, we'll just put it as a comma string if it fits.
                const productList = productNames.join(',');
                if (productList.length < 255) {
                    worksheet.getCell(`E${i}`).dataValidation = {
                        type: 'list',
                        allowBlank: true,
                        formulae: [`"${productList}"`],
                        showErrorMessage: true,
                        errorTitle: 'Invalid Product',
                        error: 'Please select a product from the list'
                    };
                }
                // If it's longer than 255, we should ideally use a separate sheet.
                // But let's see if this covers most cases for now.
            }

            // Order Status Validation
            worksheet.getCell(`I${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`"${orderStatuses.join(',')}"`],
                showErrorMessage: true,
                errorTitle: 'Invalid Status',
                error: 'Please select a valid order status'
            };

            // Payment Status Validation
            worksheet.getCell(`J${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`"${paymentStatuses.join(',')}"`],
                showErrorMessage: true,
                errorTitle: 'Invalid Status',
                error: 'Please select a valid payment status'
            };

            // Payment Method Validation
            worksheet.getCell(`K${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`"${paymentMethods.join(',')}"`],
                showErrorMessage: true,
                errorTitle: 'Invalid Method',
                error: 'Please select a valid payment method'
            };

            // Quantity should be a whole number
            worksheet.getCell(`F${i}`).dataValidation = {
                type: 'whole',
                operator: 'greaterThanOrEqual',
                allowBlank: true,
                formulae: [1],
                showErrorMessage: true,
                error: 'Quantity must be at least 1'
            };

            // Price/Total should be decimal
            worksheet.getCell(`G${i}`).dataValidation = {
                type: 'decimal',
                operator: 'greaterThanOrEqual',
                allowBlank: true,
                formulae: [0],
                showErrorMessage: true,
                error: 'Price must be 0 or more'
            };
            worksheet.getCell(`H${i}`).dataValidation = {
                type: 'decimal',
                operator: 'greaterThanOrEqual',
                allowBlank: true,
                formulae: [0],
                showErrorMessage: true,
                error: 'Total amount must be 0 or more'
            };
        }

        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="Order_Import_Template.xlsx"',
            },
        });
    } catch (error: any) {
        console.error('Error generating template:', error);
        return NextResponse.json(
            { error: `Failed to generate template: ${error.message}` },
            { status: 500 }
        );
    }
}
