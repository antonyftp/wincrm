import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  // max:2 prevents pool exhaustion on Supabase free tier (15 connections total).
  // connectionTimeoutMillis: fail fast instead of queuing indefinitely — surfaces
  // errors clearly rather than hanging a login (root cause of reconnection issues).
  // onPoolError logs idle-client crashes that otherwise disappear silently.
  const adapter = new PrismaPg(
    {
      connectionString,
      max: 2,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000,
    },
    {
      onPoolError: (err: Error) => {
        console.error("[prisma-pool] idle client error:", err.message);
      },
    },
  );
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
