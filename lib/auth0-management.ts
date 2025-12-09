/**
 * Auth0 Management API utilities
 */

interface Auth0ManagementTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface Auth0User {
  user_id: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  username?: string;
  created_at?: string;
  updated_at?: string;
  blocked?: boolean;
}

/**
 * Get Auth0 Management API access token
 */
export async function getManagementApiToken(
  scope: string = "read:users"
): Promise<string> {
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error("Auth0 configuration missing");
  }

  const response = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: "client_credentials",
      scope: scope,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to get Management API token:", error);
    throw new Error("Failed to authenticate with Auth0 Management API");
  }

  const data: Auth0ManagementTokenResponse = await response.json();
  return data.access_token;
}

/**
 * Fetch all users from Auth0 Management API
 * Handles pagination automatically
 */
export async function fetchAllAuth0Users(): Promise<Auth0User[]> {
  const domain = process.env.AUTH0_DOMAIN;
  if (!domain) {
    throw new Error("AUTH0_DOMAIN is not configured");
  }

  const accessToken = await getManagementApiToken("read:users");
  const allUsers: Auth0User[] = [];
  let page = 0;
  const perPage = 100; // Auth0 max is 100 per page

  while (true) {
    const url = new URL(`https://${domain}/api/v2/users`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("per_page", perPage.toString());
    url.searchParams.set("include_totals", "true");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to fetch Auth0 users (page ${page}):`, error);
      throw new Error(
        `Failed to fetch users from Auth0: ${response.statusText}`
      );
    }

    const data = await response.json();
    const users: Auth0User[] = data.users || [];

    if (users.length === 0) {
      break;
    }

    allUsers.push(...users);

    // Check if there are more pages
    const total = data.total || 0;
    if (allUsers.length >= total || users.length < perPage) {
      break;
    }

    page++;
  }

  return allUsers;
}

/**
 * Convert Auth0 Management API user to sync format
 */
export function convertAuth0UserToSyncFormat(auth0User: Auth0User) {
  return {
    sub: auth0User.user_id,
    email: auth0User.email,
    email_verified: auth0User.email_verified || false,
    name: auth0User.name || auth0User.nickname || auth0User.username,
    nickname: auth0User.nickname || auth0User.username || auth0User.name,
  };
}
