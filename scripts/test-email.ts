import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Testing Email Configuration...');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);

async function testEmail() {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            debug: true, // Enable debug logging
            logger: true  // Log to console
        });

        console.log('\n1. Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection verified successfully.');

        console.log('\n2. Sending test email...');
        const info = await transporter.sendMail({
            from: `"Test Script" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to self
            subject: "Test Email from Anose Debugger",
            text: "If you receive this, the email configuration is working correctly.",
            html: "<b>If you receive this, the email configuration is working correctly.</b>",
        });

        console.log('✅ Message sent: %s', info.messageId);

    } catch (error) {
        console.error('❌ Email Error:', error);
    }
}

testEmail();
