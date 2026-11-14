"use client";
import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, signIn, updatePassword } from "@/actions/auth";
import { Button, buttonClass } from "./ui";
import { Field, Input } from "./ui/fields";

function Alert({ tone, children }: { tone: "bad" | "ok"; children: React.ReactNode }) {
  return (
    <p role={tone === "bad" ? "alert" : "status"} className={`rounded-lg px-3 py-2.5 text-sm ${tone === "bad" ? "bg-[#f5e0dd] text-bad" : "bg-[#e3f0e7] text-ok"}`}>
      {children}
    </p>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus className="h-12" />
      </Field>
      <Field label={<span className="flex justify-between"><span>Senha</span><Link href="/recuperar-senha" className="font-normal text-mute underline-offset-4 hover:underline">Esqueci minha senha</Link></span>} htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-12" />
      </Field>
      {state?.error ? <Alert tone="bad">{state.error}</Alert> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</Button>
    </form>
  );
}

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  if (state?.ok) return <div className="space-y-6"><Alert tone="ok">{state.message}</Alert><Link href="/login" className={buttonClass("secondary", "lg")}>Voltar ao login</Link></div>;
  return (
    <form action={action} className="space-y-5">
      <Field label="E-mail cadastrado" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus className="h-12" />
      </Field>
      {state?.error ? <Alert tone="bad">{state.error}</Alert> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Enviando…" : "Enviar link"}</Button>
      <Link href="/login" className="block text-center text-sm text-mute hover:text-ink">Voltar ao login</Link>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  if (state?.ok) return <div className="space-y-6"><Alert tone="ok">Senha atualizada com sucesso.</Alert><Link href="/admin" className={buttonClass("primary", "lg")}>Ir para o painel</Link></div>;
  return (
    <form action={action} className="space-y-5">
      <Field label="Nova senha" hint="Mínimo de 8 caracteres, com letras e números." htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="h-12" />
      </Field>
      <Field label="Confirme a nova senha" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="h-12" />
      </Field>
      {state?.error ? <Alert tone="bad">{state.error}</Alert> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Salvando…" : "Salvar senha"}</Button>
    </form>
  );
}
