import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPuckDoc } from "@/lib/db/puck";
import { PuckEditorShell } from "@/components/admin/PuckEditorShell";

export default async function PuckHeaderPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/login");
  const data = await getPuckDoc("puck_header");
  return <PuckEditorShell storageKey="puck_header" initial={data} />;
}