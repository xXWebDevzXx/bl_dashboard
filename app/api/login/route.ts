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
    
    console.log("User fetched from DB:", user);

    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Example password validation (replace with hashed password logic)
    const isAuthenticated = password === user.password;

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }


    return (NextResponse.json({ message: "Login successful" }, { status: 200 }));
    
    
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}