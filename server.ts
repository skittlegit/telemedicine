/**
 * Custom Next.js server with attached Socket.IO signalling.
 * Route handlers can't upgrade WebSocket connections, so the consult room needs
 * this long-running process. It does not run on Vercel, which only serves the
 * `next build` output.
 *
 * Run: `tsx server.ts` (handled by `npm run dev` / `npm start`).
 */
import { createServer } from "node:http";
import next from "next";
import { decode as decodeJwt } from "next-auth/jwt";
import { Server, type DefaultEventsMap } from "socket.io";

const port = Number(process.env.PORT ?? 3000);
const dev = process.env.NODE_ENV !== "production";
const socketPath = process.env.SOCKET_PATH ?? "/api/socket";

// Auth.js uses the __Secure- name only over HTTPS, and salts the JWT with
// whichever cookie name it used.
const SESSION_COOKIES = ["__Secure-authjs.session-token", "authjs.session-token"];

const app = next({ dev });
const handle = app.getRequestHandler();

interface SocketData {
  user: { userId: string; role: string };
}

async function main() {
  await app.prepare();

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>(
    httpServer,
    {
      path: socketPath,
      cors: { origin: false },
      serveClient: false,
    },
  );

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
      const cookieName = SESSION_COOKIES.find((name) => cookies[name]);
      if (!cookieName) return nextFn(new Error("unauthorized"));
      const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
      if (!secret) return nextFn(new Error("server misconfigured"));
      const payload = await decodeJwt({
        token: cookies[cookieName],
        secret,
        salt: cookieName,
      });
      if (!payload?.sub) return nextFn(new Error("unauthorized"));
      socket.data.user = {
        userId: payload.sub,
        role: payload.role ?? "patient",
      };
      nextFn();
    } catch {
      nextFn(new Error("unauthorized"));
    }
  });

  /* -------- Room signalling ------------------------------------------ */
  io.on("connection", (socket) => {
    const me = socket.data.user;

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
