import { ChatWorkspace } from "@/components/chat-workspace";
import { config } from "@/lib/config";

export default function ChatPage() { return <ChatWorkspace demoMode={config.demoMode} />; }
