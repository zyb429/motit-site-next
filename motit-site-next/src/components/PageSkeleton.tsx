// components/PageSkeleton.tsx
export function PageSkeleton() {
  return (
    <div className="container mx-auto p-8 max-w-4xl animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-64 mb-6" />
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-32 bg-gray-200 rounded" />
          <div className="h-12 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
