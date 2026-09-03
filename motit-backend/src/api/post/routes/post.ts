export default {
  routes: [
    {
      method: 'GET',
      path: '/posts',
      handler: 'post.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/posts/:id',
      handler: 'post.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/posts',
      handler: 'post.create',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/posts/:id',
      handler: 'post.update',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/posts/:id',
      handler: 'post.delete',
      config: {
        auth: false,
      },
    },
  ],
};