CREATE DATABASE IF NOT EXISTS motit_site_shadow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON motit_site_shadow.* TO 'motit_user'@'%';
FLUSH PRIVILEGES;