import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return new NextResponse("Missing email or password", { status: 400 });
        }

        if (typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 254) {
            return new NextResponse("Invalid email address", { status: 400 });
        }

        if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
            return new NextResponse("Password must be between 8 and 128 characters", { status: 400 });
        }

        if (name !== undefined && (typeof name !== 'string' || name.length > 100)) {
            return new NextResponse("Invalid name", { status: 400 });
        }

        const userExists = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (userExists) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                name: name?.trim() || null,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ id: user.id, email: user.email });
    } catch (error) {
        console.error("REGISTER_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
