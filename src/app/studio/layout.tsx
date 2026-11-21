import { WorkspaceShell } from "@/components/workspace-shell";
import { config } from "@/lib/config";

export default function StudioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceShell demoMode={config.demoMode}>{children}</WorkspaceShell>;
}
