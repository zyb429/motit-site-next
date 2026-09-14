import type { Core } from "@strapi/strapi";

export default async (
  policyContext: any,
  config: any,
  { strapi }: { strapi: Core.Strapi },
) => {
  const user = policyContext.state.user;
  if (!user) return false;

  if (user.role?.type === "admin") return true;

  const { id } = policyContext.params;
  if (!id) return false;

  const post = await strapi.documents("api::post.post").findOne({
    documentId: id,
    populate: ["author"],
  });

  if (!post?.author) return false;
  return Number(post.author.id) === Number(user.id);
};