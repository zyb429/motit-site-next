// src/app/(cabinet)/cabinet/organizations/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/cabinet/organizations");

  const organizations = await prisma.client_organizations.findMany({
    where: { client_user_uuid: user.uuid },
    include: { organizations: true },
    orderBy: [{ is_primary: "desc" }, { joined_at: "desc" }],
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-(--text-primary) flex items-center gap-2">
        <Building2 size={22} className="text-(--accent)" />
        Мои организации
      </h1>
      <p className="text-(--text-secondary) text-sm mt-1">
        Организации, к которым вы привязаны
      </p>

      {organizations.length === 0 ? (
        <div className="mt-8 p-8 text-center rounded-xl bg-(--bg-card) border border-(--border)">
          <Building2 size={40} className="text-(--text-muted) mx-auto mb-3" />
          <p className="text-(--text-secondary)">
            Вы пока не привязаны ни к одной организации.
          </p>
          <p className="text-(--text-muted) text-xs mt-2">
            Обратитесь в поддержку, чтобы вас привязали к организации.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {organizations.map((co) => {
            const org = co.organizations;
            return (
              <div
                key={co.organization_uuid}
                className="p-5 rounded-xl bg-(--bg-card) border border-(--border)"
              >
                {/* Заголовок карточки */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-(--text-primary) truncate">
                      {org.name}
                    </h2>
                    <p className="text-xs text-(--text-secondary) mt-0.5">
                      Роль: {co.role_in_company || "member"}
                      {org.inn && ` · ИНН: ${org.inn}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {co.is_primary && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-(--accent-dim) text-(--accent) border border-(--border)">
                        основная
                      </span>
                    )}
                    {!org.is_active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        неактивна
                      </span>
                    )}
                  </div>
                </div>

                {/* Контакты */}
                {(org.email || org.phone || org.address) && (
                  <div className="mt-3 pt-3 border-t border-(--border) space-y-1.5">
                    {org.email && (
                      <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                        <Mail size={14} className="text-(--accent) shrink-0" />
                        <a
                          href={`mailto:${org.email}`}
                          className="hover:text-(--accent) transition-colors truncate"
                        >
                          {org.email}
                        </a>
                      </div>
                    )}
                    {org.phone && (
                      <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                        <Phone size={14} className="text-(--accent) shrink-0" />
                        <a
                          href={`tel:${org.phone}`}
                          className="hover:text-(--accent) transition-colors"
                        >
                          {org.phone}
                        </a>
                      </div>
                    )}
                    {org.address && (
                      <div className="flex items-start gap-2 text-sm text-(--text-secondary)">
                        <MapPin
                          size={14}
                          className="text-(--accent) shrink-0 mt-0.5"
                        />
                        <span>{org.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
