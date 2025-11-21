import { PrismaClient } from '@prisma/client';

export async function getLinearProjects() {
    const query = `
    query {
      team(id: "BLE") {
        projects {
          nodes {
            id
            name
            description
            state
            startDate
            targetDate
            lead {
              id
              name
            }
          }
        }
      }
    }
    `
    
    const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${process.env.LINEAR_API_KEY}`,
        },
        body: JSON.stringify({ query }),
    });
    
    const data = await response.json();
    const projects = data.data.team.projects.nodes;

    for (const project in projects) {
        getTogglProjects(project);
    }
}



export async function getTogglProjects(project: object) {
    const response = await fetch(`https://api.track.toggl.com/api/v9/workspaces/2404074/projects/${project.id}/tasks`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${process.env.TOGGL_API_KEY}`,
        },
    });
    
    const data = await response.json();
    const tasks = data.name;
}
