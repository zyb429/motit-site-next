"use strict";

module.exports = (plugin) => {
  // ============================================
  // Фильтрация user.find — убираем email и敏感 поля
  // ============================================
  const originalFind = plugin.controllers.user.find;

  plugin.controllers.user.find = async (ctx) => {
    if (!ctx.state.user) {
      return ctx.unauthorized("Не авторизован");
    }

    // Ограничиваем размер страницы
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

    // Свой профиль — полный доступ
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

    // Админ — любой профиль
    if (user.role?.type !== "admin" && Number(id) !== Number(user.id)) {
      return ctx.forbidden("Можно редактировать только свой профиль");
    }

    return originalUpdate(ctx);
  };

  return plugin;
};