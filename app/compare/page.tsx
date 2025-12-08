import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import CompareTasksClient from "@/components/compare/CompareTasksClient";

// Force dynamic rendering for auth and database operations
export const dynamic = "force-dynamic";

async function getAvailableTasks() {
  const tasks = await prisma.linearTask.findMany({
    include: {
      togglTimes: true,
      labels: {
        include: {
          linearLabel: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    // Removed limit to fetch all tasks
  });

  return tasks.map((task) => {
    const totalTrackedSeconds = task.togglTimes.reduce((sum: number, entry) => sum + entry.duration, 0);
    const totalTrackedHours = totalTrackedSeconds / 3600;

    return {
      id: task.id,
      taskId: task.taskId,
      name: task.name,
      estimatedTime: task.estimatedTime,
      actualTime: totalTrackedHours,
      delegateId: task.delegateId,
      delegateName: task.delegateName,
      projectName: task.projectName,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      labels: task.labels.map((l) => ({
        id: l.linearLabel.id,
        name: l.linearLabel.name,
      })),
      togglEntries: task.togglTimes.map((t) => ({
        id: t.id,
        description: t.description,
        duration: t.duration,
        start: t.start,
        stop: t.stop,
      })),
    };
  });
}

export default async function ComparePage() {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const tasks = await getAvailableTasks();

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-[fadeIn_0.6s_ease-out]">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Compare Issues</h1>
          <p className="text-gray-400">Select two issues to compare their metrics, time tracking, and performance</p>
        </div>

        <CompareTasksClient tasks={tasks} />
      </div>
    </div>
  );
}
