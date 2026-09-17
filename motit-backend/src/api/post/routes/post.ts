// src/api/post/routes/post.ts
import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::post.post", {
  config: {
    update: {
      policies: ["api::post.is-post-author"],
    },
    delete: {
      policies: ["api::post.is-post-author"],
    },
  },
});
