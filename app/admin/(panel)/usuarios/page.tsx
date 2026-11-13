import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { ROLE_LABEL, type Role } from '@/lib/schema';
import { formatDateTime } from '@/lib/format';
import { createUserAction, updateUserAction } from '../../actions';
import { inputCls, Notice, PageTitle } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/client';

const ROLE_HELP: Record<Role, string> = {
  admin: 'Acesso total, incluindo usuários.',
  editor: 'Edita textos, imagens, cotas, parceiros e mídia kit. Não vê os contatos.',
  comercial: 'Vê e atende as empresas interessadas. Não edita o site.',
};

export default async function Users({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const me = await requireRole('users');
  const sp = await searchParams;
  const users = await (await db()).list('users', { orderBy: 'created_at' });
  const roles = Object.keys(ROLE_LABEL) as Role[];

  return (
    <div className="max-w-5xl">
      <PageTitle title="Usuários e acessos" subtitle={<ul className="space-y-1">{roles.map((r) => <li key={r}><strong className="text-cream/80">{ROLE_LABEL[r]}:</strong> {ROLE_HELP[r]}</li>)}</ul>} />
      <Notice ok={sp.ok} erro={sp.erro} />

      <div className="space-y-3">
        {users.map((u) => (
          <form key={u.id} action={updateUserAction.bind(null, u.id)} className="grid items-end gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-[1.4fr_170px_1fr_auto_auto]">
            <div>
              <p className="text-sm text-cream">{String(u.name)} {u.id === me.id && <span className="text-xs text-gold">(você)</span>}</p>
              <p className="text-xs text-cream/45">{String(u.email)} · último acesso {formatDateTime(u.last_login_at)}</p>
            </div>
            <select name="role" defaultValue={String(u.role)} className={`${inputCls} [&>option]:bg-ink`} aria-label="Perfil">
              {roles.map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
            <input name="password" type="password" placeholder="Nova senha (opcional)" autoComplete="new-password" className={inputCls} aria-label="Nova senha" />
            <label className="flex items-center gap-2 pb-2.5 text-sm text-cream/70">
              <input type="checkbox" name="active" defaultChecked={u.active === true} className="accent-[#E6BC88]" /> Ativo
            </label>
            <button className="rounded-md border border-white/15 px-4 py-2.5 text-sm hover:border-gold/60">Salvar</button>
          </form>
        ))}
      </div>

      <h2 className="display mb-4 mt-12 text-2xl">Novo usuário</h2>
      <form action={createUserAction} className="grid gap-4 rounded-xl border border-white/10 p-5 md:grid-cols-2">
        <input name="name" placeholder="Nome" className={inputCls} required />
        <input name="email" type="email" placeholder="E-mail" className={inputCls} required />
        <select name="role" defaultValue="comercial" className={`${inputCls} [&>option]:bg-ink`}>
          {roles.map((r) => (
            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
          ))}
        </select>
        <input name="password" type="password" placeholder="Senha inicial (mín. 10 caracteres)" minLength={10} autoComplete="new-password" className={inputCls} required />
        <div className="md:col-span-2">
          <SubmitButton>Criar usuário</SubmitButton>
        </div>
      </form>
    </div>
  );
}
