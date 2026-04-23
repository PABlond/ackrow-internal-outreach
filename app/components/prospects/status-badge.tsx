import { Badge, type BadgeProps } from "~/components/ui/badge";

export function statusVariant(status: string): BadgeProps["variant"] {
  if (status === "accepted" || status === "report_sent" || status === "conversation_active") return "success";
  if (status === "followup_due" || status === "followup_sent") return "warning";
  if (status === "archived" || status === "archived_declined" || status === "skipped") return "muted";
  if (status === "to_contact" || status === "connection_sent" || status === "twitter_contacted") return "info";
  return "secondary";
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariant(status)}>{status}</Badge>;
}
