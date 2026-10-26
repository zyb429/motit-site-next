"use client";

import Link from "next/link";

type FooterLink = { label: string; href: string; external: boolean };
type FooterContact = { icon: "phone" | "mail" | "map-pin" | "user"; text: string; href: string };
type FooterSupport = {
  enabled: boolean;
  text: string;
  button_label: string;
  button_href: string;
  button_icon: boolean;
};

export type FooterBlockProps = {
  logoText: string;
  logoHref: string;
  logoImageUrl: string | null;
  description: string;
  columns: Array<{
    title: string;
    type: "links" | "contacts" | "support";
    links: FooterLink[];
    contacts: FooterContact[];
    support?: FooterSupport;
  }>;
  social: Array<{ name: string; href: string }>;
  copyright: string;
};

export function FooterBlock(props: FooterBlockProps) {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid gap-8 md:grid-cols-[1.5fr_repeat(auto-fit,minmax(140px,1fr))]">
        <div>
          <Link href={props.logoHref || "/"} className="flex items-center gap-3">
            {props.logoImageUrl ? (
              <img src={props.logoImageUrl} alt="" className="h-10 w-auto" />
            ) : (
              <span className="text-lg font-bold">{props.logoText}</span>
            )}
          </Link>
          {props.description && (
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-xs">{props.description}</p>
          )}
          {props.social.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {props.social.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer"
                   className="text-xs px-2 py-1 rounded border border-[var(--border)] hover:text-[var(--accent)]">
                  {s.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {props.columns.map((col, ci) => (
          <div key={ci}>
            <h3 className="text-sm font-semibold mb-3">{col.title}</h3>
            {col.type === "links" && (
              <ul className="space-y-2">
                {col.links.map((l, li) => (
                  <li key={li}>
                    <a href={l.href} target={l.external ? "_blank" : undefined}
                       rel={l.external ? "noreferrer" : undefined}
                       className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {col.type === "contacts" && (
              <ul className="space-y-2">
                {col.contacts.map((c, ci2) => (
                  <li key={ci2}>
                    <a href={c.href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
                      {c.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {col.type === "support" && col.support?.enabled && (
              <div className="space-y-2">
                {col.support.text && <p className="text-xs text-[var(--text-secondary)]">{col.support.text}</p>}
                <a href={col.support.button_href}
                   className="inline-block px-3 py-2 rounded bg-[var(--accent)] text-white text-xs">
                  {col.support.button_label}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs text-[var(--text-muted)]">
          {props.copyright}
        </div>
      </div>
    </footer>
  );
}