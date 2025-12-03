interface LinearResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

export class LinearClient {
  private apiToken: string | null = null;
  private endpoint = "https://api.linear.app/graphql";
  private initialized = false;

  private initialize() {
    if (this.initialized) {
      return;
    }

    const token = process.env.LINEAR_API_TOKEN;
    if (!token) {
      console.error("❌ LINEAR_API_TOKEN environment variable is not set");
      console.error("Please add LINEAR_API_TOKEN to your .env.local file");
      console.error("Get your token from: https://linear.app/settings/api");
      throw new Error("LINEAR_API_TOKEN environment variable is not set");
    }
    this.apiToken = token;
    this.initialized = true;
  }

  async query<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    // Lazy initialization - only initialize when actually used
    this.initialize();

    if (!this.apiToken) {
      throw new Error("LINEAR_API_TOKEN is not configured");
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.apiToken,
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

// Create a singleton instance but don't initialize it yet
export const linearClient = new LinearClient();
