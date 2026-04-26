import { IBM_Plex_Sans, Noto_Sans_SC } from "next/font/google";
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
    default: "InvestPilot | 中文投资分析与决策辅助平台",
    template: "%s | InvestPilot"
  },
  description:
    "一个面向中文用户的智能投资分析平台，帮助你更快理解市场、评估风险、筛选机会，并提炼复杂财经信息。",
  applicationName: "InvestPilot",
  keywords: ["投资分析", "市场检测", "风险评估", "财经日历", "量化选股", "中文金融平台"]
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}
