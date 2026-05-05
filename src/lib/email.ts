/**
 * Email Service
 * Handles sending email notifications via SMTP
 */

import nodemailer from 'nodemailer';

interface OrderItem {
    quantity: number;
    price: number;
    product: {
        name: string;
    };
}

interface ShippingInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
}

interface OrderDetails {
    orderId: string;
    orderNumber: number;
    items: OrderItem[];
    total: number;
    shippingFee: number;
    discountAmount: number;
    paymentMethod: string;
    shippingInfo: ShippingInfo | null;
}

class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private adminEmail: string = 'anosebeauty@gmail.com';
    private initialized: boolean = false;

    /**
     * Check if email is configured
     */
    isConfigured(): boolean {
        const configured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
        if (!configured) {
            console.log('Email config check - SMTP_HOST:', process.env.SMTP_HOST ? 'set' : 'missing');
            console.log('Email config check - SMTP_USER:', process.env.SMTP_USER ? 'set' : 'missing');
            console.log('Email config check - SMTP_PASS:', process.env.SMTP_PASS ? 'set' : 'missing');
        }
        return configured;
    }

    /**
     * Get or create transporter (lazy initialization)
     */
    private getTransporter(): nodemailer.Transporter | null {
        if (!this.isConfigured()) {
            return null;
        }

        if (!this.initialized) {
            console.log('Initializing email transporter with:', {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_SECURE
            });

            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            this.initialized = true;
        }

        return this.transporter;
    }

    /**
     * Send new order notification to admin
     */
    async sendOrderNotification(order: OrderDetails): Promise<{ success: boolean; error?: string }> {
        const transporter = this.getTransporter();

        if (!transporter) {
            console.warn('Email service not configured, skipping order notification');
            return { success: false, error: 'Email service not configured' };
        }

        const shippingInfo = order.shippingInfo;
        const customerName = shippingInfo
            ? `${shippingInfo.firstName} ${shippingInfo.lastName}`
            : 'Guest Customer';

        const itemsList = order.items
            .map(item => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
                </tr>
            `)
            .join('');

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">🛒 New Order Received!</h1>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
                    <h2 style="color: #9333ea; margin-top: 0;">Order #${order.orderNumber}</h2>
                    <p style="color: #666;">Order ID: ${order.orderId}</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h3 style="color: #333; margin-top: 0;">👤 Customer Details</h3>
                        <p><strong>Name:</strong> ${customerName}</p>
                        ${shippingInfo ? `
                            <p><strong>Email:</strong> ${shippingInfo.email}</p>
                            <p><strong>Phone:</strong> ${shippingInfo.phone}</p>
                            <p><strong>Address:</strong> ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.postalCode}</p>
                        ` : ''}
                        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    </div>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h3 style="color: #333; margin-top: 0;">📦 Order Items</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f3f4f6;">
                                    <th style="padding: 10px; text-align: left;">Product</th>
                                    <th style="padding: 10px; text-align: center;">Qty</th>
                                    <th style="padding: 10px; text-align: right;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsList}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="background: #9333ea; color: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>Subtotal:</span>
                            <span>₹${(order.total - order.shippingFee + order.discountAmount).toFixed(2)}</span>
                        </div>
                        ${order.discountAmount > 0 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Discount:</span>
                                <span>-₹${order.discountAmount.toFixed(2)}</span>
                            </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>Shipping:</span>
                            <span>₹${order.shippingFee.toFixed(2)}</span>
                        </div>
                        <hr style="border-color: rgba(255,255,255,0.3); margin: 10px 0;">
                        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
                            <span>Total:</span>
                            <span>₹${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div style="background: #1f2937; color: #9ca3af; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
                    <p style="margin: 0;">Anose Beauty - Order Notification</p>
                </div>
            </div>
        `;

        try {
            await transporter.sendMail({
                from: `"Anose Orders" <anosebeauty@gmail.com>`,
                to: this.adminEmail,
                subject: `🛒 New Order #${order.orderNumber} - ₹${order.total.toFixed(2)}`,
                html: htmlContent,
            });

            console.log(`Order notification email sent for order #${order.orderNumber}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to send order notification email:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Send inquiry notification to admin
     */
    async sendInquiryNotification(data: {
        name: string;
        email: string;
        phone?: string;
        message: string;
        type?: string;
        hotelName?: string;
        quantity?: string;
    }): Promise<{ success: boolean; error?: string }> {
        const transporter = this.getTransporter();

        if (!transporter) {
            console.warn('Email service not configured, skipping inquiry notification');
            return { success: false, error: 'Email service not configured' };
        }

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">📩 New Inquiry Received</h1>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h3 style="color: #333; margin-top: 0;">👤 Contact Details</h3>
                        <p><strong>Name:</strong> ${data.name}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
                    </div>

                    ${(data.type === 'AMENITIES' || data.hotelName || data.quantity) ? `
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h3 style="color: #333; margin-top: 0;">🏢 Business Details</h3>
                        ${data.hotelName ? `<p><strong>Hotel/Business:</strong> ${data.hotelName}</p>` : ''}
                        ${data.quantity ? `<p><strong>Quantity:</strong> ${data.quantity}</p>` : ''}
                        ${data.type ? `<p><strong>Inquiry Type:</strong> ${data.type}</p>` : ''}
                    </div>
                    ` : ''}
                    
                    <div style="background: white; padding: 15px; border-radius: 8px;">
                        <h3 style="color: #333; margin-top: 0;">💬 Message</h3>
                        <p style="white-space: pre-wrap; color: #4b5563;">${data.message}</p>
                    </div>
                </div>
                
                <div style="background: #1f2937; color: #9ca3af; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
                    <p style="margin: 0;">Anose Beauty - Data & Notifications</p>
                </div>
            </div>
        `;

        try {
            await transporter.sendMail({
                from: `"Anose Website" <anosebeauty@gmail.com>`,
                to: this.adminEmail,
                replyTo: data.email,
                subject: `📩 New Inquiry from ${data.name}`,
                html: htmlContent,
            });

            console.log(`Inquiry notification email sent from ${data.email}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to send inquiry notification email:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Send payment reminder for an invoice
     */
    async sendPaymentReminder(invoice: any, toEmail: string): Promise<{ success: boolean; error?: string }> {
        const transporter = this.getTransporter();

        if (!transporter) {
            console.warn('Email service not configured, skipping payment reminder');
            return { success: false, error: 'Email service not configured' };
        }

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">Payment Reminder</h1>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
                    <p style="font-size: 16px; color: #374151;">Dear ${invoice.customerName},</p>
                    <p style="font-size: 16px; color: #374151;">This is a friendly reminder that invoice <strong>${invoice.invoiceNumber}</strong> is currently overdue.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e11d48;">
                        <h3 style="margin-top: 0; color: #111827;">Invoice Summary</h3>
                        <p style="margin: 5px 0; color: #4b5563;"><strong>Invoice No:</strong> ${invoice.invoiceNumber}</p>
                        <p style="margin: 5px 0; color: #4b5563;"><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                        <p style="margin: 5px 0; color: #4b5563;"><strong>Total Amount:</strong> ₹${invoice.total.toLocaleString()}</p>
                        <p style="margin: 5px 0; color: #e11d48; font-weight: bold;"><strong>Amount Due:</strong> ₹${invoice.balance.toLocaleString()}</p>
                    </div>
                    
                    <p style="font-size: 16px; color: #374151;">Please arrange for payment at your earliest convenience to avoid any service disruptions.</p>
                    <p style="font-size: 16px; color: #374151;">If you have already made the payment, please disregard this email.</p>
                    <p style="font-size: 16px; color: #374151; margin-top: 30px;">Best regards,<br>Anose Beauty Team</p>
                </div>
                
                <div style="background: #1f2937; color: #9ca3af; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">Anose Beauty</p>
                    <p style="margin: 5px 0 0;">Email: wecare@anosebeauty.com | Phone: +91 9110134408</p>
                </div>
            </div>
        `;

        try {
            await transporter.sendMail({
                from: `"Anose Invoicing" <anosebeauty@gmail.com>`,
                to: toEmail,
                subject: `Payment Overdue: Invoice ${invoice.invoiceNumber}`,
                html: htmlContent,
            });

            console.log(`Payment reminder email sent for invoice ${invoice.invoiceNumber}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to send payment reminder email:', error);
            return { success: false, error: String(error) };
        }
    }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
