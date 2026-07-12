import type { ReactNode } from "react";

export const metadata = {
  title: "育成就労・特定技能 書類作成支援",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
