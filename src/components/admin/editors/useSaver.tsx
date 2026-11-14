"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "../ui";
import { useToast } from "../ui/toast";

type Result = { ok: true; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Estado de formulário com detecção de alterações, aviso ao sair e salvamento via server action. */
export function useSaver<T extends Record<string, unknown>>(initial: T, action: (values: T) => Promise<Result>) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial));
  const toast = useToast();
  const router = useRouter();
  const dirty = JSON.stringify(values) !== savedJson;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function set<K extends keyof T>(key: K, value: T[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as string]) setErrors((e) => ({ ...e, [key as string]: "" }));
  }

  function save() {
    start(async () => {
      const r = await action(values);
      if (!r.ok) {
        setErrors(r.fieldErrors ?? {});
        toast(r.error, "bad");
        return;
      }
      setSavedJson(JSON.stringify(values));
      setErrors({});
      toast(r.message ?? "Salvo.");
      router.refresh();
    });
  }

  function reset() {
    setValues(JSON.parse(savedJson));
    setErrors({});
  }

  return { values, set, setValues, errors, pending, dirty, save, reset };
}

export function SaveBar({ dirty, pending, onSave, onReset, disabled }: { dirty: boolean; pending: boolean; onSave: () => void; onReset: () => void; disabled?: boolean }) {
  if (disabled) return <p className="mt-6 text-xs text-mute">Seu perfil tem acesso somente de leitura nesta área.</p>;
  return (
    <div className={`z-20 -mx-4 mt-8 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border md:px-4 ${dirty || pending ? "sticky bottom-0 shadow-lg" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-mute">{pending ? "Salvando…" : dirty ? "Alterações não salvas" : "Tudo salvo"}</p>
        <div className="flex gap-2">
          {dirty ? <Button type="button" variant="ghost" size="sm" onClick={onReset} disabled={pending}>Descartar</Button> : null}
          <Button type="button" size="sm" onClick={onSave} disabled={!dirty || pending}>{pending ? "Salvando…" : "Salvar alterações"}</Button>
        </div>
      </div>
    </div>
  );
}
