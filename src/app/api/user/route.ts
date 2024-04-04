import { db } from "@/lib/db";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import * as z from "zod";

// Define schema for input validation
const userSchema = z
  .object({
    username: z.string().min(1, 'username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have more than 8 characters')
  });

// Create user
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, username, password } = userSchema.parse(body);

        // check if email exists
        const exitingUserByEmail = await db.user.findUnique({
            where: { email: email }
        }); 
        if(exitingUserByEmail) {
            return NextResponse.json({ user: null, message: "User with this emaila lready exists"}, { status: 409 });
        }

        // check if already exists
        const exitingUserByUsername = await db.user.findUnique({
            where: { username: username }
        }); 
        if(exitingUserByUsername) {
            return NextResponse.json({ user: null, message: "User with this username already exists"}, { status: 409 });
        }

        const hashedPassword = await hash(password, 10);
        const newUser = await db.user.create({
            data: {
                username: username, 
                email: email, 
                password: hashedPassword
            }
        });
        const { password: newUserPassword, ...rest } = newUser;

        return NextResponse.json({ user: rest, message: "User created successfully" }, { status: 201 });
    } catch(error) {
        return NextResponse.json({ message: "Something went wrong :(" }, { status: 500 });
    }
}