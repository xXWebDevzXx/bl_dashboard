export interface Task {
  id: string;
  taskId: string;
  name: string;
  estimatedTime: number;
  actualTime: number;
  delegateId: string | null;
  delegateName: string | null;
  projectName: string | null;
  createdAt: number;
  updatedAt: number;
  labels: { id: string; name: string }[];
  togglEntries: {
    id: string;
    description: string;
    duration: number;
    start: string;
    stop: string;
  }[];
}
