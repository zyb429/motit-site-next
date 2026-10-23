// scripts/seed-languages.ts
import { all } from "lowlight"
import { prisma } from "../src/lib/prisma"

const POPULAR = new Set([
  "plaintext",
  "javascript",
  "typescript",
  "html",
  "xml",
  "css",
  "scss",
  "json",
  "yaml",
  "bash",
  "shell",
  "powershell",
  "python",
  "java",
  "csharp",
  "cpp",
  "c",
  "go",
  "rust",
  "php",
  "ruby",
  "sql",
  "dockerfile",
  "nginx",
  "markdown",
  "graphql",
  "kotlin",
  "swift",
])

const LABELS: Record<string, string> = {
  plaintext: "Plain text",
  javascript: "JavaScript",
  typescript: "TypeScript",
  html: "HTML",
  xml: "XML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  yaml: "YAML",
  bash: "Bash",
  shell: "Shell",
  powershell: "PowerShell",
  python: "Python",
  java: "Java",
  csharp: "C#",
  cpp: "C++",
  c: "C",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  sql: "SQL",
  dockerfile: "Dockerfile",
  nginx: "Nginx",
  markdown: "Markdown",
  graphql: "GraphQL",
  kotlin: "Kotlin",
  swift: "Swift",
}

function labelFor(code: string) {
  return LABELS[code] ?? code.charAt(0).toUpperCase() + code.slice(1)
}

async function main() {
  const codes = Object.keys(all).sort((a, b) => a.localeCompare(b))
  console.log(`Найдено ${codes.length} языков в highlight.js`)

  let created = 0
  let updated = 0

  for (const code of codes) {
    const existing = await prisma.codeLanguage.findUnique({ where: { code } })
    const data = {
      code,
      label: labelFor(code),
      enabled: POPULAR.has(code),
      sortOrder: POPULAR.has(code) ? 0 : 100,
    }

    if (existing) {
      await prisma.codeLanguage.update({ where: { code }, data })
      updated++
    } else {
      await prisma.codeLanguage.create({ data })
      created++
    }
  }

  console.log(`Готово: создано ${created}, обновлено ${updated}`)
  console.log(
    `Включено по умолчанию: ${codes.filter((c) => POPULAR.has(c)).length}`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })