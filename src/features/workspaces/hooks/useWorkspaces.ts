"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/useSupabase";
import type { WorkspaceRow } from "../types";
import { validateWorkspaceName } from "../utils";

const COLUMNS = "id, name, created_at";

/** The signed-in user's workspaces. Mutations resolve to an error message, or null on success. */
export function useWorkspaces() {
  const supabase = useSupabase();
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select(COLUMNS)
        .order("name", { ascending: true });
      if (cancelled) return;
      if (error) setError(error.message);
      else setWorkspaces(data as WorkspaceRow[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const create = useCallback(
    async (raw: string): Promise<string | null> => {
      const checked = validateWorkspaceName(raw, workspaces.map((w) => w.name));
      if (!checked.ok) return checked.error;
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return "Please sign in again.";
      const { data, error } = await supabase
        .from("workspaces")
        .insert({ name: checked.name, user_id: auth.user.id })
        .select(COLUMNS)
        .single();
      if (error || !data) return error?.message ?? "Could not create the workspace.";
      setWorkspaces((prev) =>
        [...prev, data as WorkspaceRow].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return null;
    },
    [supabase, workspaces],
  );

  const rename = useCallback(
    async (id: string, raw: string): Promise<string | null> => {
      const others = workspaces.filter((w) => w.id !== id).map((w) => w.name);
      const checked = validateWorkspaceName(raw, others);
      if (!checked.ok) return checked.error;
      const { error } = await supabase.from("workspaces").update({ name: checked.name }).eq("id", id);
      if (error) return error.message;
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === id ? { ...w, name: checked.name } : w)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      return null;
    },
    [supabase, workspaces],
  );

  /** Documents in the workspace are kept; the database sets their workspace to none. */
  const remove = useCallback(
    async (id: string): Promise<string | null> => {
      const { error } = await supabase.from("workspaces").delete().eq("id", id);
      if (error) return error.message;
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      return null;
    },
    [supabase],
  );

  return { workspaces, loading, error, create, rename, remove };
}
