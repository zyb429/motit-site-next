import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";

interface CustomProviderOptions {
  sizeLimit?: number;
  basePath?: string;
}

const VALID_SUBFOLDERS = [
  "avatars",
  "posts",
  "partners",
  "certificates",
  "pages",
  "misc",
] as const;

type Subfolder = (typeof VALID_SUBFOLDERS)[number];

function resolveSubfolder(file: any): Subfolder {
  const name: string = file.name || "";
  const folder: string | undefined = file.folder;

  if (folder && (VALID_SUBFOLDERS as readonly string[]).includes(folder)) {
    return folder as Subfolder;
  }

  for (const sf of VALID_SUBFOLDERS) {
    if (name.startsWith(`${sf}/`)) return sf;
  }

  return "misc";
}

export default {
  init(providerOptions: CustomProviderOptions = {}) {
    const basePath = providerOptions.basePath ?? "public/uploads";

    return {
      async upload(file: any) {
        const subfolder = resolveSubfolder(file);
        const dir = path.join(process.cwd(), basePath, subfolder);

        await fs.promises.mkdir(dir, { recursive: true });

        const filename = `${file.hash}${path.extname(file.name)}`;
        const filepath = path.join(dir, filename);

        await pipeline(file.stream, fs.createWriteStream(filepath));

        file.url = `/uploads/${subfolder}/${filename}`;
        file.provider = "local-folders";

        return file; // ← обязательно
      },

      async uploadStream(file: any) {
        return this.upload(file);
      },

      async delete(file: any) {
        const subfolder = resolveSubfolder(file);
        const filename = `${file.hash}${path.extname(file.name)}`;
        const filepath = path.join(
          process.cwd(),
          basePath,
          subfolder,
          filename,
        );
        if (fs.existsSync(filepath)) {
          await fs.promises.unlink(filepath);
        }
      },

      async checkFileSize() {
        return true;
      },

      async getSignedUrl(file: any) {
        return { url: file.url };
      },

      async isPrivate() {
        return false;
      },
    };
  },
};