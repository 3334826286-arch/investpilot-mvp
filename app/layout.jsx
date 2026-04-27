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
    default: "InvestPilot | 中文投资研究与决策辅助平台",
    template: "%s | InvestPilot"
  },
  description:
    "面向中文用户的开放式投资研究平台，覆盖市场总览、个股研究、公告与研报检索、文档提炼和风险辅助判断，支持游客直接使用主要功能。",
  applicationName: "InvestPilot",
  keywords: ["投资研究", "市场分析", "风险评估", "个股研究", "财经日历", "文档提炼"]
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}
