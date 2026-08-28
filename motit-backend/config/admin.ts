import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET')!,
  },
  apiToken: {
    salt: env('API_TOKEN_SALT')!,
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT')!,
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY')!,
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: [env('CLIENT_URL', 'http://localhost:3000')],
      // ✅ Используем правильную типизацию для handler
      async handler(uid: any, { documentId, locale, status }: any) {
        try {
          // ✅ Используем any для обхода строгой типизации ContentType
          const document = await strapi.documents(uid as any).findOne({
            documentId,
            populate: '*',
          });

          // ✅ Получаем slug безопасно
          const slug = (document as any)?.slug || (document as any)?.id || '';

          const urlSearchParams = new URLSearchParams({
            secret: env('PREVIEW_SECRET', 'default-secret'),
            uid,
            status: status || 'draft',
            ...(slug && { slug: String(slug) }),
            ...(locale && { locale }),
          });

          const previewURL = `${env('CLIENT_URL', 'http://localhost:3000')}/api/preview?${urlSearchParams}`;

          return previewURL;
        } catch (error) {
          console.error('Preview handler error:', error);
          return env('CLIENT_URL', 'http://localhost:3000');
        }
      },
    },
  },
});

export default config;