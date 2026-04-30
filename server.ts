/**
 * Custom Next.js server with attached Socket.IO signalling.
 * Used because Next.js route handlers don't expose the underlying HTTP
 * server needed to upgrade WebSocket connections.
 *
 * Run: `tsx server.ts` (handled by `npm run dev` / `npm start`).
 */
import { createServer } from "node:http";
import next from "next";
import { Server, type Socket } from "socket.io";
import { parse as parseCookie } from "node:querystring";
import { decode as decodeJwt } from "next-auth/jwt";

const port = Number(process.env.PORT ?? 3000);
const dev = process.env.NODE_ENV !== "production";
const socketPath = process.env.SOCKET_PATH ?? "/api/socket";

const app = next({ dev });
const handle = app.getRequestHandler();

interface Peer {
  userId: string;
  role: string;
  socketId: string;
}

async function main() {
  await app.prepare();

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    path: socketPath,
    cors: { origin: false },
    serveClient: false,
  });

  /* -------- Auth middleware: extract user from auth cookie ----------- */
  io.use(async (socket, nextFn) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie ?? "";
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const [k, ...v] = c.trim().split("=");
          return [k, decodeURIComponent(v.join("="))];
        }),
      );
      void parseCookie; // satisfy import
      const tokenCookie =
        cookies["__Secure-authjs.session-token"] ??
        cookies["authjs.session-token"] ??
        cookies["next-auth.session-token"] ??
        cookies["__Secure-next-auth.session-token"];
      if (!tokenCookie) return nextFn(new Error("unauthorized"));
      const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
      if (!secret) return nextFn(new Error("server misconfigured"));
      const payload = await decodeJwt({
        token: tokenCookie,
        secret,
        salt: process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      });
      if (!payload?.sub) return nextFn(new Error("unauthorized"));
      (socket.data as { user: Peer }).user = {
        userId: String(payload.sub),
        role: String((payload as { role?: string }).role ?? "patient"),
        socketId: socket.id,
      };
      nextFn();
    } catch {
      nextFn(new Error("unauthorized"));
    }
  });

  /* -------- Room signalling ------------------------------------------ */
  io.on("connection", (socket: Socket) => {
    const me = (socket.data as { user: Peer }).user;

    socket.on("room:join", (roomId: string) => {
      if (typeof roomId !== "string" || roomId.length < 4 || roomId.length > 64) return;
      socket.join(roomId);
      socket.to(roomId).emit("peer:joined", { userId: me.userId, role: me.role });
      // Send the new peer the list of existing members.
      const members = Array.from(io.sockets.adapter.rooms.get(roomId) ?? []).filter(
        (id) => id !== socket.id,
      );
      socket.emit("room:members", { members });
    });

    socket.on("signal", (msg: { to: string; data: unknown }) => {
      if (!msg || typeof msg.to !== "string") return;
      io.to(msg.to).emit("signal", { from: socket.id, data: msg.data });
    });

    socket.on("chat", (msg: { roomId: string; text: string }) => {
      if (!msg || typeof msg.roomId !== "string" || typeof msg.text !== "string") return;
      if (msg.text.length > 2000) return;
      io.to(msg.roomId).emit("chat", {
        from: me.userId,
        role: me.role,
        text: msg.text,
        at: Date.now(),
      });
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue;
        socket.to(roomId).emit("peer:left", { socketId: socket.id, userId: me.userId });
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`▲ Vellum Health · http://localhost:${port}  (sockets: ${socketPath})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
