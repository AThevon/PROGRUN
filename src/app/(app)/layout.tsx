import { BottomNav } from "@/components/ui/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[420px] mx-auto min-h-screen relative">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
