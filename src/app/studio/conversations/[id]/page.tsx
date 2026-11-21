import { ConversationWorkspace } from "@/components/history-workspace";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ConversationWorkspace id={id} />;
}
