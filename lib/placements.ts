import type { Row } from '@/lib/schema';

/** Em quais cotas cada aplicação de marca está prevista (lido das contrapartidas cadastradas). */
export function placementsFrom(tiers: Row[]) {
  const has = (re: RegExp) => tiers.filter((t) => re.test(`${t.benefits ?? ''}\n${t.deliverables ?? ''}`)).map((t) => String(t.name));
  return {
    led: has(/tel[aã]o|led/i),
    vip: has(/[áa]rea vip|sala vip/i),
    materiais: has(/materiais oficiais|stand/i),
    pipoca: has(/pipoca/i),
  };
}
