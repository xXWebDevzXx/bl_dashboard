import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export const dynamic = 'force-dynamic';

interface LinearIssue {
  id: string;
  name: string;
  taskId: string;
  estimatedTime: string;
  delegateId: string | null;
  delegateName: string | null;
  projectName: string | null;
  startedAt: number | null;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

interface ApiResponse {
  data: LinearIssue[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const limit = 20;

  const response = await fetch(
    `http://localhost:3000/api/linear_issues/all?page=${currentPage}&limit=${limit}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error('Response:', text.slice(0, 500));
    throw new Error(`Failed to fetch issues: ${response.status}`);
  }

  const { data: issues, pagination }: ApiResponse = await response.json();

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Linear Issues ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <Card key={issue.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {issue.taskId}
                  </CardTitle>
                </CardHeader>
                <CardDescription>
                  {issue.name}
                </CardDescription>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {issue.projectName && (
                      <p><strong>Project:</strong> {issue.projectName}</p>
                    )}
                    {issue.delegateName && (
                      <p><strong>Delegate:</strong> {issue.delegateName}</p>
                    )}
                    {issue.estimatedTime && (
                      <p><strong>Estimated Time:</strong> {issue.estimatedTime}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href={`/issues?page=${currentPage - 1}`} />
                  </PaginationItem>
                )}

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href={`/issues?page=${page}`}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </div>
                    );
                  })}

                {pagination.hasMore && (
                  <PaginationItem>
                    <PaginationNext href={`/issues?page=${currentPage + 1}`} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}