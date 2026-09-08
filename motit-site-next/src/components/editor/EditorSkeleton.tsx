export function EditorSkeleton() {
  return (
    <div className="min-h-75 border rounded-lg p-4 animate-pulse bg-white">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="h-8 w-10 bg-gray-200 rounded" />
          <div className="h-8 w-10 bg-gray-200 rounded" />
          <div className="h-8 w-10 bg-gray-200 rounded" />
          <div className="w-px h-8 bg-gray-300" />
          <div className="h-8 w-12 bg-gray-200 rounded" />
          <div className="h-8 w-12 bg-gray-200 rounded" />
        </div>
        <div className="h-px bg-gray-200" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
