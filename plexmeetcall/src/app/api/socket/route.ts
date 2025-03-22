import { NextResponse } from "next/server";

// Socket.io server is handled in the custom server (server.js/server-prod.js)
// using the implementation from ./io/route.ts

// Export GET handler
export async function GET() {
  return new NextResponse("Socket.io server running", { status: 200 });
}

// Set dynamic rendering and Node.js runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
