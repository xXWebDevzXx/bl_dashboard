/**
 * Server-side Linear API helpers
 * Use these in Server Components to bypass HTTP API routes for better performance
 */

import { linearClient } from "./client";
import {
  GET_ISSUES,
  GET_ISSUE_BY_ID,
  GET_PROJECTS,
  GET_TEAMS,
  GET_VIEWER,
} from "./queries";
import {
  IssueByIdVariables,
  IssueFilter,
  IssueResponse,
  IssuesResponse,
  IssuesVariables,
  LinearIssue,
  LinearProject,
  LinearTeam,
  LinearUser,
  ProjectsResponse,
  TeamsResponse,
  ViewerResponse,
} from "./types";

export const linearServer = {
  /**
   * Get current viewer (authenticated user)
   */
  async getMe(): Promise<LinearUser> {
    const data = await linearClient.query<ViewerResponse>(GET_VIEWER);
    return data.viewer;
  },

  /**
   * Get all teams
   */
  async getTeams(): Promise<LinearTeam[]> {
    const data = await linearClient.query<TeamsResponse>(GET_TEAMS);
    return data.teams.nodes;
  },

  /**
   * Get issues with optional filters
   */
  async getIssues(params?: {
    limit?: number;
    teamId?: string;
    state?: string;
  }): Promise<LinearIssue[]> {
    const filter: IssueFilter = {};
    if (params?.teamId) {
      filter.team = { id: { eq: params.teamId } };
    }
    if (params?.state) {
      filter.state = { name: { eq: params.state } };
    }

    const variables: IssuesVariables = {
      first: params?.limit || 50,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    };

    const data = await linearClient.query<IssuesResponse>(GET_ISSUES, variables);
    return data.issues.nodes;
  },

  /**
   * Get a single issue by ID
   */
  async getIssue(issueId: string): Promise<LinearIssue | null> {
    const variables: IssueByIdVariables = { id: issueId };
    const data = await linearClient.query<IssueResponse>(
      GET_ISSUE_BY_ID,
      variables
    );
    return data.issue;
  },

  /**
   * Get all projects
   */
  async getProjects(): Promise<LinearProject[]> {
    const data = await linearClient.query<ProjectsResponse>(GET_PROJECTS);
    return data.projects.nodes;
  },
};

