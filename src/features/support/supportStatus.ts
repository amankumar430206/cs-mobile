import { TICKET_CATEGORIES, type TicketCategory, type TicketStatus } from "@castadi/shared/types";
import type { Tone } from "@/ui";

// What a ticket owner needs to know at a glance — cs-api's finer internal states collapse into these.
export const TICKET_STATUS: Record<TicketStatus, { label: string; tone: Tone }> = {
  OPEN: { label: "Open", tone: "primary" },
  ASSIGNED: { label: "In progress", tone: "primary" },
  UNDER_REVIEW: { label: "In progress", tone: "primary" },
  IN_PROGRESS: { label: "In progress", tone: "primary" },
  ESCALATED: { label: "In progress", tone: "warning" },
  WAITING_FOR_CUSTOMER: { label: "Needs your reply", tone: "warning" },
  REOPENED: { label: "Reopened", tone: "primary" },
  RESOLVED: { label: "Resolved", tone: "success" },
  CLOSED: { label: "Closed", tone: "default" },
};

export const ticketCategoryLabel = (category: TicketCategory) =>
  TICKET_CATEGORIES.find((item) => item.value === category)?.label ?? category;
