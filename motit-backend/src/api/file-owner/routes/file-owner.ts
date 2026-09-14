import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::file-owner.file-owner", {
  only: [],
  config: {
    find: { auth: false, policies: [] },
    findOne: { auth: false, policies: [] },
  },
});