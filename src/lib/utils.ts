import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskSeverity } from "@/domain/risks";
import type { ReliabilityStatus } from "@/domain/journey";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(severity: RiskSeverity): string {
  switch (severity) {
    case "critical": return "text-red-600";
    case "high": return "text-orange-500";
    case "medium": return "text-amber-500";
    case "low": return "text-green-600";
    default: return "text-gray-400";
  }
}

export function getRiskBg(severity: RiskSeverity): string {
  switch (severity) {
    case "critical": return "bg-red-50 border-red-200";
    case "high": return "bg-orange-50 border-orange-200";
    case "medium": return "bg-amber-50 border-amber-200";
    case "low": return "bg-green-50 border-green-200";
    default: return "bg-gray-50 border-gray-200";
  }
}

export function getReliabilityColor(status: ReliabilityStatus): string {
  switch (status) {
    case "healthy": return "text-green-600";
    case "degraded": return "text-amber-500";
    case "critical": return "text-red-600";
    default: return "text-gray-400";
  }
}

export function getReliabilityLabel(status: ReliabilityStatus): string {
  switch (status) {
    case "healthy": return "Healthy";
    case "degraded": return "Degraded";
    case "critical": return "Critical";
    case "unknown": return "Unknown";
    case "not_instrumented": return "Not Instrumented";
    case "insufficient_evidence": return "Insufficient Evidence";
  }
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "P1": return "bg-red-100 text-red-700 border-red-200";
    case "P2": return "bg-orange-100 text-orange-700 border-orange-200";
    case "P3": return "bg-amber-100 text-amber-700 border-amber-200";
    case "P4": return "bg-blue-100 text-blue-700 border-blue-200";
    case "P5": return "bg-gray-100 text-gray-700 border-gray-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
}
