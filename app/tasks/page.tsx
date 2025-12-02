import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";

export default async function TasksPage() {
  const issues = await apiClient.getIssues();
  console.log(issues);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {issues.map((issue) => (
            <Card key={issue.id}>
              <CardHeader>
                <CardTitle>{issue.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{issue.description}</p>
              </CardContent>
            </Card>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
