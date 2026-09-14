import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::ticket.ticket",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("Не авторизован");

      const roleType = user.role?.type;

      // Копируем тело, чтобы не мутировать оригинал
      const body = { ...ctx.request.body };
      body.data = { ...(body.data || {}) };

      if (roleType === "client") {
        // Клиент создаёт тикет только на себя
        body.data.client = user.id;
      } else if (roleType === "worker" || roleType === "admin") {
        // Работник/админ может указать client в теле
        if (body.data.client) {
          const client = await strapi
            .query("plugin::users-permissions.user")
            .findOne({ where: { id: body.data.client } });

          if (!client) {
            return ctx.badRequest("Указанный клиент не найден");
          }
        }
        // Если client не указан — тикет без клиента (внутренняя задача)
      } else {
        return ctx.forbidden("Роль не может создавать тикеты");
      }

      ctx.request.body = body;
      return await super.create(ctx);
    },
  })
);