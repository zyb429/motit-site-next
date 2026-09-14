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

  const comment = await strapi
    .documents("api::ticket-comment.ticket-comment")
    .findOne({
      documentId: id,
      populate: ["user"],
    });

  if (!comment?.user) return false;
  return Number(comment.user.id) === Number(user.id);
};