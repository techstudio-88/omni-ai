import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "OmniBrain — your AI workspace", template: "%s · OmniBrain" },
  description: "One thoughtful workspace for chat, research, documents, and the AI models that help you work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
