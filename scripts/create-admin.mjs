#!/usr/bin/env node
/**
 * Cria (ou promove) um usuário administrador.
 * Uso: node --env-file=.env.local scripts/create-admin.mjs email@empresa.com "Senha-Forte-123" "Nome Completo" [admin|editor|commercial]
 */
import { createClient } from "@supabase/supabase-js";

const [email, password, fullName = "", role = "admin"] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

if (!email || !password) {
  console.error('Uso: node --env-file=.env.local scripts/create-admin.mjs email senha "Nome" [admin|editor|commercial]');
  process.exit(1);
}
if (!url || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!["admin", "editor", "commercial"].includes(role)) {
  console.error("Perfil inválido. Use admin, editor ou commercial.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let userId;
const { data: created, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
});
if (error) {
  if (!/already been registered|already exists/i.test(error.message)) {
    console.error("Erro:", error.message);
    process.exit(1);
  }
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  userId = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
  if (!userId) {
    console.error("Usuário existente não encontrado.");
    process.exit(1);
  }
  await supabase.auth.admin.updateUserById(userId, { password });
} else {
  userId = created.user.id;
}

const { error: pErr } = await supabase.from("profiles").upsert({ id: userId, email, full_name: fullName, role, active: true });
if (pErr) {
  console.error("Erro no perfil:", pErr.message);
  process.exit(1);
}
console.log(`✔ ${email} pronto com perfil "${role}".`);
