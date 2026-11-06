// src/app/(admin)/admin/settings/privacy-policy/page.tsx
import { getPrivacyPolicy } from "@/lib/db/privacy";
import { PrivacyEditorClient } from "./PrivacyEditorClient";

export const dynamic = "force-dynamic";

export default async function PrivacySettingsPage() {
  const policy = await getPrivacyPolicy();

  const initialFile = policy?.file
    ? {
        id: policy.file.id,
        url: policy.file.url,
        name: policy.fileName ?? policy.file.name ?? "file",
      }
    : null;

  return (
    <PrivacyEditorClient
      initialContent={policy?.content ?? null}
      initialMode={
        policy?.displayMode === "document"
          ? "document"
          : policy?.displayMode === "file"
            ? "file"
            : "page"
      }
      initialFile={initialFile}
    />
  );
}