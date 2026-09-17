export default async (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;
  if (!user) return false;

  // Админ может всё
  const roleName = (user.role?.name ?? user.role?.type ?? "").toLowerCase();
  if (roleName === "admin") return true;

  const { id } = policyContext.params;
  if (!id) return false;

  // Найти пост и проверить автора
  try {
    const post = await strapi.entityService.findOne("api::post.post", id, {
      populate: ["author"],
    });
    if (!post) return false;

    const authorId = post.author?.id ?? post.author?.data?.id;
    return authorId === user.id;
  } catch (err) {
    strapi.log.error("[is-post-author] error:", err);
    return false;
  }
};
