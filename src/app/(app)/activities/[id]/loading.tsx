export default function ActivityDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-9 h-9 rounded-full bg-border/50" />
        <div className="h-6 w-40 bg-border/50 rounded" />
      </div>
      <div className="h-48 bg-border/50" />
      <div className="grid grid-cols-3 border-b border-border">
        <div className="h-20 bg-border/50 border-r border-border" />
        <div className="h-20 bg-border/50 border-r border-border" />
        <div className="h-20 bg-border/50" />
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="h-24 bg-border/50 rounded-xl" />
        <div className="h-32 bg-border/50 rounded-xl" />
      </div>
    </div>
  );
}
