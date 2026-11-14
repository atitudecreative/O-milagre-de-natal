/** Health check usado pelo Render (healthCheckPath: /api/health). */
export const dynamic = "force-static";

export function GET() {
  return Response.json({ ok: true });
}
