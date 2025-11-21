import { NextResponse } from "next/server";
import { PrismaClient } from "../../generated/prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { email, password } = body;
 
    // Validate email and password
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
 
    // Check if email has @obsidianagency.com domain
    if (!email.endsWith("@obsidianagency.com")) {
      return NextResponse.json({ error: "Invalid email domain" }, { status: 400 });
    }

  

    // Check if email exists in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    //create new user
    await prisma.user.create({
      data: {
        email,
        password,
        username: "defaultUsername",
        role: "user",
        createdAt: 1,
        updatedAt: 1,

      },
    });

    return NextResponse.json({ message: "Register successful" }, { status: 200 });
  } catch (error) {
    console.error("Error during register:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}