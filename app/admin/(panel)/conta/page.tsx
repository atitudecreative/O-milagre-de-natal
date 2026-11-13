import { changeOwnPasswordAction } from '../../actions';
import { inputCls, Notice, PageTitle } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/client';

export default async function Account({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="max-w-md">
      <PageTitle title="Minha senha" />
      <Notice ok={sp.ok} erro={sp.erro} />
      <form action={changeOwnPasswordAction} className="space-y-4">
        <input name="current" type="password" placeholder="Senha atual" autoComplete="current-password" className={inputCls} required />
        <input name="next" type="password" placeholder="Nova senha (mín. 10 caracteres)" autoComplete="new-password" minLength={10} className={inputCls} required />
        <SubmitButton>Alterar senha</SubmitButton>
      </form>
    </div>
  );
}
