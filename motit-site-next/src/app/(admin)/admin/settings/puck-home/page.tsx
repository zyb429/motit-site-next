import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPuckDoc } from "@/lib/db/puck";
import { PuckEditorLoader } from "@/components/admin/PuckEditorLoader";

export default async function PuckHomePage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/login");
  const data = await getPuckDoc("puck_home");
  return <PuckEditorLoader storageKey="puck_home" initial={data} />;
}