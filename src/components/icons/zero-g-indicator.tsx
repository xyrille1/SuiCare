import { cn } from "@/lib/utils";

export function GaslessModeIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary", className)}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
      </span>
      <span>Gasless Mode</span>
    </div>
  );
}
