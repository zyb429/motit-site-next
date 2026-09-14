import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::ticket-comment.ticket-comment", {
  config: {
    update: {
      policies: ["api::ticket-comment.is-ticket-comment-author"],
    },
    delete: {
      policies: ["api::ticket-comment.is-ticket-comment-author"],
    },
  },
});