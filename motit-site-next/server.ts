// server.ts
import { createServer } from "node:http";
import { Server } from "socket.io";
import Redis from "ioredis";

const PORT = Number(process.env.WS_PORT ?? 3001);
const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ============================================
// Socket.IO server
// ============================================
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: SITE_URL,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// ============================================
// Redis clients
// ============================================
const pub = new Redis(REDIS_URL);
const sub = new Redis(REDIS_URL);
const presence = new Redis(REDIS_URL);

// Подписки на каналы:
//   chat:{chatUuid}:messages  — новое сообщение
//   typing:{chatUuid}         — печатает / перестал
//   presence:{userUuid}       — онлайн / оффлайн
sub.psubscribe("chat:*", "typing:*", "presence:*");

sub.on("pmessage", (_pattern: string, channel: string, message: string) => {
  try {
    const payload = JSON.parse(message);

    if (channel.startsWith("chat:")) {
      // "chat:{chatUuid}:messages"
      const [, chatUuid] = channel.split(":");
      io.to(`chat:${chatUuid}`).emit("message:new", payload);
    } else if (channel.startsWith("typing:")) {
      const [, chatUuid] = channel.split(":");
      io.to(`chat:${chatUuid}`).emit("typing", payload);
    } else if (channel.startsWith("presence:")) {
      io.emit("presence:update", payload);
    }
  } catch (err) {
    console.error("[ws] failed to parse redis message", err);
  }
});

// ============================================
// Socket connections
// ============================================
io.on("connection", (socket) => {
  const userUuid = socket.handshake.auth?.userUuid as string | undefined;

  if (!userUuid) {
    socket.disconnect();
    return;
  }

  console.log(`[ws] + ${userUuid} (${socket.id})`);

  // Presence: онлайн
  presence.set(`presence:${userUuid}`, "1", "EX", 60);
  pub.publish(
    `presence:${userUuid}`,
    JSON.stringify({ userUuid, status: "online" }),
  );

  // Heartbeat каждые 30 секунд (TTL 60 — двойной запас)
  const heartbeat = setInterval(() => {
    presence.set(`presence:${userUuid}`, "1", "EX", 60);
  }, 30_000);

  // ============================================
  // Комнаты чатов
  // ============================================
  socket.on("chat:join", (chatUuid: string) => {
    socket.join(`chat:${chatUuid}`);
  });

  socket.on("chat:leave", (chatUuid: string) => {
    socket.leave(`chat:${chatUuid}`);
  });

  // ============================================
  // «Печатает…»
  // ============================================
  socket.on(
    "typing:start",
    ({ chatUuid }: { chatUuid: string }) => {
      pub.publish(
        `typing:${chatUuid}`,
        JSON.stringify({ chatUuid, userUuid, typing: true }),
      );
    },
  );

  socket.on(
    "typing:stop",
    ({ chatUuid }: { chatUuid: string }) => {
      pub.publish(
        `typing:${chatUuid}`,
        JSON.stringify({ chatUuid, userUuid, typing: false }),
      );
    },
  );

  // ============================================
  // Disconnect
  // ============================================
  socket.on("disconnect", () => {
    clearInterval(heartbeat);
    presence.del(`presence:${userUuid}`);
    pub.publish(
      `presence:${userUuid}`,
      JSON.stringify({ userUuid, status: "offline" }),
    );
    console.log(`[ws] - ${userUuid}`);
  });
});

// ============================================
// Start
// ============================================
httpServer.listen(PORT, () => {
  console.log(`[ws] listening on :${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("[ws] shutting down...");
  await pub.quit();
  await sub.quit();
  await presence.quit();
  httpServer.close(() => process.exit(0));
});
