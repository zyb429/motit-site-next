import { getPostsPrisma } from "../src/lib/db/posts";
import { getCategoriesPrisma } from "../src/lib/db/categories";
import { getUsersPrisma, getRolesPrisma } from "../src/lib/db/users";
import { getAllSettingsPrisma } from "../src/lib/db/settings";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== POSTS ===");
  const posts = await getPostsPrisma({ take: 5 });
  console.log(posts.map(p => ({
    id: p.id,
    title: p.title,
    status: p.post_status,
    author: p.author?.username,
    cats: p.categories.map(c => c.name),
  })));

  console.log("\n=== CATEGORIES ===");
  console.log(await getCategoriesPrisma());

  console.log("\n=== USERS ===");
  console.log((await getUsersPrisma()).map(u => ({
    id: u.id, username: u.username, role: u.role?.name,
  })));

  console.log("\n=== ROLES ===");
  console.log(await getRolesPrisma());

  console.log("\n=== SETTINGS ===");
  console.log(await getAllSettingsPrisma());
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
