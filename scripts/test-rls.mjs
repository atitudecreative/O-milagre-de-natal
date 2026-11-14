// Testes de RLS/permissões contra o Supabase local. Uso: node --env-file=.env.local scripts/test-rls.mjs (requer os usuários de teste do README).
import { createClient } from "@supabase/supabase-js";
const url = "http://127.0.0.1:54321";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ok = (c, m) => console.log(c ? "✔" : "✘", m);
const anon = createClient(url, anonKey, { auth: { persistSession: false } });
const as = async (email, pass) => { const c = createClient(url, anonKey, { auth: { persistSession: false } }); const { error } = await c.auth.signInWithPassword({ email, password: pass }); if (error) throw error; return c; };
const EV = "00000000-0000-4000-8000-000000000001";

let r = await anon.from("leads").select("id"); ok(!r.data?.length, `anon não lê leads (${r.data?.length ?? r.error?.message})`);
r = await anon.from("events").select("slug,status"); ok(r.data.every((e) => e.status === "published"), `anon só vê publicados (${r.data.length})`);
r = await anon.from("event_integrations").select("*"); ok(!r.data?.length, "anon não lê integrações (e-mails de notificação)");
r = await anon.from("public_event_tracking").select("*"); ok(r.data?.length >= 1 && !("notify_emails" in r.data[0]), "anon lê só IDs de rastreamento");
r = await anon.from("events").update({ name: "hack" }).eq("id", EV).select(); ok(!r.data?.length, "anon não altera eventos");
r = await anon.from("profiles").select("*"); ok(!r.data?.length, "anon não lê perfis");
r = await anon.from("audit_logs").select("*"); ok(!r.data?.length, "anon não lê auditoria");
// draft event
const admin = await as("admin@palco.local", "Palco-2026-admin");
const { data: draft } = await admin.from("events").insert({ slug: "rls-rascunho", name: "RLS Rascunho" }).select("id").single();
r = await anon.from("leads").insert({ event_id: draft.id, full_name: "X Y", company: "Z", email: "a@b.co", consent: true }); ok(!!r.error, `anon não envia lead p/ rascunho (${r.error?.code})`);
r = await anon.from("leads").insert({ event_id: EV, full_name: "X Y", company: "Z", email: "a@b.co", consent: false }); ok(!!r.error, "lead sem consentimento é rejeitado");
r = await anon.from("leads").insert({ event_id: EV, full_name: "X Y", company: "Z", email: "a@b.co", consent: true, status: "won" }); ok(!!r.error, `anon não define status do lead (${r.error?.code})`);
r = await anon.from("event_analytics").insert({ event_id: draft.id, name: "page_view" }); ok(!!r.error, "analytics bloqueado em rascunho");
r = await anon.storage.from("media").upload(`events/${EV}/x.txt`, new Blob(["x"]), { contentType: "image/png" }); ok(!!r.error, "anon não envia arquivos");

const editor = await as("editor@palco.local", "Palco-2026-editor");
r = await editor.from("leads").select("id"); ok(!r.data?.length, `editor não lê leads (${r.data?.length})`);
r = await editor.from("events").update({ tagline: "ok editor" }).eq("id", draft.id).select(); ok(r.data?.length === 1, "editor edita eventos");
r = await editor.from("events").delete().eq("id", draft.id).select(); ok(!r.data?.length, "editor não exclui eventos");
r = await editor.from("profiles").update({ role: "admin" }).eq("id", (await editor.auth.getUser()).data.user.id); ok(!!r.error, `editor não se promove a admin (${r.error?.message?.slice(0, 40)})`);
r = await editor.from("audit_logs").select("id"); ok(!r.data?.length, "editor não lê auditoria");

const com = await as("comercial@palco.local", "Palco-2026-comercial");
r = await com.from("leads").select("id"); ok(r.data?.length > 0, `comercial lê leads (${r.data?.length})`);
r = await com.from("events").update({ name: "x" }).eq("id", EV).select(); ok(!r.data?.length, "comercial não edita eventos");
const { data: tier } = await com.from("sponsorship_tiers").select("id, quantity_sold, quantity_total").eq("event_id", EV).limit(1).single();
r = await com.from("sponsorship_tiers").update({ quantity_sold: tier.quantity_sold }).eq("id", tier.id).select(); ok(r.data?.length === 1, "comercial atualiza vendas da cota");
r = await com.from("sponsorship_tiers").update({ price: 1 }).eq("id", tier.id).select(); ok(!!r.error, `comercial não muda preço (${r.error?.message?.slice(0, 50)})`);
r = await com.from("sponsorship_tiers").update({ quantity_sold: (tier.quantity_total ?? 0) + 5 }).eq("id", tier.id); ok(!!r.error, "vendas não excedem o total (constraint)");
r = await com.storage.from("media").upload(`events/${EV}/x.png`, new Blob(["x"]), { contentType: "image/png" }); ok(!!r.error, "comercial não envia mídia");
r = await com.rpc("duplicate_event", { p_source: EV, p_name: "x", p_slug: "x-dup" }); ok(!!r.error, "comercial não duplica eventos");

// duplicate as admin: no leads/sponsors copied
r = await admin.rpc("duplicate_event", { p_source: EV, p_name: "Solarmar Cópia", p_slug: "solarmar-copia" });
const dup = r.data;
const [l, s, t, m] = await Promise.all([
  admin.from("leads").select("id").eq("event_id", dup), admin.from("event_sponsors").select("id").eq("event_id", dup),
  admin.from("sponsorship_tiers").select("quantity_sold").eq("event_id", dup), admin.from("event_metrics").select("id").eq("event_id", dup)]);
ok(l.data.length === 0 && s.data.length === 0 && t.data.every((x) => x.quantity_sold === 0) && m.data.length > 0, `duplicação sem leads/patrocinadores/vendas (métricas ${m.data.length}, cotas ${t.data.length})`);
const { data: d2 } = await admin.from("events").select("status").eq("id", dup).single(); ok(d2.status === "draft", "duplicado nasce como rascunho");
await admin.from("events").delete().in("id", [dup, draft.id]);
