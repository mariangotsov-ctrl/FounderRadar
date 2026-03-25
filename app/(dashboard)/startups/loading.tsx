export default function StartupsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-36 bg-gray-200 rounded-md" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg" />
    </div>
  );
}
