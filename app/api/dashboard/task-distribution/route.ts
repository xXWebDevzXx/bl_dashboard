import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth0Id = session.user.sub;

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all labels and count tasks per label
    const labels = await prisma.linearLabel.findMany({
      include: {
        tasks: true,
      },
    });

    // Map to { label: string, count: number } and sort by count descending
    let allLabelCounts = labels.map((label: { name: string; tasks: unknown[] }) => ({
      label: label.name,
      count: label.tasks.length,
    }));
    // Sort by count descending
    allLabelCounts = allLabelCounts.sort((a: { count: number }, b: { count: number }) => b.count - a.count);
    const topLabels = allLabelCounts.slice(0, 5);
    const otherLabels = allLabelCounts.slice(5);
    const otherCount = otherLabels.reduce((sum: number, item: { count: number }) => sum + item.count, 0);
    const labelTaskCounts = [...topLabels];
    if (otherCount > 0) {
      labelTaskCounts.push({ label: "Other", count: otherCount });
    }

    // Optionally, get total tasks for reference
    const totalTasks = await prisma.linearTask.count();

    return NextResponse.json({
      labelTaskCounts,
      totalTasks,
    });
  } catch (error) {
    console.error("Error fetching task distribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch task distribution" },
      { status: 500 }
    );
  }
}
