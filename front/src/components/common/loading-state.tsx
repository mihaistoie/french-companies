import { LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type LoadingStateProps = {
  title: string;
};

export function LoadingState({ title }: LoadingStateProps) {
  return (
    <Card className="mx-auto w-full max-w-md animate-fade-in">
      <CardContent className="flex min-h-48 flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}
