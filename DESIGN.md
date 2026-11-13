# Musical de Natal — Style Reference
> picadeiro de papel: adesivos do elenco, objetos 3D infláveis e números gigantes sobre papel creme

**Theme:** light (papel), com uma faixa escura de "palco"

Mistura de três identidades com a lógica de colagem do *Slush*:
- **2024 · O Melhor Natal**: papel creme, verde-pinheiro, vermelho-pipoca, letreiro dourado, luz turquesa.
- **2025 · O Descendente**: vermelho de cortina, laranja de picadeiro, letreiro de circo em relevo, marquise de lâmpadas.
- **2026 · O Milagre do Natal**: logotipo dourado com swash, vitral em arco, estrela de oito pontas.

O elenco vira **adesivo** (recorte com borda branca e contorno preto), os símbolos das IDs viram **objetos 3D infláveis** e os números viram **escultura tipográfica**.

## Cores

| Nome | Valor | Papel |
|---|---|---|
| Carbono | `#0B0B0B` | Texto, contornos de 1px, CTA principal |
| Papel | `#F1EBDD` | Fundo da página (ID 2024) |
| Branco | `#FFFFFF` | Cards, menu, botões contornados, borda dos adesivos |
| Menta-palco | `#D3ECE6` | Faixa de seção (luz turquesa 2024) |
| Pêssego | `#F8DCC8` | Faixa de seção (calor 2025) |
| Creme-ouro | `#F5E3B5` | Faixa de seção (dourado 2026) |
| Vermelho-cortina | `#D2381F` | Adesivo, faixa de CTA final, balde de pipoca |
| Verde-pinheiro | `#0E5A3A` | Adesivo, copo, selos |
| Turquesa | `#1FA3A0` | Adesivo, aro de acrobacia |
| Ouro | `#E8B23A` | Logotipo 3D, adesivo, cota Ouro |
| Laranja-picadeiro | `#F26A1B` | Adesivo de destaque |
| Palco | `#140C0A` | Única faixa escura: mural de patrocinadores |

As cores de adesivo nunca viram cor de ação: CTA é preto preenchido ou contorno preto. **Sem gradientes** em superfícies e textos; a profundidade vem do 3D.

## Tipografia
- **Display:** Bowlby One, de 72 a 320px, entrelinha de 0.78 a 0.85, caixa alta. Números e títulos viram objetos.
- **UI e texto:** Inter Tight 500 (texto) e 700 (subtítulos, menu e botões). Botões usam +0.03em de espaçamento.
- **Letreiros oficiais:** os logotipos das IDs entram como imagem ou 3D, nunca refeitos em fonte.

## Forma
- Contorno de 1px Carbono em todo elemento interativo.
- Menu, botões e selos em pílula. Cards com raio de 24 a 40px. Sem sombras.
- Adesivos com borda branca, contorno preto e rotação de -8° a 8°, sobrepondo títulos, fora do grid.

## Movimento
- Faixa corrida preta no topo, em loop.
- Entrada única no hero: os adesivos "colam" em sequência (escala 0.9→1, rotação, 420ms ease-out).
- Objetos 3D flutuam devagar e seguem o ponteiro. Ficam parados com `prefers-reduced-motion`.
- Botões vão a `scale(0.97)` no `:active`. Adesivos fazem um leve *wiggle* em spring no hover.
- Nada de surgimento suave repetido em cada seção.

## Proibições (Impeccable / Emil / Slush)
Rótulo pequeno acima do título, números de seção, texto em gradiente, `transition: all`, entrada de `scale(0)`, legenda sob a imagem e grades de cards idênticos.
