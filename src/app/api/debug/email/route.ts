import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
    try {
        const result = {
            env: {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_SECURE,
                user: process.env.SMTP_USER ? '***' : 'missing',
                pass: process.env.SMTP_PASS ? '***' : 'missing',
            },
            connection: null as any,
            error: null as any,
        };

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // Add verify connection debug options
            debug: true,
            logger: true
        });

        try {
            await transporter.verify();
            result.connection = 'SUCCESS: Server is ready to take our messages';
        } catch (connError: any) {
            result.error = {
                message: connError.message,
                code: connError.code,
                command: connError.command,
                response: connError.response,
                stack: connError.stack
            };
        }

        return NextResponse.json(result, { status: result.error ? 500 : 200 });
    } catch (error: any) {
        return NextResponse.json({
            message: 'Fatal error in debug route',
            error: error.message
        }, { status: 500 });
    }
}
