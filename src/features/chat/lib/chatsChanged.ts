export const CHATS_CHANGED = "citewise-chats-changed";

/** Tells every chat list on the page (sidebar, mobile history) to refresh. */
export function notifyChatsChanged() {
  window.dispatchEvent(new Event(CHATS_CHANGED));
}
