import { cn } from "@/lib/utils";

export type TabOption<T extends string> = {
  value: T;
  label: string;
};

type TabsProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: Array<TabOption<T>>;
};

export function Tabs<T extends string>({
  value,
  onValueChange,
  options,
}: TabsProps<T>) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary/80 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onValueChange(option.value)}
          className={cn(
            "rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
