export default {
  routes: [
    {
      method: 'GET',
      path: '/settings',
      handler: 'setting.find',
      config: {
        auth: false,  // Публичный доступ
      },
    },
    {
      method: 'GET',
      path: '/settings/:id',
      handler: 'setting.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/settings',
      handler: 'setting.create',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/settings/:id',
      handler: 'setting.update',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/settings/:id',
      handler: 'setting.delete',
      config: {
        auth: false,
      },
    },
  ],
};
