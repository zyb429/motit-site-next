// motit-backend/src/api/category/routes/custom-category.ts
export default {
  routes: [
    {
      method: "GET",
      path: "/categories/by-post/:documentId",
      handler: "category.findByPost",
      config: { auth: false },
    },
  ],
};
