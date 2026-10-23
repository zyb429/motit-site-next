"use client"

type LinkItem = {
  label: string
  href: string
  external?: boolean
}

export default function FooterNav({
  title,
  links,
}: {
  title: string
  links: LinkItem[]
}) {
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const el = document.getElementById(href.slice(1))
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div>
      <h4
        className="text-sm font-semibold uppercase tracking-wider mb-4"
        style={{ color: "#e0f7fa" }}
      >
        {title}
      </h4>
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            onClick={(e) => handleNavClick(e, link.href)}
            className="text-sm transition-colors duration-100 hover:text-[#2dd4bf]"
            style={{ color: "rgba(128, 222, 234, 0.6)" }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}