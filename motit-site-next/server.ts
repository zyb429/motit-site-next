// server.ts
import { createServer } from "node:http";
import { Server } from "socket.io";
import Redis from "ioredis";

const PORT = Number(process.env.WS_PORT ?? 3001);
const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: SITE_URL,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const pub = new Redis(REDIS_URL);
const sub = new Redis(REDIS_URL);
const presence = new Redis(REDIS_URL);

// Подписки:
//   chat:{chatUuid}:messages  — новое сообщение
//   chat:{chatUuid}:read      — прочитано
//   typing:{chatUuid}         — печатает / перестал
//   presence:{userUuid}       — онлайн / оффлайн
//   user:{userUuid}:chats     — персональные события чата (removed)
sub.psubscribe("chat:*", "typing:*", "presence:*", "user:*");

sub.on("pmessage", (_pattern: string, channel: string, message: string) => {
  try {
    const payload = JSON.parse(message);

    if (channel.startsWith("chat:")) {
      const parts = channel.split(":");
      const chatUuid = parts[1];
      const kind = parts[2];

      if (kind === "read") {
        io.to(`chat:${chatUuid}`).emit("message:read", payload);
      } else if (payload.event === "message:deleted") {
        io.to(`chat:${chatUuid}`).emit("message:deleted", payload);
      } else if (payload.event === "message:edited") {
        io.to(`chat:${chatUuid}`).emit("message:edited", payload);
      } else if (payload.event === "message:pinned") {
        io.to(`chat:${chatUuid}`).emit("message:pinned", payload);
      } else if (payload.event === "message:unpinned") {
        io.to(`chat:${chatUuid}`).emit("message:unpinned", payload);
      } else {
        io.to(`chat:${chatUuid}`).emit("message:new", payload);
      }
    } else if (channel.startsWith("typing:")) {
      const chatUuid = channel.split(":")[1];
      io.to(`chat:${chatUuid}`).emit("typing", payload);
    } else if (channel.startsWith("presence:")) {
      io.emit("presence:update", payload);
    } else if (channel.startsWith("user:")) {
      const parts = channel.split(":");
      const userUuid = parts[1];
      const kind = parts[2];

      if (kind === "chats") {
        if (payload.event === "chat:updated") {
          io.to(`user:${userUuid}`).emit("chat:updated", payload);
        } else if (payload.event === "chat:created") {
          io.to(`user:${userUuid}`).emit("chat:created", payload);
        } else {
          io.to(`user:${userUuid}`).emit("chat:removed", payload);
        }
      }
    }
  } catch (err) {
    console.error("[ws] failed to parse redis message", err);
  }
});

io.on("connection", async (socket) => {
  const userUuid = socket.handshake.auth?.userUuid as string | undefined;

  if (!userUuid) {
    socket.disconnect();
    return;
  }

  // Персональная комната пользователя — для адресных событий
  socket.join(`user:${userUuid}`);

  console.log(`[ws] + ${userUuid} (${socket.id})`);

  // Сообщаем новому клиенту, кто уже онлайн
  try {
    const keys = await presence.keys("presence:*");
    for (const key of keys) {
      const uuid = key.replace("presence:", "");
      if (uuid !== userUuid) {
        socket.emit("presence:update", { userUuid: uuid, status: "online" });
      }
    }
  } catch (err) {
    console.error("[ws] failed to load online users", err);
  }

  presence.set(`presence:${userUuid}`, "1", "EX", 60);
  pub.publish(
    `presence:${userUuid}`,
    JSON.stringify({ userUuid, status: "online" }),
  );

  const heartbeat = setInterval(() => {
    presence.set(`presence:${userUuid}`, "1", "EX", 60);
  }, 30_000);

  socket.on("chat:join", (chatUuid: string) => {
    socket.join(`chat:${chatUuid}`);
  });

  socket.on("chat:leave", (chatUuid: string) => {
    socket.leave(`chat:${chatUuid}`);
  });

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

httpServer.listen(PORT, () => {
  console.log(`[ws] listening on :${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("[ws] shutting down...");
  await pub.quit();
  await sub.quit();
  await presence.quit();
  httpServer.close(() => process.exit(0));
});
