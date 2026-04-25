import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertProps = {
  className?: string;
  title?: string;
  description: string;
  variant?: "default" | "danger";
};

export function Alert({
  className,
  title,
  description,
  variant = "default",
}: AlertProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border px-4 py-3 text-sm",
        variant === "danger"
          ? "border-danger/30 bg-danger/10 text-danger"
          : "border-border bg-secondary/60 text-foreground",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <p>{description}</p>
      </div>
    </div>
  );
}
