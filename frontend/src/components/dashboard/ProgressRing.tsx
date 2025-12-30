import { Target } from "lucide-react";

interface ProgressRingProps {
  progress: number;
  target: number;
  current: number;
}

export function ProgressRing({ progress, target, current }: ProgressRingProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass-card rounded-xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Yearly Target</h3>
      </div>
      <div className="flex items-center justify-center py-4">
        <div className="relative">
          <svg className="h-32 w-32 -rotate-90 transform">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="hsl(160, 20%, 88%)"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="url(#progressGradient)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(158, 64%, 32%)" />
                <stop offset="100%" stopColor="hsl(174, 60%, 45%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{progress}%</span>
            <span className="text-xs text-muted-foreground">Complete</span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          Current: <span className="font-semibold text-foreground">{current.toLocaleString()} kg</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Target: <span className="font-semibold text-primary">{target.toLocaleString()} kg</span>
        </p>
      </div>
    </div>
  );
}
