import { turso } from "$lib/turso.server";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
  const result = await turso.execute("SELECT 'Hello from Turso!' AS msg");

  return new Response(JSON.stringify(result.rows), {
    headers: { "Content-Type": "application/json" }
  });
};
