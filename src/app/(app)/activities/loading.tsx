export default function ActivitiesLoading() {
  return (
    <div className="p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-9 w-32 bg-border/50 rounded" />
        <div className="h-10 w-40 bg-border/50 rounded-xl" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-border/50 rounded-xl" />
      ))}
    </div>
  );
}
