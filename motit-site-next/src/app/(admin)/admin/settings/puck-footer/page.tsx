import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPuckDoc } from "@/lib/db/puck";
import { prisma } from "@/lib/prisma";
import { mergeSocialOptions } from "@/lib/social-options";
import { PuckEditorShell } from "@/components/admin/PuckEditorShell";

export const dynamic = "force-dynamic";

export default async function PuckFooterPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/login");

  const [data, socialRow] = await Promise.all([
    getPuckDoc("puck_footer"),
    prisma.globalSettings.findUnique({ where: { key: "social_options" } }),
  ]);
  const socialOptions = mergeSocialOptions(socialRow?.value);

  return (
    <PuckEditorShell
      storageKey="puck_footer"
      initial={data}
      initialSocialOptions={socialOptions}
    />
  );
}