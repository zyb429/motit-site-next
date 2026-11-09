// src/app/(admin)/admin/categories/new/page.tsx
import CategoryForm from "./CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="grid w-full place-items-center px-4 py-6">
      <CategoryForm />
    </div>
  );
}