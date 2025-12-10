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
import { IssueFilters } from "@/components/IssueFilters";

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

export interface IssueFilters {
  project?: string;
  delegate?: string;
  estimate?: string;
  search?: string;
  hasTimeEntries?: boolean;
  createdAfter?: number;
  createdBefore?: number;
  startedAfter?: number;
  startedBefore?: number;
  completedAfter?: number;
  completedBefore?: number;
  label?: string;
}

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    project?: string;
    delegate?: string;
    estimate?: string;
    hasTimeEntries?: string;
    label?: string;
  }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const limit = 20;

  // Build query string with filters
  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    limit: limit.toString(),
  });

  if (params.search) queryParams.set('search', params.search);
  if (params.project) queryParams.set('project', params.project);
  if (params.delegate) queryParams.set('delegate', params.delegate);
  if (params.estimate) queryParams.set('estimate', params.estimate);
  if (params.hasTimeEntries) queryParams.set('hasTimeEntries', params.hasTimeEntries);
  if (params.label) queryParams.set('label', params.label);
const apiBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${apiBaseUrl}/api/linear_issues/all?${queryParams.toString()}`, { cache: "no-store" });

  if (!response.ok) {
    const text = await response.text();
    console.error('Response:', text.slice(0, 500));
    throw new Error(`Failed to fetch issues: ${response.status}`);
  }

  const { data: issues, pagination }: ApiResponse = await response.json();

  // Build pagination href with current filters
  const buildPageHref = (page: number) => {
    const href = new URLSearchParams();
    href.set('page', page.toString());
    if (params.search) href.set('search', params.search);
    if (params.project) href.set('project', params.project);
    if (params.delegate) href.set('delegate', params.delegate);
    if (params.estimate) href.set('estimate', params.estimate);
    if (params.hasTimeEntries) href.set('hasTimeEntries', params.hasTimeEntries);
    if (params.label) href.set('label', params.label);
    return `/issues?${href.toString()}`;
  };

  return (
    <div className="p-4 sm:p-6 desktop:p-8">
      <div className="flex items-baseline gap-3 mb-4 sm:mb-6 desktop:mb-8">
        <h1 className="text-3xl sm:text-4xl desktop:text-5xl font-bold text-white">Issues</h1>
        <span className="text-xl sm:text-2xl text-zinc-400 font-semibold">{pagination.total}</span>
      </div>

      <IssueFilters />

      <Card className="bg-[#161B22] border-zinc-800/60 rounded-sm shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.1s_both]">
        <CardHeader className="border-b border-zinc-800/60">
          <CardTitle className="text-lg sm:text-xl text-white">Results</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 desktop:grid-cols-3 gap-4 sm:gap-6">
            {issues.map((issue) => (
              <Card
                key={issue.id}
                className="bg-[#0D1117] border-zinc-800/60 rounded-sm hover:border-zinc-700/80 transition-colors"
              >
                <CardHeader className="p-4 sm:p-5 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-mono text-blue-400">{issue.taskId}</CardTitle>
                    {issue.estimatedTime && (
                      <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                        {issue.estimatedTime}h
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-white font-medium text-sm sm:text-base line-clamp-2 mt-1">
                    {issue.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0">
                  <div className="space-y-1.5 text-xs sm:text-sm text-zinc-400">
                    {issue.projectName && (
                      <p className="flex items-center gap-2">
                        <span className="text-zinc-500">Project:</span>
                        <span className="text-zinc-300">{issue.projectName}</span>
                      </p>
                    )}
                    {issue.delegateName && (
                      <p className="flex items-center gap-2">
                        <span className="text-zinc-500">Delegate:</span>
                        <span className="text-zinc-300">{issue.delegateName}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {issues.length === 0 && (
            <div className="text-center py-12 text-zinc-400">
              No issues found matching your filters.
            </div>
          )}

          {pagination.totalPages > 1 && (
            <Pagination className="mt-6 sm:mt-8">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href={buildPageHref(currentPage - 1)} />
                  </PaginationItem>
                )}

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
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
                            href={buildPageHref(page)}
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
                    <PaginationNext href={buildPageHref(currentPage + 1)} />
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