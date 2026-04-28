"use client";

import { useEffect, useState } from "react";

const RECOVERY_FLAG = "investpilot.chunk-recovery.v1";
const RECOVERY_COOLDOWN_MS = 20_000;

function isRecoverableErrorText(text) {
  if (!text) {
    return false;
  }

  return /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module|client-side exception|hydration/i.test(
    text
  );
}

function shouldAttemptRecovery() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.sessionStorage.getItem(RECOVERY_FLAG);
    if (!raw) {
      return true;
    }

    const timestamp = Number(raw);
    return Number.isNaN(timestamp) || Date.now() - timestamp > RECOVERY_COOLDOWN_MS;
  } catch {
    return true;
  }
}

function markRecoveryAttempt() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(RECOVERY_FLAG, String(Date.now()));
  } catch {}
}

function hardReload() {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("_refetch", String(Date.now()));
  window.location.replace(nextUrl.toString());
}

export function ChunkRecovery() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function recoverOnce(reason) {
      if (!isRecoverableErrorText(reason) || !shouldAttemptRecovery()) {
        return;
      }

      markRecoveryAttempt();
      setVisible(true);
      window.setTimeout(() => {
        hardReload();
      }, 180);
    }

    function handleError(event) {
      recoverOnce(event?.message || event?.error?.message || "");
    }

    function handleRejection(event) {
      recoverOnce(event?.reason?.message || String(event?.reason || ""));
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 top-4 z-[80] mx-auto max-w-xl rounded-[22px] border border-amber-200 bg-white/96 px-4 py-3 text-sm text-slate-700 shadow-[0_18px_44px_rgba(15,23,42,0.16)] backdrop-blur">
      页面正在自动恢复最新版本，请稍候…
    </div>
  );
}
