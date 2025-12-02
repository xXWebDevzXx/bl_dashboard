export const GET_VIEWER = `
    query Me {
        viewer {
            id
            name
            email
            avatarUrl
            organization {
                id
                name
            }
        }
    }
`;

export const GET_TEAMS = `
    query Teams {
        teams {
            nodes {
                id
                name
                key
                description
                icon
                color
            }
        }
    }
`;

export const GET_ISSUES = `
    query Issues($first: Int, $filter: IssueFilter) {
        issues(first: $first, filter: $filter) {
            nodes {
                id
                title
                description
                state {
                    name
                    type
                }
                assignee {
                    id
                    name
                    email
                }
                team {
                    id
                    name
                    key
                }
                createdAt
                updatedAt
                completedAt
                estimate
                labels {
                    nodes {
                        id
                        name
                        color
                    }
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

export const GET_PROJECTS = `
    query Projects {
        projects {
            nodes {
                id
                name
                description
                state
                progress
                startDate
                targetDate
                lead {
                    id
                    name
                }
            }
        }
    }
`;

export const GET_ISSUE_BY_ID = `
    query IssueById($id: String!) {
        issue(id: $id) {
            id
            title
            description
            state {
                name
                type
            }
            assignee {
                id
                name
                email
                avatarUrl
            }
            team {
                id
                name
                key
            }
            createdAt
            updatedAt
            completedAt
            estimate
            labels {
                nodes {
                    id
                    name
                    color
                }
            }
            comments {
                nodes {
                    id
                    body
                    createdAt
                    user {
                        name
                        avatarUrl
                    }
                }
            }
        }
    }
`;

