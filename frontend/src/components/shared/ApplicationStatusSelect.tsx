import { ApplicationStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApplicationStatusSelectProps {
  appId: number;
  status: ApplicationStatus;
  onUpdate: (appId: number, status: ApplicationStatus) => void;
  isPending?: boolean;
}

const STATUS_ITEMS: { value: ApplicationStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

export function ApplicationStatusSelect({
  appId,
  status,
  onUpdate,
  isPending,
}: ApplicationStatusSelectProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-2.5">
      <span className="text-xs text-muted-foreground">Update status:</span>
      <Select value={status} onValueChange={(v) => onUpdate(appId, v as ApplicationStatus)}>
        <SelectTrigger className="h-7 w-36 text-xs" id={`status-${appId}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && (
        <span className="animate-pulse text-xs text-muted-foreground">Saving…</span>
      )}
    </div>
  );
}
