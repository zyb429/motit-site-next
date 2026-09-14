import type { Core } from "@strapi/strapi";

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use((context: any, next: () => Promise<any>) => {
      const user = context.params?.state?.user;
      if (!user) return next();

      const roleType = user.role?.type;

      if (
        context.uid === "api::ticket.ticket" &&
        context.action === "findMany" &&
        roleType === "client"
      ) {
        context.params.filters = {
          ...(context.params.filters || {}),
          client: { id: user.id },
        };
      }

      if (
        context.uid === "api::ticket-comment.ticket-comment" &&
        context.action === "findMany" &&
        roleType === "client"
      ) {
        context.params.filters = {
          ...(context.params.filters || {}),
          ticket: { client: { id: user.id } },
        };
      }

      return next();
    });
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info("[bootstrap] Custom policies and middlewares loaded");
  },
};