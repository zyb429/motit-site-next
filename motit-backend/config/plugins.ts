// config/plugins.ts
import type { Core } from '@strapi/strapi';

// Разрешенные типы файлов
const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

// Запрещенные типы файлов (исполняемые файлы)
const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable', // .exe
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
  'application/java-archive', // .jar
  'application/x-java-jnlp-file',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  // ============================================
  // Users & Permissions (JWT + аутентификация)
  // ============================================
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
        secure: env.bool('JWT_SECURE', false), // true для HTTPS
        maxAge: env.int('JWT_MAX_AGE', 7 * 24 * 60 * 60), // 7 дней
      },
    },
  },

  // ============================================
  // Upload (загрузка файлов)
  // ============================================
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
      providerOptions: {
        localServer: {
          maxAge: 3600000, // 1 час кеша
        },
      },
    },
  },

  // ============================================
  // Email (SMTP)
  // ============================================
  // email: {
  //   config: {
  //     provider: 'nodemailer',
  //     providerOptions: {
  //       host: env('SMTP_HOST', 'smtp.gmail.com'),
  //       port: env.int('SMTP_PORT', 587),
  //       secure: env.bool('SMTP_SECURE', false),
  //       auth: {
  //         user: env('SMTP_USER'),
  //         pass: env('SMTP_PASS'),
  //       },
  //       tls: {
  //         rejectUnauthorized: env.bool('SMTP_REJECT_UNAUTHORIZED', false),
  //       },
  //     },
  //     settings: {
  //       defaultFrom: env('SMTP_FROM_EMAIL'),
  //       defaultReplyTo: env('CONTACT_EMAIL'),
  //     },
  //   },
  // },

  // ============================================
  // GraphQL (если нужно)
  // ============================================
  // graphql: {
  //   config: {
  //     endpoint: '/graphql',
  //     shadowCRUD: true,
  //     playgroundAlways: true,
  //   },
  // },
});

export default config;