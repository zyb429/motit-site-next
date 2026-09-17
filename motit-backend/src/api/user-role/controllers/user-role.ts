// motit-backend/src/api/user-role/controllers/user-role.ts
import { factories } from "@strapi/strapi";
import jwt from "jsonwebtoken";

export default factories.createCoreController(
  "api::user-role.user-role" as any,
  ({ strapi }) => {
    // Общая функция — читает JWT, возвращает caller или ошибку
    async function getCaller(ctx: any) {
      const authHeader = ctx.request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { error: ctx.unauthorized("Нет токена") };
      }
      const token = authHeader.slice(7);

      let payload: any;
      try {
        const secret =
          process.env.JWT_SECRET ||
          strapi.config.get("plugin.users-permissions.jwtSecret");
        payload = jwt.verify(token, secret as string);
      } catch (err: any) {
        strapi.log.error("[user-role] jwt verify:", err?.message);
        return { error: ctx.unauthorized("Невалидный токен") };
      }

      const userId = payload.id;
      if (!userId) {
        return { error: ctx.unauthorized("Токен без id пользователя") };
      }

      const caller: any = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: userId },
          populate: ["role"],
        });

      if (!caller || caller.blocked) {
        return {
          error: ctx.unauthorized("Пользователь не найден или заблокирован"),
        };
      }
      if (!caller.role || caller.role.type !== "admin") {
        return { error: ctx.forbidden("Только администратор") };
      }

      return { caller, userId };
    }

    return {
      // ==================== Смена роли ====================
      async updateRole(ctx: any) {
        const { error, userId } = await getCaller(ctx);
        if (error) return error;

        const { id } = ctx.params;
        const body = ctx.request.body || {};
        const { roleId } = body;

        if (!id || roleId == null) {
          return ctx.badRequest("Нужны id пользователя и roleId");
        }

        if (String(userId) === String(id)) {
          return ctx.badRequest("Нельзя изменить свою собственную роль");
        }

        const role: any = await strapi.db
          .query("plugin::users-permissions.role")
          .findOne({ where: { id: Number(roleId) } });

        if (!role) {
          return ctx.badRequest("Роль не найдена");
        }

        await strapi.db.query("plugin::users-permissions.user").update({
          where: { id: Number(id) },
          data: { role: Number(roleId) },
        });

        const updated: any = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: Number(id) },
            populate: ["role", "avatar"],
          });

        return {
          data: {
            id: updated.id,
            documentId: updated.documentId,
            username: updated.username,
            email: updated.email,
            full_name: updated.full_name,
            blocked: updated.blocked,
            role: updated.role
              ? {
                  id: updated.role.id,
                  name: updated.role.name,
                  type: updated.role.type,
                }
              : null,
          },
        };
      },

      // ==================== Обновление пользователя (blocked, name, phone) ====================
      async updateUser(ctx: any) {
        const { error, userId } = await getCaller(ctx);
        if (error) return error;

        const { id } = ctx.params;
        if (!id) return ctx.badRequest("Нет id");

        const body = ctx.request.body || {};
        const data: Record<string, unknown> = {};

        if (body.blocked !== undefined) {
          if (String(userId) === String(id) && body.blocked === true) {
            return ctx.badRequest("Нельзя заблокировать самого себя");
          }
          data.blocked = body.blocked;
        }
        if (body.full_name !== undefined) data.full_name = body.full_name;
        if (body.phone !== undefined) data.phone = body.phone;

        if (Object.keys(data).length === 0) {
          return ctx.badRequest("Нет данных");
        }

        await strapi.db.query("plugin::users-permissions.user").update({
          where: { id: Number(id) },
          data,
        });

        const updated: any = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: Number(id) },
            populate: ["role", "avatar"],
          });

        return {
          data: {
            id: updated.id,
            documentId: updated.documentId,
            username: updated.username,
            email: updated.email,
            full_name: updated.full_name,
            blocked: updated.blocked,
            role: updated.role
              ? {
                  id: updated.role.id,
                  name: updated.role.name,
                  type: updated.role.type,
                }
              : null,
          },
        };
      },
    };
  },
);
