import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Ensure connection is established on startup
  client.$connect().catch((error) => {
    console.error("Failed to connect to database:", error);
  });

  return client;
};

// Create a single instance
const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

// Wrap with retry logic in development
const withRetry = (client: PrismaClient): PrismaClient => {
  if (process.env.NODE_ENV !== "development") {
    return client;
  }

  return new Proxy(client, {
    get(target, prop) {
      const value = target[prop as keyof PrismaClient];

      // If it's a model (e.g., prisma.user, prisma.linearTask)
      if (typeof value === "object" && value !== null) {
        return new Proxy(value as object, {
          get(modelTarget: object, modelProp: string | symbol): unknown {
            const modelValue = (
              modelTarget as Record<string | symbol, unknown>
            )[modelProp];

            // If it's a query method, wrap it with retry logic
            if (typeof modelValue === "function") {
              return async (...args: unknown[]): Promise<unknown> => {
                try {
                  return await (
                    modelValue as (...args: unknown[]) => Promise<unknown>
                  ).apply(modelTarget, args);
                } catch (error: unknown) {
                  const err = error as { message?: string };
                  // Retry on connection errors
                  if (
                    err?.message?.includes("Engine is not yet connected") ||
                    err?.message?.includes(
                      "Response from the Engine was empty"
                    ) ||
                    err?.message?.includes("Can't reach database server")
                  ) {
                    console.warn("Prisma reconnecting...");
                    const maxRetries = 3;
                    let lastError = error;

                    for (let attempt = 1; attempt <= maxRetries; attempt++) {
                      try {
                        // Disconnect and reconnect
                        try {
                          await target.$disconnect();
                        } catch {
                          // Ignore disconnect errors
                        }

                        // Wait before reconnecting (exponential backoff)
                        await new Promise((resolve) =>
                          setTimeout(resolve, 200 * attempt)
                        );

                        await target.$connect();

                        // Small delay to ensure connection is ready
                        await new Promise((resolve) =>
                          setTimeout(resolve, 100)
                        );

                        // Retry the original query
                        return await (
                          modelValue as (...args: unknown[]) => Promise<unknown>
                        ).apply(modelTarget, args);
                      } catch (retryError) {
                        lastError = retryError;
                        if (attempt < maxRetries) {
                          console.warn(
                            `Prisma reconnection attempt ${attempt} failed, retrying...`
                          );
                        }
                      }
                    }

                    // If all retries failed, throw the last error
                    throw lastError;
                  }
                  throw error;
                }
              };
            }

            return modelValue;
          },
        });
      }

      return value;
    },
  }) as PrismaClient;
};

export const prisma = withRetry(prismaClient);

// Disconnect on process termination
if (typeof window === "undefined") {
  process.on("beforeExit", async () => {
    await prismaClient.$disconnect();
  });
}
