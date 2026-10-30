import type { Config } from "@puckeditor/core";
import { createFooterConfig } from "@/lib/puck/footerConfig";
import { createHeaderConfig } from "@/lib/puck/headerConfig";
import { createHomeConfig } from "@/lib/puck/homeConfig";
import type { SocialOption } from "@/lib/social-options";

/**
 * Полный конфиг Puck-редактора.
 * Все компоненты (header, home, footer) доступны на любой из страниц.
 * socialOptions — актуальные опции соцсетей из БД (через mergeSocialOptions).
 */
export function createPuckConfig(socialOptions: SocialOption[]): Config {
  const home = createHomeConfig();
  const header = createHeaderConfig();
  const footer = createFooterConfig(socialOptions);

  return {
    components: {
      ...home.components,
      ...header.components,
      ...footer.components,
    },
  } as Config;
}
