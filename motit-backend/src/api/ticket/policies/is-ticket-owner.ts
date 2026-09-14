import type { Core } from "@strapi/strapi";

export default async (
  policyContext: any,
  config: any,
  { strapi }: { strapi: Core.Strapi },
) => {
  const user = policyContext.state.user;
  if (!user) return false;

  const roleType = user.role?.type;
  if (
    roleType === "admin" ||
    roleType === "worker" ||
    roleType === "statistics"
  ) {
    return true;
  }

  const { id } = policyContext.params;
  if (!id) return false;

  const ticket = await strapi.documents("api::ticket.ticket").findOne({
    documentId: id,
    populate: ["client"],
  });

  if (!ticket?.client) return false;
  return Number(ticket.client.id) === Number(user.id);
};