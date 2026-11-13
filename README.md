# Front Web QA Challenge — PlayLab

Suíte de automação Front Web, escrita com **Playwright + TypeScript**, para a área administrativa da [PlayLab — Playwright Practice Arena](https://playwrightlab.github.io/).

O foco é **risco, não volume**. São 8 testes que cobrem a jornada de gerenciamento de usuários, o formulário de cadastro, um componente assíncrono, acessibilidade e responsividade. Eles rodam em 3 projetos (Chromium, Firefox e mobile) e geram relatório e evidências no CI.

| Documento | Conteúdo |
|---|---|
| [docs/estrategia-de-testes.md](docs/estrategia-de-testes.md) | Objetivo, escopo, priorização, navegadores, critérios de entrada e saída |
| [docs/matriz-de-riscos.md](docs/matriz-de-riscos.md) | Riscos funcionais, técnicos, de UX e de a11y, incluindo **defeitos encontrados** |
| [docs/matriz-de-cenarios.md](docs/matriz-de-cenarios.md) | Todos os cenários de referência: o que foi automatizado, o que não foi e por quê |

## Escopo implementado

| # | Teste | Cenários | Tags |
|---|---|---|---|
| T1 | Carrega a tabela com estrutura, paginação inicial e dados consistentes | USR-01/02/07, RSP-04 | `@smoke` `@mobile` |
| T2 | Localiza usuário existente e trata pesquisa sem resultados | USR-03/04 (negativo) | `@smoke` `@mobile` |
| T3 | Ordena por nome e mantém a ordenação entre páginas | USR-05/06 | |
| T4 | Adiciona usuário pelo modal e o localiza na tabela | USR-08 | |
| T5 | Cadastra com dados válidos e exibe confirmação | FRM-01/07 | `@smoke` `@mobile` |
| T6 | Bloqueia envio inválido e exibe mensagem por campo | FRM-02/03/06 (negativo) | |
| T7 | Carrega opções sob demanda e permite selecionar | DYN-01/02/05/06/07 | |
| T8 | Formulário e tabela sem violações WCAG fora da baseline | A11Y-02/06 | `@a11y` |

### Defeitos encontrados durante a análise

- **BUG-01:** a pesquisa sem resultados exibe "Showing **1-0** of 0 entries".
- **BUG-02:** o modal "Add User" com campos vazios cria o usuário "New User / new@example.com".
- **A11Y-BUG-01..06:** controles sem nome acessível, contraste insuficiente, cabeçalhos ordenáveis inacessíveis por teclado, modal sem gestão de foco.

Detalhes em [matriz-de-riscos.md](docs/matriz-de-riscos.md).

## Stack

| Item | Versão | Motivo |
|---|---|---|
| Node.js | ≥ 20 | LTS |
| @playwright/test | 1.64.1 (fixa) | Auto-wait, multi-browser, trace viewer, fixtures |
| TypeScript | 5.7 | Tipagem dos Page Objects e dos dados |
| @axe-core/playwright | 4.10.1 | Análise automatizada WCAG |

As versões estão fixadas. O `overrides` do `package.json` força o `@axe-core/playwright` a usar o mesmo `playwright-core` da suíte; sem isso, ele puxa uma versão diferente e os tipos de `Page` entram em conflito.

## Pré-requisitos

- Node.js 20+ e npm
- Acesso à internet (aplicação pública e download dos navegadores)

## Instalação

```bash
npm ci
npx playwright install --with-deps chromium firefox
cp .env.example .env   # opcional: BASE_URL tem valor padrão
```

## Execução

```bash
npm test                    # todos os projetos (chromium completo, firefox @smoke, mobile @mobile)
npm run test:chromium       # só Chromium
npm run test:firefox        # só Firefox
npm run test:mobile         # só o projeto mobile (Pixel 7)
npm run test:smoke          # só testes @smoke
npm run test:a11y           # só testes @a11y
npm run test:headed         # Chromium com navegador visível
npm run typecheck           # tsc --noEmit

# exemplos avulsos
npx playwright test tests/users                         # uma pasta
npx playwright test -g "USR-08"                         # pelo nome
npx playwright test --project=chromium --repeat-each=5  # caçar flakiness
```

### Execução mobile

O projeto `mobile-chrome` emula um Pixel 7 (412×915, toque, user agent mobile) e executa os testes com a tag `@mobile`. Para adaptar outro cenário ao mobile, basta incluir a tag:

```ts
test('meu cenário', { tag: ['@mobile'] }, async ({ page }) => { /* ... */ });
```

## Relatório e evidências

```bash
npm run report        # abre playwright-report/index.html
npx playwright show-trace test-results/<pasta-do-teste>/trace.zip
```

| Evidência | Quando é gerada |
|---|---|
| Relatório HTML | Sempre |
| Screenshot | Em falha |
| Vídeo | Mantido em falha |
| Trace | Mantido em falha |
| JUnit XML | No CI (`test-results/junit.xml`) |
| JSON do axe | Sempre, anexado ao teste T8 |
| Anotações `known-bug` / `known-a11y-issue` | Sempre, visíveis no relatório |

`playwright-report/` e `test-results/` estão no `.gitignore`. No CI, eles são publicados como artefatos, mesmo quando há falha.

## Pipeline (GitHub Actions)

O arquivo [`.github/workflows/tests.yml`](.github/workflows/tests.yml) executa:

1. Checkout.
2. Setup do Node 20 com **cache do npm**.
3. `npm ci`.
4. Instalação do navegador do projeto, com **cache dos binários** por versão do Playwright.
5. Type check.
6. Execução por projeto, em uma **matriz paralela** (um job por navegador, `fail-fast: false`).
7. Upload do relatório HTML e das evidências com `if: !cancelled()`, para **preservá-los mesmo em falha**.

Execução manual (`workflow_dispatch`) com escolha do **navegador** e do **filtro por tag**. O `concurrency` cancela execuções obsoletas do mesmo branch.

## Arquitetura

```text
├── .github/workflows/tests.yml   # pipeline
├── docs/                         # estratégia, riscos, cenários
├── src/
│   ├── data/factories.ts         # geração de dados únicos e fictícios
│   ├── fixtures/test.ts          # test estendido: page objects + bloqueio de terceiros
│   ├── pages/                    # page objects (localizadores e ações, sem asserções)
│   └── utils/                    # a11y (axe + baseline) e layout (scroll horizontal)
├── tests/                        # specs por domínio
│   ├── users/  forms/  dynamic/  accessibility/
├── playwright.config.ts          # configuração centralizada (projetos, evidências, workers)
└── tsconfig.json
```

**Por que não há `tests/responsive/`:** a responsividade é uma **dimensão de execução**, não um domínio. Em vez de duplicar jornadas numa pasta própria, o projeto `mobile-chrome` reexecuta as jornadas críticas marcadas com `@mobile`.

**Page Objects leves:** guardam localizadores e ações de negócio (`addUser`, `fill`). As asserções ficam nos specs, para que cada teste mostre o que está provando.

## Estratégia de seletores

Na ordem de preferência:

1. `getByRole` / `getByLabel`: refletem como o usuário e as tecnologias assistivas percebem a página. Usar `getByLabel` no formulário já valida a associação label ↔ campo.
2. `getByPlaceholder`: quando não há label (o campo de pesquisa da tabela).
3. `getByTestId`: o `data-testid` é o contrato estável que a aplicação expõe, usado onde não há nome acessível (botões de paginação, linhas da tabela) **ou** onde o nome acessível tem defeito.

Evitados: XPath, classes CSS de estilo e índices fixos. A coluna da tabela é localizada pelo **texto do cabeçalho**, e não pela posição.

## Estratégia de sincronização

- Nenhum `waitForTimeout`. Toda espera é uma asserção web-first sobre um estado observável:
  - dropdown assíncrono: `loader` visível, depois `select` habilitado, depois `loader` oculto;
  - paginação: botão da página com classe `active` antes de ler os dados;
  - modal: `toBeHidden()` após confirmar.
- O timeout do `expect` só foi ampliado no ponto do carregamento de ~2 s.
- Validado com `--repeat-each=3`: 24 de 24 execuções aprovadas.

## Estratégia de dados de teste

- `src/data/factories.ts` gera dados **únicos** (sufixo UUID) e **fictícios** (domínio reservado `.test`), aceitando `overrides` por cenário.
- Os testes não dependem de valores fixos da aplicação: o nome pesquisado é lido da própria tabela e a opção do dropdown vem da lista carregada.
- Como a aplicação mantém o estado em memória e cada teste usa um contexto novo, não existe estado compartilhado nem necessidade de limpeza.

## Decisões técnicas e trade-offs

| Decisão | Trade-off |
|---|---|
| Agrupar cenários relacionados no mesmo teste, com `test.step` | Menos preparação repetida e relatório legível por passo; em compensação, uma falha inicial interrompe os passos seguintes |
| Firefox só com `@smoke` | CI mais rápido; incompatibilidades fora das jornadas críticas podem passar despercebidas |
| Baseline de a11y por **regra**, não por elemento | Estável (os seletores do axe variam), mas uma nova ocorrência de regra já conhecida não falha o teste; o JSON completo fica anexado |
| BUG-01 como anotação, e não como `test.fail()` | `test.fail()` inverteria o teste inteiro e esconderia outras regressões |
| Leitura com `textContent` em vez de `innerText` | Testa o dado e não a apresentação (o CSS aplica `uppercase`) |
| Bloqueio de analytics via `page.route` | Menos ruído e latência; não afeta o comportamento sob teste |
| Workers limitados (2 no CI) | Execução um pouco mais lenta, mas respeita a aplicação de terceiros |

## Acessibilidade: limitações da ferramenta automatizada

O axe-core detecta em torno de **30% a 40%** dos problemas WCAG: atributos ausentes, contraste calculável, ARIA inválido. Nesta aplicação ele **não** detectou:

- cabeçalhos ordenáveis inacessíveis por teclado (A11Y-BUG-05);
- modal sem foco inicial e sem fechamento por Esc (A11Y-BUG-06).

Validações que continuam manuais: navegação completa por teclado e ordem de foco, uso real com leitor de tela (NVDA ou VoiceOver), contraste sobre imagens ou gradientes, zoom a 200% e reflow, e se os textos alternativos fazem sentido.

## Limitações conhecidas

- A aplicação é pública, de terceiros e sem versionamento: mudanças nela podem quebrar a suíte.
- Não há back-end nem API para preparar estado; todo teste parte da massa padrão.
- WebKit/Safari ainda não está configurado.
- Ver também [estrategia-de-testes.md](docs/estrategia-de-testes.md#limitações-conhecidas).

## Uso de Inteligência Artificial

- **Ferramenta:** Claude Code (Anthropic).
- **Atividades em que foi usada:** esqueleto do projeto e configuração do Playwright; rascunho dos page objects, dos testes, da pipeline e da documentação.
- **Problemas identificados durante a revisão:**
  - conflito de versões entre `@axe-core/playwright` e `@playwright/test` (tipos de `Page` incompatíveis), resolvido com versão fixa e `overrides`;
  - asserção de cabeçalhos falhando por `text-transform: uppercase` (`innerText` → `textContent`);
  - resultados do axe variando com a posição de rolagem, e baseline por seletor instável, substituída por baseline por regra.
- **Como foi validado:** execução local nos 3 projetos (chromium, firefox e mobile-chrome); execução de todos os testes em modo headed (`npm run test:headed`) para acompanhar visualmente cada passo na aplicação; repetição (`--repeat-each=3`) para verificar a estabilidade; conferência manual dos defeitos encontrados (BUG-01, BUG-02 e A11Y) diretamente na aplicação.
- **Decisões técnicas:**
  - a seleção dos testes, a priorização e o trade-off de compatibilidade (suíte completa no Chromium, apenas `@smoke` no Firefox) foram propostos pela IA; analisei cada cenário da matriz, avaliei as justificativas e aprovei o que seria e o que não seria automatizado;
  - foram **minhas** as decisões de execução e entrega: desenvolver e executar tudo localmente, sem que a IA publicasse ou versionasse nada, e enviar o código ao GitHub, usando branch e Pull Request.
- **Ajustes feitos por mim após a primeira entrega:** sincronização da pesquisa com `toHaveCount` antes de ler os dados; validação da ordenação crescente e decrescente pelos dados exibidos (o indicador "↕" do cabeçalho não muda); trace mantido em qualquer falha (`retain-on-failure`); correção dos IDs do teste dinâmico.
- **Histórico do repositório:** os primeiros commits foram feitos pela interface web do GitHub e mantêm as mensagens padrão ("Add files via upload", "Update README.md"). Os commits seguintes usam mensagens descritivas.

## Próximos passos

1. **Exclusão de usuário (USR-09):** automatizar após definição de produto sobre confirmação antes de excluir.
2. **Operação por teclado (FRM-08 / A11Y-03):** preencher e enviar o formulário usando apenas o teclado.
3. **Tabela dinâmica (DYN-03):** validar a tabela com colunas embaralhadas, reaproveitando a busca de coluna pelo cabeçalho.
4. **Foco no modal (A11Y-07):** validar foco inicial, fechamento com Esc e ausência de armadilha de teclado, após correção do A11Y-BUG-06.
5. **Novos navegadores e resoluções:** adicionar WebKit (Safari) e um tablet (768 px, no limite do breakpoint).
6. **Teste visual seletivo:** `toHaveScreenshot` apenas para o card da tabela em mobile.
7. **Histórico de execuções:** acompanhar flakiness ao longo do tempo com um dashboard de resultados.
