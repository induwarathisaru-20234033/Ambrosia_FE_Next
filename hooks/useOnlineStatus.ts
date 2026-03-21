"use client";

import { useEffect, useRef } from "react";
import axiosAuth from "@/utils/AxiosInstance";
import { getCachedUserProfile } from "@/utils/auth/userProfile";
import type { IOnlineStatusRequest } from "@/data-types";

/** Mark the user as inactive after this many ms of no interaction */
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/** Browser events that indicate the user is actively using the page */
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
] as const;

export function useOnlineStatus() {
  /**
   * Track the last status we sent so we don't spam the API with duplicate
   * requests (e.g., every mousemove while already marked online).
   * `null` means we haven't sent anything yet this session.
   */
  const lastStatusRef = useRef<boolean | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getEmployeeId = (): number | null => {
    return getCachedUserProfile()?.id ?? null;
  };

  const sendStatus = async (isOnline: boolean) => {
    if (lastStatusRef.current === isOnline) return;

    const employeeId = getEmployeeId();
    if (!employeeId) return;

    lastStatusRef.current = isOnline;

    try {
      const body: IOnlineStatusRequest = { isOnline };
      await axiosAuth.patch(`/Employees/${employeeId}/online-status`, body);
    } catch {
      // Reset so we retry on the next state change
      lastStatusRef.current = null;
    }
  };

  // ── Idle timer ────────────────────────────────────────────────────────────
  const clearIdleTimer = () => {
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const startIdleTimer = () => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      sendStatus(false);
    }, IDLE_TIMEOUT_MS);
  };

  // ── Activity handler ──────────────────────────────────────────────────────
  const handleActivity = () => {
    sendStatus(true);
    startIdleTimer();
  };

  // ── Visibility change ─────────────────────────────────────────────────────
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      handleActivity();
    } else {
      clearIdleTimer();
      sendStatus(false);
    }
  };

  // ── Window focus / blur ───────────────────────────────────────────────────
  const handleFocus = () => {
    handleActivity();
  };

  // ── Effect ────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Mark online immediately when the protected layout mounts
    if (document.visibilityState === "visible") {
      sendStatus(true);
      startIdleTimer();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    globalThis.addEventListener("focus", handleFocus);

    ACTIVITY_EVENTS.forEach((event) => {
      globalThis.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearIdleTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      globalThis.removeEventListener("focus", handleFocus);
      ACTIVITY_EVENTS.forEach((event) => {
        globalThis.removeEventListener(event, handleActivity);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
