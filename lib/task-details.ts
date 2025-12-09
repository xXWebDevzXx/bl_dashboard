import { PrismaClient } from "@/app/generated/prisma/client";
const prisma = new PrismaClient();
export interface TaskDetail {
  id: string;
  taskId: string;
  name: string;
  estimatedTime: string;
  delegateId: string | null;
  delegateName: string | null;
  startedAt: number | null;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
  togglTimes: Array<{
    id: string;
    duration: number;
    start: string;
    stop: string;
    description: string;
    createdAt: number;
  }>;
  labels: Array<{
    linearTaskId: string;
    linearLabelId: string;
    linearLabel: {
      id: string;
      name: string;
    };
  }>;
  totalTrackedTime: number;
  timeEntriesCount: number;
}

export async function getTaskDetails(taskId: string): Promise<TaskDetail | null> {
  const task = await prisma.linearTask.findUnique({
    where: { taskId },
    include: {
      togglTimes: {
        select: {
          id: true,
          duration: true,
          start: true,
          stop: true,
          description: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      labels: {
        include: {
          linearLabel: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    return null;
  }

  // Calculate total tracked time
  const totalTrackedTime = task.togglTimes.reduce((sum, entry) => sum + entry.duration, 0);

  return {
    ...task,
    totalTrackedTime,
    timeEntriesCount: task.togglTimes.length,
  };
}
