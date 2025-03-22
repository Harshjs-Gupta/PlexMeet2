import { NextResponse } from "next/server";

// This is a pure API route handler for Next.js App Router
// Socket.io server implementation is handled in a separate file

// Export GET handler
export async function GET() {
  return NextResponse.json({ message: "Socket.io server endpoint" });
}

// Set dynamic rendering and Node.js runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
