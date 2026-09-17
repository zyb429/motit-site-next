// motit-backend/src/api/user-role/routes/user-role.ts
export default {
  routes: [
    {
      method: "PUT",
      path: "/admin-users/:id/role",
      handler: "user-role.updateRole",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/admin-users/:id/update", // ← добавили /update
      handler: "user-role.updateUser",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
