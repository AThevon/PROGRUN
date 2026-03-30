interface CompareItem {
  label: string;
  target?: string | number | null;
  actual: string | number;
  status?: "good" | "slow" | "neutral";
}

interface CompareStripProps {
  items: CompareItem[];
}

const STATUS_COLORS: Record<string, string> = {
  good: "text-success",
  slow: "text-accent2",
  neutral: "text-text",
};

export function CompareStrip({ items }: CompareStripProps) {
  return (
    <div className="bg-card rounded-lg flex flex-row divide-x divide-border">
      {items.map((item, index) => {
        const colorClass = item.status
          ? (STATUS_COLORS[item.status] ?? "text-text")
          : "text-text";

        return (
          <div
            key={index}
            className="flex-1 flex flex-col items-center py-2 px-1 gap-0.5"
          >
            <span className="text-[9px] font-dm text-muted uppercase tracking-wide">
              {item.label}
            </span>
            {item.target != null && (
              <span className="text-[10px] font-dm text-muted line-through">
                {item.target}
              </span>
            )}
            <span className={`font-bebas text-lg leading-none ${colorClass}`}>
              {item.actual}
            </span>
          </div>
        );
      })}
    </div>
  );
}
