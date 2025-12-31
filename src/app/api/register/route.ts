import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return new NextResponse("Missing email or password", { status: 400 });
        }

        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("REGISTER_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
