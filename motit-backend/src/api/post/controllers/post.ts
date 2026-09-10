// src/api/post/controllers/post.ts
import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::post.post",
  ({ strapi }) => ({
    async updateWithRelations(ctx) {
      try {
        const { id } = ctx.params;
        const { data } = ctx.request.body as any;

        if (!id) return ctx.badRequest("Не указан id поста");
        if (!data || typeof data !== "object") {
          return ctx.badRequest("Отсутствует data");
        }

        const { categories, featured_image, ...rest } = data;

        const updateData: any = {
          ...rest,
          post_status: rest.post_status || "published",
          publishedAt: new Date().toISOString(),
        };

        // ✅ entityService: relation через set с documentId
        if (Array.isArray(categories)) {
          updateData.categories = {
            set: categories.map((docId: string) => ({
              documentId: docId,
            })),
          };
        }

        if (featured_image !== undefined && featured_image !== null) {
          updateData.featured_image = featured_image;
        }

        const strapiAny = strapi as any;

        // Находим числовой id по documentId
        const existing = await strapiAny.entityService.findMany(
          "api::post.post",
          {
            filters: { documentId: id } as any,
            limit: 1,
          },
        );

        if (!existing || existing.length === 0) {
          return ctx.notFound("Пост не найден");
        }

        const numericId = existing[0].id;

        await strapiAny.entityService.update("api::post.post", numericId, {
          data: updateData,
          populate: ["categories", "featured_image"],
        });

        // ✅ ОБХОД: entityService игнорирует author, обновляем author_id напрямую
        const currentUser = ctx.state.user;
        if (currentUser?.id) {
          await strapi.db
            .connection("posts")
            .where({ id: numericId })
            .update({ author_id: currentUser.id });
        }

        // Перечитываем пост с автором
        const refreshed = await strapiAny.entityService.findOne(
          "api::post.post",
          numericId,
          { populate: ["categories", "featured_image", "author"] },
        );

        return { data: refreshed };
      } catch (error: any) {
        strapi.log.error("❌ updateWithRelations error:", error);
        return ctx.badRequest(error.message || "Ошибка обновления поста");
      }
    },

    async createWithRelations(ctx) {
      try {
        const { data } = ctx.request.body as any;

        if (!data || typeof data !== "object") {
          return ctx.badRequest("Отсутствует data");
        }

        const { categories, featured_image, author, ...rest } = data;

        const createData: any = {
          ...rest,
          post_status: rest.post_status || "published",
          publishedAt: new Date().toISOString(),
        };

        if (Array.isArray(categories) && categories.length > 0) {
          createData.categories = {
            set: categories.map((docId: string) => ({
              documentId: docId,
            })),
          };
        }

        if (featured_image !== undefined && featured_image !== null) {
          createData.featured_image = featured_image;
        }

        const currentUser = ctx.state.user;
        if (currentUser?.id) {
          createData.author = currentUser.id;
        } else if (author) {
          createData.author = author;
        }

        const strapiAny = strapi as any;

        const newPost = await strapiAny.entityService.create("api::post.post", {
          data: createData,
          populate: ["categories", "featured_image"],
        });

        // ✅ ОБХОД: entityService игнорирует author, обновляем author_id напрямую
        if (currentUser?.id && newPost?.id) {
          await strapi.db
            .connection("posts")
            .where({ id: newPost.id })
            .update({ author_id: currentUser.id });
        }

        // Перечитываем пост с автором
        const refreshed = await strapiAny.entityService.findOne(
          "api::post.post",
          newPost.id,
          { populate: ["categories", "featured_image", "author"] },
        );

        return { data: refreshed };
      } catch (error: any) {
        strapi.log.error("❌ createWithRelations error:", error);
        return ctx.badRequest(error.message || "Ошибка создания поста");
      }
    },

    async findAuthor(ctx) {
      try {
        const { documentId } = ctx.params;
        if (!documentId) return ctx.badRequest("Не указан documentId");

        const post = await strapi.db
          .connection("posts")
          .where({ document_id: documentId })
          .first();

        if (!post || !post.author_id) return { data: null };

        const [user] = await strapi.db
          .connection("users")
          .where({ id: post.author_id });

        if (!user) return { data: null };

        return {
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            full_name: user.full_name,
          },
        };
      } catch (error: any) {
        strapi.log.error("findAuthor error:", error);
        return ctx.badRequest(error.message || "Ошибка");
      }
    },
  }),
);
