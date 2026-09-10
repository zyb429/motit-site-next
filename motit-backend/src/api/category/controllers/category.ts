// motit-backend/src/api/category/controllers/category.ts
import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    async findByPost(ctx) {
      try {
        const { documentId } = ctx.params;

        if (!documentId) {
          return ctx.badRequest("Не указан documentId");
        }

        // 1. Находим post_id (published-версию)
        const post = await strapi.db
          .connection("posts")
          .where({ document_id: documentId })
          .whereNotNull("published_at")
          .first();

        if (!post) {
          // fallback — берём любую версию
          const anyPost = await strapi.db
            .connection("posts")
            .where({ document_id: documentId })
            .first();

          if (!anyPost) {
            return { data: [] };
          }

          const categoryIds = await strapi.db
            .connection("posts_categories_lnk")
            .where({ post_id: anyPost.id })
            .pluck("category_id");

          const categories = await strapi.db
            .connection("categories")
            .whereIn("id", categoryIds);

          return { data: categories };
        }

        // 2. Берём category_id из join-таблицы
        const categoryIds = await strapi.db
          .connection("posts_categories_lnk")
          .where({ post_id: post.id })
          .pluck("category_id");

        if (categoryIds.length === 0) {
          return { data: [] };
        }

        // 3. Забираем сами категории
        const categories = await strapi.db
          .connection("categories")
          .whereIn("id", categoryIds);

        return { data: categories };
      } catch (error: any) {
        strapi.log.error("❌ findByPost error:", error);
        return ctx.badRequest(error.message || "Ошибка получения категорий");
      }
    },
  }),
);
