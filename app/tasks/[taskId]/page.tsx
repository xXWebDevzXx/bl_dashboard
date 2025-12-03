import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { getTaskDetails } from "@/lib/task-details";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

interface TaskPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("da-DK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("da-DK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function TaskPage({ params }: TaskPageProps) {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.email_verified) {
    redirect("/verify-email");
  }

  const { taskId } = await params;
  const task = await getTaskDetails(taskId);

  if (!task) {
    return (
      <div className="p-8">
        <Link href="/tasks" className="text-blue-500 hover:underline flex items-center gap-2 mb-4">
          <ArrowLeft size={16} />
          Tilbage til tasks
        </Link>
        <div className="bg-[#1A1F26] p-8 rounded-sm text-center">
          <h1 className="text-2xl text-white mb-2">Task ikke fundet</h1>
          <p className="text-gray-400">Kunne ikke finde task med ID: {taskId}</p>
        </div>
      </div>
    );
  }

  const estimatedHours = task.estimatedTime / 3600;
  const trackedHours = task.totalTrackedTime / 3600;
  const timeComparison = estimatedHours > 0
    ? ((trackedHours / estimatedHours) * 100).toFixed(1)
    : null;

  return (
    <div className="p-8">
      <Link href="/tasks" className="text-blue-500 hover:underline flex items-center gap-2 mb-6">
        <ArrowLeft size={16} />
        Tilbage til tasks
      </Link>

      <div className="bg-[#1A1F26] p-6 rounded-sm mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">{task.taskId}</div>
            <h1 className="text-3xl text-white font-semibold mb-4">{task.name}</h1>
          </div>
        </div>

        {task.labels.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Tag size={16} className="text-gray-400" />
            {task.labels.map((label) => (
              <span key={label.linearLabelId} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                {label.linearLabel.name}
              </span>
            ))}
          </div>
        )}

        {task.delegateName && (
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-gray-400" />
            <span className="text-gray-300">
              AI Delegate: <span className="text-white font-medium">{task.delegateName}</span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={16} />
            <span>Oprettet: {formatDate(task.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={16} />
            <span>Opdateret: {formatDate(task.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#1A1F26] p-6 rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-blue-500" />
            <h3 className="text-gray-400 text-sm">Estimeret tid</h3>
          </div>
          <p className="text-3xl text-white font-semibold">
            {task.estimatedTime}h
          </p>
        </div>

        <div className="bg-[#1A1F26] p-6 rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-green-500" />
            <h3 className="text-gray-400 text-sm">Registreret tid</h3>
          </div>
          <p className="text-3xl text-white font-semibold">{formatDuration(task.totalTrackedTime)}</p>
          <p className="text-sm text-gray-400 mt-1">
            {task.timeEntriesCount} {task.timeEntriesCount === 1 ? "entry" : "entries"}
          </p>
        </div>

        <div className="bg-[#1A1F26] p-6 rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-purple-500" />
            <h3 className="text-gray-400 text-sm">Tid sammenligning</h3>
          </div>
          {timeComparison ? (
            <>
              <p className="text-3xl text-white font-semibold">{timeComparison}%</p>
              <p className="text-sm text-gray-400 mt-1">af estimeret tid</p>
            </>
          ) : (
            <p className="text-gray-500">Ingen estimering</p>
          )}
        </div>
      </div>

      <div className="bg-[#1A1F26] p-6 rounded-sm">
        <h2 className="text-xl text-white font-semibold mb-4">Tidsregistreringer</h2>
        {task.togglTimes.length > 0 ? (
          <div className="space-y-3">
            {task.togglTimes.map((entry) => (
              <div key={entry.id} className="bg-[#0F1419] p-4 rounded border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white font-medium">{entry.description || "Ingen beskrivelse"}</p>
                  <span className="text-green-500 font-semibold">{formatDuration(entry.duration)}</span>
                </div>
                <div className="text-sm text-gray-400 flex gap-4">
                  <span>Start: {formatDateTime(entry.start)}</span>
                  <span>Slut: {formatDateTime(entry.stop)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock size={48} className="mx-auto mb-3 opacity-30" />
            <p>Ingen tidsregistreringer endnu</p>
          </div>
        )}
      </div>
    </div>
  );
}
