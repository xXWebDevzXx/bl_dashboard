import "dotenv/config";
import { PrismaClient } from "../../app/generated/prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashExistingPasswords() {
  try {
    console.log("Starting password hashing migration...");

    // Find all users with plaintext passwords (those without auth0Id)
    const users = await prisma.user.findMany({
      where: {
        password: {
          not: null,
        },
        auth0Id: null,
      },
    });

    console.log(`Found ${users.length} users with plaintext passwords`);

    for (const user of users) {
      if (user.password) {
        // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        const isAlreadyHashed = /^\$2[aby]\$/.test(user.password);

        if (!isAlreadyHashed) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
          });
          console.log(`✓ Hashed password for user: ${user.email}`);
        } else {
          console.log(`- Password already hashed for user: ${user.email}`);
        }
      }
    }

    console.log("Password hashing migration completed successfully!");
  } catch (error) {
    console.error("Error during password hashing migration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

hashExistingPasswords();

