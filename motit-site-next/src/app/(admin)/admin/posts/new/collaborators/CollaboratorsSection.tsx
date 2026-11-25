import { getPostAccess, getPostCollaborators } from "@/lib/posts/access";
import { AddCollaboratorForm } from "./AddCollaboratorForm";
import { RemoveCollaboratorButton } from "./RemoveCollaboratorButton";

export default async function CollaboratorsSection({
  postId,
}: {
  postId: string;
}) {
  const access = await getPostAccess(postId);

  if (!access.canView) {
    return null;
  }

  const collaborators = await getPostCollaborators(postId);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Соавторы
        </h2>

        <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
          {collaborators.length}
        </span>
      </div>

      <AddCollaboratorForm postId={postId} />

      {collaborators.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-primary)] px-3 py-4 text-center text-xs text-[var(--text-muted)]">
          Соавторы пока не добавлены
        </p>
      ) : (
        <ul className="space-y-2">
          {collaborators.map((collaborator) => (
            <li
              key={collaborator.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3 transition-colors hover:border-[var(--accent)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--text-primary)]">
                {collaborator.user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={collaborator.user.avatar_url}
                    alt={collaborator.user.username ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (collaborator.user.full_name || collaborator.user.username)
                    ?.slice(0, 2)
                    .toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {collaborator.user.full_name || collaborator.user.username}
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {collaborator.user.email}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    collaborator.role === "viewer"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {collaborator.role === "viewer" ? "Наблюдатель" : "Редактор"}
                </span>

                {access.canManageCollaborators && (
                  <RemoveCollaboratorButton
                    postId={postId}
                    collaboratorId={collaborator.id}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}