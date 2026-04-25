import { Alert } from "@/components/ui/alert";

type ErrorMessageProps = {
  message: string;
  variant?: "default" | "danger";
};

export function ErrorMessage({
  message,
  variant = "danger",
}: ErrorMessageProps) {
  return <Alert description={message} variant={variant} />;
}
