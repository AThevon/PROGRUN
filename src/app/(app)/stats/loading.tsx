export default function StatsLoading() {
  return (
    <div className="p-5 flex flex-col gap-4 animate-pulse">
      <div className="h-9 w-36 bg-border/50 rounded" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-24 bg-border/50 rounded-xl" />
        <div className="h-24 bg-border/50 rounded-xl" />
        <div className="h-24 bg-border/50 rounded-xl" />
        <div className="h-24 bg-border/50 rounded-xl" />
      </div>
      <div className="h-40 bg-border/50 rounded-2xl" />
      <div className="h-40 bg-border/50 rounded-2xl" />
    </div>
  );
}
