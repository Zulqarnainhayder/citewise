import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { test as base, expect, type BrowserContext } from "@playwright/test";
import { randomUUID } from "node:crypto";

const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set to run the browser tests.`);
  return value;
};

export type TestUser = {
  id: string;
  email: string;
  password: string;
  /** A Supabase client signed in as this user, so seeding obeys row level security like the app. */
  db: SupabaseClient;
  /** Makes the browser signed in as this user. */
  signIn: () => Promise<void>;
  /** Adds a ready document straight to the database (no PDF file, no AI). */
  seedDocument: (title: string, patch?: Record<string, unknown>) => Promise<string>;
};

/**
 * A temporary user per test. It is created with the service role key (which only tests use;
 * the app never does) and deleted afterwards together with everything it owns.
 */
export const test = base.extend<{ user: TestUser }>({
  user: async ({ context, baseURL }, provide) => {
    const url = env("NEXT_PUBLIC_SUPABASE_URL");
    const anon = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const admin = createClient(url, env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

    const email = `citewise-e2e-${Date.now()}-${randomUUID().slice(0, 8)}@example.com`;
    const password = `Test-${randomUUID()}`;
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(`Could not create the test user: ${error?.message}`);
    const id = data.user.id;

    const jar = new Map<string, string>();
    const db = createServerClient(url, anon, {
      cookies: {
        getAll: () => [...jar].map(([name, value]) => ({ name, value })),
        setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
      },
    });
    const { error: signInError } = await db.auth.signInWithPassword({ email, password });
    if (signInError) throw new Error(`Could not sign in the test user: ${signInError.message}`);

    const user: TestUser = {
      id,
      email,
      password,
      db,
      signIn: async () => addCookies(context, baseURL!, jar),
      seedDocument: async (title, patch = {}) => {
        const docId = randomUUID();
        const { error } = await db.from("documents").insert({
          id: docId,
          user_id: id,
          title,
          storage_path: `${id}/${docId}.pdf`,
          status: "ready",
          page_count: 3,
          ...patch,
        });
        if (error) throw new Error(`Could not seed a document: ${error.message}`);
        return docId;
      },
    };

    await provide(user);

    // Cleanup: uploaded files first (the user's own folder), then the user, which cascades to rows.
    const { data: files } = await admin.storage.from("documents").list(id);
    if (files?.length) await admin.storage.from("documents").remove(files.map((f) => `${id}/${f.name}`));
    await admin.auth.admin.deleteUser(id);
  },
});

async function addCookies(context: BrowserContext, baseURL: string, jar: Map<string, string>) {
  await context.addCookies([...jar].map(([name, value]) => ({ name, value, url: baseURL })));
}

export { expect };
