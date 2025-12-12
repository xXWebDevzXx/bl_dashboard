import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get unique projects
    const projects = await prisma.linearTask.findMany({
      where: {
        projectName: {
          not: null,
        },
      },
      select: {
        projectName: true,
      },
      distinct: ["projectName"],
      orderBy: {
        projectName: "asc",
      },
    });

    // Get unique estimates
    const estimates = await prisma.linearTask.findMany({
      where: {
        estimatedTime: {
          not: "",
        },
      },
      select: {
        estimatedTime: true,
      },
      distinct: ["estimatedTime"],
      orderBy: {
        estimatedTime: "asc",
      },
    });

    // Get unique labels
    const labels = await prisma.linearLabel.findMany({
      select: {
        name: true,
      },
      distinct: ["name"],
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      projects: projects.map((p) => p.projectName).filter(Boolean),
      estimates: estimates.map((e) => e.estimatedTime).filter(Boolean),
      labels: labels.map((l) => l.name),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
