export const MAX_WORKSPACE_NAME = 60;

/** Trims and validates a workspace name. Returns the clean name or an error message. */
export function validateWorkspaceName(
  raw: string,
  existing: string[],
): { ok: true; name: string } | { ok: false; error: string } {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, error: "Give the workspace a name." };
  if (name.length > MAX_WORKSPACE_NAME) {
    return { ok: false, error: `Use ${MAX_WORKSPACE_NAME} characters or fewer.` };
  }
  if (existing.some((other) => other.toLowerCase() === name.toLowerCase())) {
    return { ok: false, error: "You already have a workspace with that name." };
  }
  return { ok: true, name };
}
