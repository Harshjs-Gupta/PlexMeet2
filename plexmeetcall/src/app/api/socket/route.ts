import { NextResponse } from "next/server";

// Socket.io server is handled in middleware.ts

// Export GET handler
export async function GET() {
  return new NextResponse("Socket.io server running", { status: 200 });
}

// Export a global config for the Edge API route
export const config = {
  api: {
    bodyParser: false,
  },
};
