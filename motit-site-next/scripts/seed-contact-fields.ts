import { PrismaClient } from "@generated/prisma";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const fields = [
  { name: "name", label: "Имя и фамилия", type: "text", required: true, placeholder: "Введите имя и фамилию", sortOrder: 0 },
  { name: "company_name", label: "Название компании", type: "text", required: true, placeholder: "Название компании", sortOrder: 1 },
  { name: "job_title", label: "Ваша должность", type: "text", required: false, placeholder: "Ваша должность", sortOrder: 2 },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "example@gmail.com", sortOrder: 3 },
  { name: "phone", label: "Телефон", type: "tel", required: true, placeholder: "+375 (__) ___ __ __", sortOrder: 4 },
  { name: "message", label: "Сообщение", type: "textarea", required: false, placeholder: "Расскажите нам о своей задаче", sortOrder: 5 },
];

async function main() {
  await prisma.contactFormField.deleteMany({});
  await prisma.contactFormField.createMany({ data: fields });
  console.log("contact fields seeded");
}

main().catch(console.error).finally(() => prisma.$disconnect());