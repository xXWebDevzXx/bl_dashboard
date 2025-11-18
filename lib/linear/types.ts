// Linear API Response Types

export interface LinearUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  organization?: LinearOrganization;
}

export interface LinearOrganization {
  id: string;
  name: string;
}

export interface LinearTeam {
  id: string;
  name: string;
  key: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface LinearLabel {
  id: string;
  name: string;
  color: string;
}

export interface LinearState {
  name: string;
  type: string;
}

export interface LinearComment {
  id: string;
  body: string;
  createdAt: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
}

export interface LinearIssue {
  id: string;
  title: string;
  description?: string;
  state: LinearState;
  assignee?: LinearUser;
  team: LinearTeam;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimate?: number;
  labels: {
    nodes: LinearLabel[];
  };
  comments?: {
    nodes: LinearComment[];
  };
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  state: string;
  progress: number;
  startDate?: string;
  targetDate?: string;
  lead?: {
    id: string;
    name: string;
  };
}

export interface LinearPageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

// GraphQL Response Types
export interface ViewerResponse {
  viewer: LinearUser;
}

export interface TeamsResponse {
  teams: {
    nodes: LinearTeam[];
  };
}

export interface IssuesResponse {
  issues: {
    nodes: LinearIssue[];
    pageInfo: LinearPageInfo;
  };
}

export interface IssueResponse {
  issue: LinearIssue | null;
}

export interface ProjectsResponse {
  projects: {
    nodes: LinearProject[];
  };
}

// Query Variables Types
export interface IssueFilter {
  team?: {
    id: {
      eq: string;
    };
  };
  state?: {
    name: {
      eq: string;
    };
  };
}

export interface IssuesVariables {
  first: number;
  filter?: IssueFilter;
}

export interface IssueByIdVariables {
  id: string;
}

