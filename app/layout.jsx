import { IBM_Plex_Sans, Noto_Sans_SC } from "next/font/google";
import Script from "next/script";
import { ChunkRecovery } from "@/components/chunk-recovery";
import "./globals.css";

const bodyFont = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body"
});

const displayFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display"
});

export const metadata = {
  title: {
    default: "InvestPilot | 中文投资研究与决策辅助平台",
    template: "%s | InvestPilot"
  },
  description:
    "面向中文用户的开放式投资研究平台，覆盖市场总览、个股研究、公告与研报检索、文档提炼和风险辅助判断，支持游客直接使用主要功能。",
  applicationName: "InvestPilot",
  keywords: ["投资研究", "市场分析", "风险评估", "个股研究", "财经日历", "文档提炼"]
};

const chunkRecoveryBootstrap = `
  (function () {
    var FLAG = 'investpilot.bootstrap-recovery.v1';
    var COOLDOWN = 20000;
    function isRecoverable(text) {
      return /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module|client-side exception|hydration/i.test(String(text || ''));
    }
    function canRecover() {
      try {
        var raw = window.sessionStorage.getItem(FLAG);
        if (!raw) return true;
        var timestamp = Number(raw);
        return Number.isNaN(timestamp) || Date.now() - timestamp > COOLDOWN;
      } catch (error) {
        return true;
      }
    }
    function markAndReload() {
      if (!canRecover()) return;
      try { window.sessionStorage.setItem(FLAG, String(Date.now())); } catch (error) {}
      var nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('_refetch', String(Date.now()));
      window.location.replace(nextUrl.toString());
    }
    window.addEventListener('error', function (event) {
      var target = event && event.target;
      if (target && target.tagName === 'SCRIPT' && String(target.src || '').indexOf('/_next/static/') !== -1) {
        markAndReload();
        return;
      }
      if (isRecoverable(event && (event.message || (event.error && event.error.message)))) {
        markAndReload();
      }
    }, true);
    window.addEventListener('unhandledrejection', function (event) {
      var reason = event && event.reason;
      if (isRecoverable(reason && reason.message ? reason.message : reason)) {
        markAndReload();
      }
    });
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <Script id="investpilot-chunk-recovery-bootstrap" strategy="beforeInteractive">
          {chunkRecoveryBootstrap}
        </Script>
        <ChunkRecovery />
        {children}
      </body>
    </html>
  );
}
