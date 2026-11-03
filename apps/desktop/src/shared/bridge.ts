export const PROVIDERS = ["google", "discord", "twitter"] as const;
export type Provider = (typeof PROVIDERS)[number];
export type MenuAction =
  | "import"
  | "import-collection"
  | "open"
  | "copy"
  | "select-all"
  | "grid"
  | "list";
export interface SessionChange {
  signedIn: boolean;
  error?: string;
}
export interface GameNodeBridge {
  signIn(provider: Provider): Promise<void>;
  getToken(): Promise<string | undefined>;
  signOut(): Promise<void>;
  onSessionChanged(callback: (session: SessionChange) => void): () => void;
  openExternal(url: string): Promise<void>;
  showGameContextMenu(gameIds: string[]): Promise<void>;
  onMenuAction(
    callback: (action: MenuAction, gameIds?: string[]) => void,
  ): () => void;
}
