export interface PublicModelDefinition {
  id: string;
  displayName: string;
  description: string;
}

export const publicModelCatalog: PublicModelDefinition[] = [
  { id: "dist-flash", displayName: "Dist Flash", description: "Fast everyday chat, writing and quick analysis" },
  { id: "dist-pro", displayName: "Dist Pro", description: "Deeper reasoning, coding and complex work" },
  { id: "dist-flash-lite", displayName: "Dist Flash Lite", description: "Lightweight responses for simple tasks" },
];
