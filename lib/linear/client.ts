interface LinearResponse<T> {
    data?: T;
    errors?: Array<{ message: string; extensions?: any }>;
}

export class LinearClient {
    private apiToken: string;
    private endpoint = "https://api.linear.app/graphql";

    constructor() {
        const token = process.env.LINEAR_API_TOKEN;
        if (!token) {
            console.error("❌ LINEAR_API_TOKEN environment variable is not set");
            console.error("Please add LINEAR_API_TOKEN to your .env.local file");
            console.error("Get your token from: https://linear.app/settings/api");
            throw new Error("LINEAR_API_TOKEN environment variable is not set");
        }
        this.apiToken = token;
        console.log("✅ Linear client initialized successfully");
    }

    async query<T>(query: string, variables?: Record<string, any>): Promise<T> {
        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.apiToken,
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        const result: LinearResponse<T> = await response.json();

        if (result.errors && result.errors.length > 0) {
            throw new Error(result.errors[0].message);
        }

        if (!result.data) {
            throw new Error("No data returned from Linear API");
        }

        return result.data;
    }
}

export const linearClient = new LinearClient();

