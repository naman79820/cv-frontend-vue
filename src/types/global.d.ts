export {};

declare global {
  interface Window {
    embed: boolean;
    isUserLoggedIn: boolean;
    logixProjectId: string;
  }
}