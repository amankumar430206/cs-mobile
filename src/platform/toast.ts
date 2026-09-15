import { useSyncExternalStore } from "react";
import type { ToastAdapter } from "@castadi/shared";

export type ToastKind = "success" | "error" | "info" | "loading";

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const DURATION_MS = { success: 3000, info: 3000, error: 4500 } as const;
const MAX_VISIBLE = 3;

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit(next: ToastItem[]) {
  items = next;
  listeners.forEach((listener) => listener());
}

function clearTimer(id: number) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
}

export function dismissToast(id: number) {
  clearTimer(id);
  emit(items.filter((toast) => toast.id !== id));
}

function show(kind: ToastKind, message: string, replaceId?: string | number): number {
  const replacing = typeof replaceId === "number" && items.some((toast) => toast.id === replaceId);
  // The API client and a mutation's meta can both report the same failure; don't stack duplicates.
  const duplicate = !replacing && items.find((toast) => toast.kind === kind && toast.message === message);
  if (duplicate) return duplicate.id;

  const id = replacing ? (replaceId as number) : nextId++;
  const item: ToastItem = { id, kind, message };
  emit(replacing ? items.map((toast) => (toast.id === id ? item : toast)) : [...items, item].slice(-MAX_VISIBLE));

  clearTimer(id);
  if (kind !== "loading") timers.set(id, setTimeout(() => dismissToast(id), DURATION_MS[kind]));
  return id;
}

export const toast = {
  success: (message: string, replaceId?: string | number) => show("success", message, replaceId),
  error: (message: string, replaceId?: string | number) => show("error", message, replaceId),
  info: (message: string) => show("info", message),
  loading: (message: string) => show("loading", message),
};

export const toastAdapter: ToastAdapter = {
  loading: toast.loading,
  success: toast.success,
  error: toast.error,
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useToasts = () => useSyncExternalStore(subscribe, () => items, () => items);
