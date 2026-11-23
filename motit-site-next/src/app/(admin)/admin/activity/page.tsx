import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ActivityHistoryClient } from "./ActivityHistoryClient";

export default async function ActivityPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/activity");
  }

  return <ActivityHistoryClient />;
}
