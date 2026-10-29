export default function InstructorProfileLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 h-48 animate-pulse rounded-2xl bg-[#064E3B]/20" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="h-10 w-2/3 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}
