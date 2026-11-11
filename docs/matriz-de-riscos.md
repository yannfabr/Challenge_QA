# Matriz de riscos

Análise feita a partir de **exploração manual** da aplicação, **leitura do código-fonte do front** (`js/app.js`, `index.html`) e **execução exploratória** com Playwright e axe-core.

Escala de impacto e probabilidade: Alto / Médio / Baixo. A prioridade combina as duas com o critério de valor de negócio descrito em [estrategia-de-testes.md](estrategia-de-testes.md#critérios-de-priorização).

## Riscos funcionais

| ID | Risco | Impacto | Prob. | Prioridade | Mitigação |
|---|---|---|---|---|---|
| RF-01 | Pesquisa ou filtro retornando usuários errados, ou omitindo usuários existentes | Alto | Média | P0 | USR-03/04 automatizado |
| RF-02 | Ordenação incorreta ou perdida ao trocar de página | Alto | Média | P0 | USR-05/06 automatizado |
| RF-03 | Paginação duplicando ou omitindo registros | Alto | Média | P0 | USR-05/06 verifica unicidade e total |
| RF-04 | Ação (adicionar) não refletida na tabela ou no total | Alto | Média | P0 | USR-08 automatizado |
| RF-05 | Formulário aceitando dados inválidos | Alto | Média | P0 | FRM-02/03/06 automatizado |
| RF-06 | Formulário rejeitando dados válidos (falso negativo bloqueia cadastro) | Alto | Baixa | P0 | FRM-01 automatizado |
| RF-07 | **BUG-02:** "Add User" com campos vazios cria o registro "New User / new@example.com" (valores padrão silenciosos e nenhuma validação de e-mail no modal) | Médio | Alta (confirmado) | P1 | Reportado; teste candidato quando houver requisito de validação |
| RF-08 | Exclusão imediata, sem confirmação nem desfazer (perda acidental de dados) | Alto | Alta (por inspeção de código) | P1 | Requer decisão de produto; não automatizado |
| RF-09 | Dados da tabela mantidos só em memória: alterações se perdem ao recarregar | Médio | Alta (por inspeção de código) | P2 | Comportamento esperado indefinido (DYN-04 não automatizado) |

## Riscos técnicos (da automação)

| ID | Risco | Mitigação adotada |
|---|---|---|
| RT-01 | Carregamento assíncrono (~2 s) gera esperas frágeis | Sincronização por estado observável (loader, `toBeEnabled`); nenhum `waitForTimeout` |
| RT-02 | Massa de dados da aplicação pública pode mudar sem aviso | Asserções por regra (formato, domínio, ordenação) e valores lidos da própria tela |
| RT-03 | CSS altera o texto renderizado (`text-transform: uppercase` nos cabeçalhos) | Leitura via `textContent` (dado), não `innerText` (apresentação) |
| RT-04 | Colunas que mudam de posição quebram seletores por índice | Índice da coluna resolvido pelo texto do cabeçalho |
| RT-05 | Analytics de terceiros adiciona latência e é poluído pelos testes | Bloqueio de `googletagmanager`/`google-analytics` via `page.route` (fixture automática) |
| RT-06 | Resultado do axe varia conforme a posição de rolagem (contraste "incompleto" fora do viewport) | Scroll até o escopo antes de cada scan |
| RT-07 | Seletores gerados pelo axe são instáveis entre execuções | Baseline por regra e escopo, não por seletor |
| RT-08 | Aplicação de terceiros: paralelismo excessivo pode prejudicar a disponibilidade | Workers limitados (2 no CI), 1 retry, sem execuções em loop |
| RT-09 | Estado compartilhado entre testes (dados criados por um teste afetam outro) | Cada teste abre um novo contexto; os dados vivem só em memória na página; factories geram dados únicos |

## Riscos de experiência do usuário

| ID | Risco | Impacto | Status |
|---|---|---|---|
| RU-01 | **BUG-01:** pesquisa sem resultados mostra "Showing **1-0** of 0 entries" e nenhuma mensagem de estado vazio | Baixo | Confirmado; registrado como anotação `known-bug` no teste USR-03/04 |
| RU-02 | Layout mobile com scroll horizontal da página | Médio | Coberto (RSP-04), sem ocorrência no Pixel 7 |
| RU-03 | Ações principais inacessíveis em tela reduzida | Alto | Coberto parcialmente (pesquisa e envio do formulário no projeto mobile) |

## Riscos de acessibilidade

| ID | Risco | Severidade (axe) | Status |
|---|---|---|---|
| A11Y-BUG-01 | Botões "anterior"/"próxima" da paginação sem nome acessível | critical | Confirmado (baseline) |
| A11Y-BUG-02 | Checkbox "selecionar todos" e checkboxes de linha sem label | critical | Confirmado (baseline) |
| A11Y-BUG-03 | Selects "por página" e "filtro de papel" sem nome acessível | critical | Confirmado (baseline) |
| A11Y-BUG-04 | Contraste abaixo de 4.5:1: badges, "+ Add User", rodapé, "Register", contador de caracteres | serious | Confirmado (baseline) |
| A11Y-BUG-05 | Cabeçalhos ordenáveis não focáveis por teclado e sem `aria-sort` | — (o axe não detecta) | Confirmado por inspeção; validação manual |
| A11Y-BUG-06 | Modal não move o foco ao abrir, não fecha com Esc e não tem nome acessível (`aria-labelledby`) | — (o axe não detecta) | Confirmado por execução exploratória; validação manual |

> Nenhum desses defeitos foi "corrigido" para fazer a suíte passar. Os conhecidos ficam explícitos na baseline (`src/utils/a11y.ts`) e nas anotações do relatório. A suíte falha se surgir uma violação **nova**.
