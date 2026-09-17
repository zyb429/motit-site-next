// motit-backend/src/extensions/users-permissions/strapi-server.js
"use strict";

module.exports = (plugin) => {
  // ============================================
  // Фильтрация user.find — убираем email и чувствительные поля
  // ============================================
  const originalFind = plugin.controllers.user.find;

  plugin.controllers.user.find = async (ctx) => {
    if (!ctx.state.user) {
      return ctx.unauthorized("Не авторизован");
    }

    ctx.query = {
      ...ctx.query,
      pagination: {
        pageSize: 20,
        ...(ctx.query?.pagination || {}),
      },
    };

    const result = await originalFind(ctx);

    const sanitize = (user) => ({
      id: user.id,
      documentId: user.documentId,
      username: user.username,
      full_name: user.full_name,
      firstname: user.firstname,
      lastname: user.lastname,
      avatar: user.avatar,
      bio: user.bio,
    });

    if (Array.isArray(result)) {
      return result.map(sanitize);
    }
    if (Array.isArray(result?.data)) {
      return { ...result, data: result.data.map(sanitize) };
    }
    return result;
  };

  // ============================================
  // Фильтрация user.findOne — тоже без email
  // ============================================
  const originalFindOne = plugin.controllers.user.findOne;

  plugin.controllers.user.findOne = async (ctx) => {
    if (!ctx.state.user) {
      return ctx.unauthorized("Не авторизован");
    }

    const result = await originalFindOne(ctx);

    if (!result) return result;

    const user = result.data || result;

    if (Number(user.id) === Number(ctx.state.user.id)) {
      return result;
    }

    const sanitize = (u) => ({
      id: u.id,
      documentId: u.documentId,
      username: u.username,
      full_name: u.full_name,
      firstname: u.firstname,
      lastname: u.lastname,
      avatar: u.avatar,
      bio: u.bio,
    });

    if (result.data) {
      return { ...result, data: sanitize(result.data) };
    }
    return sanitize(result);
  };

  // ============================================
  // Ограничение user.update — только свой профиль
  // ============================================
  const originalUpdate = plugin.controllers.user.update;

  plugin.controllers.user.update = async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("Не авторизован");

    const { id } = ctx.params;

    if (user.role?.type !== "admin" && Number(id) !== Number(user.id)) {
      return ctx.forbidden("Можно редактировать только свой профиль");
    }

    return originalUpdate(ctx);
  };

  // ============================================
  // ✅ Смена роли пользователя (только для админа)
  // Публичный PUT /api/users/:id не пропускает поле role,
  // поэтому делаем кастомный эндпоинт через entityService.
  // ============================================
  plugin.controllers.user.updateRole = async (ctx) => {
    const { id } = ctx.params;
    const { roleId } = ctx.request.body || {};

    if (!ctx.state.user) {
      return ctx.unauthorized("Не авторизован");
    }

    const callerRole = ctx.state.user.role;
    const isAdmin = callerRole && callerRole.type === "admin";
    if (!isAdmin) {
      return ctx.forbidden("Только администратор может менять роли");
    }

    if (!id || roleId == null) {
      return ctx.badRequest("Нужны id пользователя и roleId");
    }

    // Запрет менять свою собственную роль
    if (String(ctx.state.user.id) === String(id)) {
      return ctx.badRequest("Нельзя изменить свою собственную роль");
    }

    // Проверяем, что роль существует
    let role;
    try {
      role = await strapi.entityService.findOne(
        "plugin::users-permissions.role",
        Number(roleId),
      );
    } catch {
      return ctx.badRequest("Ошибка поиска роли");
    }

    if (!role) {
      return ctx.badRequest("Роль не найдена");
    }

    try {
      const updated = await strapi.entityService.update(
        "plugin::users-permissions.user",
        Number(id),
        {
          data: { role: Number(roleId) },
          populate: ["role", "avatar"],
        },
      );

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
    } catch (err) {
      strapi.log.error("[updateRole] error:", err);
      return ctx.badRequest(err.message || "Ошибка обновления роли");
    }
  };

  // Регистрируем кастомный роут
  plugin.routes["content-api"].routes.push({
    method: "PUT",
    path: "/users/:id/role",
    handler: "user.updateRole",
    config: {
      prefix: "",
      policies: [],
    },
  });

  return plugin;
};
