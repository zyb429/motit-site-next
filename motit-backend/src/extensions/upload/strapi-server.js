"use strict";

module.exports = (plugin) => {
  // ============================================
  // Перехват upload — запоминаем владельца файла
  // ============================================
  const originalUpload = plugin.controllers["content-api"].upload;

  plugin.controllers["content-api"].upload = async (ctx) => {
    const user = ctx.state.user;
    const result = await originalUpload(ctx);

    if (!user?.id) return result;

    // Нормализуем результат (Strapi 5 может вернуть массив или объект)
    const files = Array.isArray(result) ? result : [result];
    const fileIds = files.map((f) => f?.id).filter(Boolean);

    if (fileIds.length === 0) return result;

    // Сохраняем владельца
    for (const fileId of fileIds) {
      await strapi.db.query("api::file-owner.file-owner").create({
        data: {
          file_id: fileId,
          user_id: user.id,
        },
      });
    }

    return result;
  };

  // ============================================
  // Перехват destroy — проверяем владельца
  // ============================================
  const originalDestroy = plugin.controllers["content-api"].destroy;

  plugin.controllers["content-api"].destroy = async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("Не авторизован");

    const { id } = ctx.params;
    if (!id) return ctx.badRequest("Не указан id файла");

    // Админ — удаляет любой файл
    if (user.role?.type === "admin") {
      // Чистим связь
      await strapi.db.query("api::file-owner.file-owner").deleteMany({
        where: { file_id: Number(id) },
      });
      return originalDestroy(ctx);
    }

    // Проверяем владельца
    const ownership = await strapi
      .db.query("api::file-owner.file-owner")
      .findOne({
        where: { file_id: Number(id), user_id: user.id },
      });

    if (!ownership) {
      return ctx.forbidden("Можно удалять только свои файлы");
    }

    // Удаляем связь и файл
    await strapi.db.query("api::file-owner.file-owner").delete({
      where: { id: ownership.id },
    });

    return originalDestroy(ctx);
  };

  return plugin;
};