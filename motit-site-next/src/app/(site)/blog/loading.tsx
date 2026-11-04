import { Container } from "@/components/ui";

export default function BlogLoading() {
  return (
    <Container className="py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-(--bg-card-hover) rounded w-48 mb-4" />
        <div className="h-4 bg-(--bg-card-hover) rounded w-full max-w-96 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="bg-(--bg-card-hover) rounded-xl h-48" />
              <div className="mt-4 space-y-3">
                <div className="h-4 bg-(--bg-card-hover) rounded w-1/4" />
                <div className="h-6 bg-(--bg-card-hover) rounded w-3/4" />
                <div className="h-4 bg-(--bg-card-hover) rounded w-full" />
                <div className="h-4 bg-(--bg-card-hover) rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}