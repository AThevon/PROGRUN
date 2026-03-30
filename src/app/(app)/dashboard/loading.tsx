export default function DashboardLoading() {
  return (
    <div className="p-5 flex flex-col gap-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-16 bg-border/50 rounded mb-2" />
          <div className="h-9 w-32 bg-border/50 rounded" />
        </div>
        <div className="w-10 h-10 rounded-full bg-border/50" />
      </div>
      <div className="h-36 bg-border/50 rounded-2xl" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-24 bg-border/50 rounded-xl" />
        <div className="h-24 bg-border/50 rounded-xl" />
        <div className="h-24 bg-border/50 rounded-xl" />
      </div>
      <div className="h-48 bg-border/50 rounded-2xl" />
      <div className="h-32 bg-border/50 rounded-2xl" />
    </div>
  );
}
