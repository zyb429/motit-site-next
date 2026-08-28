import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export const GET = async () => {
  const draft = await draftMode();
  draft.disable();
  redirect("/");
};