export default ({ env }: any) => ({
  provider: 'sendmail',
  providerOptions: {
    host: env('SMTP_HOST', 'smtp.gmail.com'),
    port: env.int('SMTP_PORT', 587),
    secure: env.bool('SMTP_SECURE', false),
    auth: {
      user: env('SMTP_USER'),
      pass: env('SMTP_PASS'),
    },
    tls: {
      rejectUnauthorized: env.bool('SMTP_REJECT_UNAUTHORIZED', false),
    },
  },
  settings: {
    defaultFrom: env('SMTP_FROM_EMAIL'),
    defaultReplyTo: env('CONTACT_EMAIL'),
  },
});