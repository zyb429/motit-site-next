import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::ticket.ticket", {
  config: {
    find: {
      policies: ["api::ticket.is-ticket-owner"],
    },
    findOne: {
      policies: ["api::ticket.is-ticket-owner"],
    },
  },
});