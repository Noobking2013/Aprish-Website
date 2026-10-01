/**
 * One icon per FeatureKey, so a feature's icon and its status chip can never drift apart.
 *
 * `Record<FeatureKey, LucideIcon>` is total on purpose: adding a key to FEATURES in
 * src/content/status.ts without giving it an icon fails `tsc`. Phase 5a draws the Problem
 * and Flow keys; Phase 6 (`/product`) gets the remaining ones for free.
 */
import {
  BadgeCheck,
  BellRing,
  CalendarDays,
  GitBranch,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  MessageCircleDashed,
  Package,
  Pill,
  ReceiptText,
  SquareCheck,
  type LucideIcon,
} from "lucide-react";
import type { FeatureKey } from "@/content/status";

export const FEATURE_ICON: Record<FeatureKey, LucideIcon> = {
  ariaWhatsApp: MessageCircleDashed,
  bookingViaWhatsApp: CalendarDays,
  bookingEngine: SquareCheck,
  webDashboard: LayoutDashboard,
  queueCheckIn: ListChecks,
  delayAlerts: BellRing,
  digitalRx: Pill,
  billingEmr: ReceiptText,
  stockTracking: Package,
  followUps: HeartPulse,
  blackVerification: BadgeCheck,
  brandPartnerRouting: GitBranch,
};
