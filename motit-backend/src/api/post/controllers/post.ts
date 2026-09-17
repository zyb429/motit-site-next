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
        };

        // publishedAt управляем явно:
        // - publishedAt: null  → снять с публикации
        // - post_status: published → поставить текущую дату
        // - иначе (draft/archived) → не трогать дату
        if (rest.publishedAt === null) {
          updateData.publishedAt = null;
        } else if (rest.post_status === "published") {
          updateData.publishedAt = new Date().toISOString();
        }

        if (Array.isArray(categories)) {
          updateData.categories = {
            set: categories.map((docId: string) => ({ documentId: docId })),
          };
        }

        if (featured_image !== undefined && featured_image !== null) {
          updateData.featured_image = featured_image;
        }

        const currentUser = ctx.state.user;
        if (currentUser?.id) {
          updateData.author = currentUser.id;
        }

        const strapiAny = strapi as any;

        const existing = await strapiAny.entityService.findMany(
          "api::post.post",
          { filters: { documentId: id } as any, limit: 1 },
        );

        if (!existing || existing.length === 0) {
          return ctx.notFound("Пост не найден");
        }

        const numericId = existing[0].id;

        const updated = await strapiAny.entityService.update(
          "api::post.post",
          numericId,
          {
            data: updateData,
            populate: [
              "categories",
              "featured_image",
              "author",
              "author.avatar",
            ],
          },
        );

        return { data: updated };
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
          post_status: rest.post_status || "draft",
        };

        // publishedAt только если публикуем
        if (createData.post_status === "published") {
          createData.publishedAt = new Date().toISOString();
        } else {
          createData.publishedAt = null;
        }

        if (Array.isArray(categories) && categories.length > 0) {
          createData.categories = {
            set: categories.map((docId: string) => ({ documentId: docId })),
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
          populate: ["categories", "featured_image", "author", "author.avatar"],
        });

        return { data: newPost };
      } catch (error: any) {
        strapi.log.error("❌ createWithRelations error:", error);
        return ctx.badRequest(error.message || "Ошибка создания поста");
      }
    },

    async findAuthor(ctx) {
      try {
        const { documentId } = ctx.params;
        if (!documentId) return ctx.badRequest("Не указан documentId");

        const posts = await (strapi as any).entityService.findMany(
          "api::post.post",
          {
            filters: { documentId } as any,
            populate: ["author", "author.avatar"],
            limit: 1,
          },
        );

        if (!posts?.length) return { data: null };

        const author = posts[0].author;
        if (!author) return { data: null };

        return {
          data: {
            id: author.id,
            documentId: author.documentId,
            username: author.username,
            email: author.email,
            firstname: author.firstname,
            lastname: author.lastname,
            full_name: author.full_name,
            bio: author.bio,
            avatar: author.avatar,
          },
        };
      } catch (error: any) {
        strapi.log.error("findAuthor error:", error);
        return ctx.badRequest(error.message || "Ошибка");
      }
    },
  }),
);
