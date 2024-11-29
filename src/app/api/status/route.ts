import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  const updatedAt = new Date().toISOString();
  const versionQuery: {
    server_version: string;
  }[] = await db.$queryRaw`SHOW server_version;`;
  const version = versionQuery[0]?.server_version.split(" ")[0] ?? "unknown";

  const maxConnectionsQuery: {
    max_connections: string;
  }[] = await db.$queryRaw`SHOW max_connections;`;
  const maxConnections = parseInt(
    maxConnectionsQuery[0]?.max_connections ?? "0",
  );

  const maxOpenedConnectionsQuery: {
    count: string;
  }[] = await db.$queryRaw`SELECT COUNT(*) FROM pg_stat_activity;`;
  const openedConnections = parseInt(
    maxOpenedConnectionsQuery[0]?.count ?? "0",
  );

  return NextResponse.json(
    {
      updatedAt,
      dependencies: {
        database: {
          version,
          maxConnections,
          openedConnections,
        },
      },
    },
    {
      status: 200,
    },
  );
}
