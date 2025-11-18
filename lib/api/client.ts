/**
 * Type-safe API client for frontend use
 */

import {
  LinearIssue,
  LinearProject,
  LinearTeam,
  LinearUser,
} from "@/lib/linear/types";

class ApiClient {
  private baseUrl =
    typeof window === "undefined" ? "http://localhost:3000/api" : "/api";

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.error || "API request failed");
      } else {
        // Handle HTML or other error responses
        const text = await response.text();
        console.error("API Error:", text.slice(0, 500));
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }
    }
    return response.json();
  }

  /**
   * Get current user information
   */
  async getMe(): Promise<LinearUser> {
    return this.fetch<LinearUser>("/me");
  }

  /**
   * Get all teams
   */
  async getTeams(): Promise<LinearTeam[]> {
    return this.fetch<LinearTeam[]>("/teams");
  }

  /**
   * Get issues with optional filters
   */
  async getIssues(params?: {
    limit?: number;
    teamId?: string;
    state?: string;
  }): Promise<LinearIssue[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.teamId) searchParams.set("teamId", params.teamId);
    if (params?.state) searchParams.set("state", params.state);

    const query = searchParams.toString();
    return this.fetch<LinearIssue[]>(`/issues${query ? `?${query}` : ""}`);
  }

  /**
   * Get a single issue by ID
   */
  async getIssue(issueId: string): Promise<LinearIssue> {
    return this.fetch<LinearIssue>(`/issues/${issueId}`);
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<LinearProject[]> {
    return this.fetch<LinearProject[]>("/projects");
  }
}

export const apiClient = new ApiClient();
