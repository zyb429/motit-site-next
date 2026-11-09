// src/app/(cabinet)/cabinet/tickets/new/[category]/NewTicketFormWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const NewTicketForm = dynamic(
  () =>
    import("@/components/helpdesk/NewTicketForm").then(
      (mod) => mod.NewTicketForm,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mt-8 text-center py-16 text-(--text-muted)">
        Загрузка формы...
      </div>
    ),
  },
);

interface Props {
  defaultFullName: string;
  defaultEmail: string;
  defaultPhone: string;
  organizations: {
    uuid: string;
    name: string;
    inn: string | null;
    isPrimary: boolean;
  }[];
  categoryUuid: string;
}

export function NewTicketFormWrapper(props: Props) {
  return <NewTicketForm {...props} />;
}