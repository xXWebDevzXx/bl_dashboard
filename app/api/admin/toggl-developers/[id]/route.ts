import { prisma } from "@/lib/prisma/client";
import { getAdminUser } from "@/lib/admin";
import { NextResponse, NextRequest } from "next/server";

// PATCH - Update a toggl developer (toggle active status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    const developer = await prisma.togglDeveloper.findUnique({
      where: { id },
    });

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 });
    }

    const updated = await prisma.togglDeveloper.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : developer.isActive,
        updatedAt: Math.floor(Date.now() / 1000),
      },
    });

    return NextResponse.json({ developer: updated });
  } catch (error) {
    console.error("Error updating toggl developer:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Remove a toggl developer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const developer = await prisma.togglDeveloper.findUnique({
      where: { id },
    });

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 });
    }

    await prisma.togglDeveloper.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting toggl developer:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
