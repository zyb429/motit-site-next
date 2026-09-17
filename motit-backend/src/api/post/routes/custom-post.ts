// src/api/post/routes/custom-post.ts
export default {
  routes: [
    {
      method: "POST",
      path: "/posts/with-relations",
      handler: "post.createWithRelations",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/posts/:id/with-relations",
      handler: "post.updateWithRelations",
      config: {
        policies: ["api::post.is-post-author"],
      },
    },
    {
      method: "GET",
      path: "/posts/author/:documentId",
      handler: "post.findAuthor",
      config: { auth: false },
    },
  ],
};
