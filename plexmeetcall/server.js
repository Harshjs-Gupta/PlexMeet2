// @ts-check
import { createServer } from "http";
import next from "next";
// Use explicit extension for ESM compatibility
import { initSocketServer } from "./src/lib/socket-server.js";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // API route to handle Socket.io
    if (req.url && req.url.startsWith("/api/socket")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Socket.io server running" }));
      return;
    }

    // Let Next.js handle all other routes
    handle(req, res);
  });

  // Initialize Socket.io using our centralized setup
  initSocketServer(server);

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
