"use client";

import { useMemo } from "react";
import { createClient } from "./client";

/** One stable browser Supabase client per component tree. */
export function useSupabase() {
  return useMemo(() => createClient(), []);
}
