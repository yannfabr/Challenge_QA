# Estratégia de testes — Front Web (PlayLab)

## Objetivo

Iniciar a automação Front Web da área administrativa da PlayLab, protegendo as jornadas de **maior risco de negócio** com uma suíte pequena, estável e fácil de evoluir. A suíte deve rodar localmente e no CI, produzir evidências de diagnóstico e tornar explícitos os defeitos já conhecidos.

## Escopo

- **Gerenciamento de usuários** (jornada principal): carregamento, estrutura, pesquisa, ordenação, paginação e adição de usuário via modal.
- **Formulário de cadastro:** caminho feliz e validações negativas.
- **Componente assíncrono:** dropdown com carregamento atrasado.
- **Acessibilidade:** labels e análise automatizada (axe-core, WCAG 2.1 A/AA) do formulário e da tabela.
- **Responsividade:** jornadas críticas em viewport mobile e verificação de scroll horizontal.
- **Compatibilidade:** Chromium (completo) e Firefox (smoke).

## Fora de escopo

- Testes de carga, segurança e varreduras (restrição do case).
- Demais seções da PlayLab (shopping cart, wizard, iframes, Shadow DOM, datepicker etc.). Têm valor como exercício, mas não pertencem à jornada administrativa priorizada.
- Upload de arquivos (opcional no case; ver justificativa na matriz).
- Teste visual por screenshot (custo de manutenção alto para o risco atual).
- Regras que deveriam ser garantidas por camadas inferiores (limite de caracteres, tamanho e extensão de arquivo, formato de e-mail no back-end).

## Riscos identificados

Detalhados em [matriz-de-riscos.md](matriz-de-riscos.md). Resumo:

- **Funcionais:** pesquisa, ordenação e paginação incorretas; ação de escrita não refletida; validações do formulário.
- **Técnicos:** carregamento assíncrono, massa de dados mutável, CSS alterando o texto, terceiros (analytics), instabilidade do axe fora do viewport.
- **UX:** BUG-01 (rodapé "1-0 of 0") e ausência de estado vazio.
- **Acessibilidade:** 6 grupos de defeitos, 4 detectados pelo axe e 2 só por inspeção (teclado e modal).

## Estratégia de cobertura

Pirâmide aplicada ao contexto (só temos acesso ao front):

| Camada | O que cobre aqui | Observação |
|---|---|---|
| E2E pela UI (esta suíte) | Jornadas que integram vários componentes | 8 testes, foco em risco |
| Componente / unitário | Regex de e-mail, `maxlength`, comparador de ordenação | Recomendado ao time de desenvolvimento; não automatizado aqui |
| API / back-end | Persistência, regras de upload | A aplicação não tem back-end; registrado como lacuna |
| Manual / exploratório | Teclado, ordem de foco, leitor de tela, contraste em contexto | Checklist em "Limitações" |

## Critérios de priorização

1. **Impacto no negócio:** a falha impede o administrador de encontrar ou gerenciar usuários?
2. **Probabilidade de regressão:** lógica própria (ordenação, paginação, validação) pesa mais que comportamento nativo do navegador.
3. **Custo de manutenção:** cenários que dependem de valores fixos, layout visual ou dados aleatórios custam mais.
4. **Detectabilidade em outra camada:** se uma regra é mais bem testada em unidade ou API, ela não vai para a UI.

| Prioridade | Definição | Execução |
|---|---|---|
| P0 | Quebra impede a jornada principal ou permite dado inválido | Todo PR |
| P1 | Degrada a experiência ou a acessibilidade, mas há contorno | Todo PR (chromium) ou próxima iteração |
| P2 | Baixo impacto ou comportamento nativo | Manual ou backlog |

## Estratégia de automação

- **Ferramenta:** Playwright + TypeScript (auto-wait, web-first assertions, trace viewer, multi-browser nativo).
- **Seletores:** prioridade `getByRole` → `getByLabel` → `getByPlaceholder` → `getByTestId` (o `data-testid` é o contrato estável que a aplicação expõe). Sem XPath e sem índice posicional fixo.
- **Sincronização:** só por estado observável (`toBeVisible`, `toBeEnabled`, `toHaveClass(/active/)`). Nenhum `waitForTimeout`.
- **Dados:** factories com sufixo único por execução; nenhum teste depende de dado criado por outro.
- **Isolamento:** cada teste roda em um contexto novo do navegador. Como a aplicação mantém o estado em memória, não há limpeza a fazer.
- **Page Objects leves:** encapsulam localizadores e ações; as **asserções ficam no teste**, para que a intenção continue visível.
- **Defeitos conhecidos:** não são escondidos. Viram anotações (`known-bug`, `known-a11y-issue`) no relatório e entram na baseline de a11y, que faz a suíte falhar se surgir um defeito **novo**.

## Navegadores e resoluções

| Projeto | Dispositivo / viewport | Testes | Justificativa |
|---|---|---|---|
| `chromium` | Desktop Chrome, 1366×768 | Todos | Engine com maior participação de mercado; 1366×768 é a resolução de notebook corporativo mais comum, o perfil típico de um usuário administrativo |
| `firefox` | Desktop Firefox, 1366×768 | `@smoke` | Engine diferente (Gecko) detecta incompatibilidades de CSS e JS a baixo custo; rodar tudo duplicaria o tempo sem ganho proporcional |
| `mobile-chrome` | Pixel 7 (412×915, touch) | `@mobile` | Largura típica de Android, abaixo do breakpoint de 768 px da aplicação; valida o layout empilhado e as ações por toque |

WebKit/Safari fica como próximo passo: basta adicionar um projeto. Ele foi deixado de fora para manter o tempo de CI baixo nesta primeira entrega.

## Critérios de entrada e saída

**Entrada:**
- Aplicação acessível em `BASE_URL` (HTTP 200).
- Dependências instaladas (`npm ci`) e navegadores instalados.
- Type check (`tsc --noEmit`) sem erros.

**Saída (para considerar o build aprovado):**
- 100% dos testes P0 passando em todos os projetos configurados.
- Nenhuma violação de acessibilidade **nova** fora da baseline.
- Nenhum teste marcado como *flaky* (aprovado só no retry) sem investigação aberta.
- Relatório HTML e evidências publicados como artefatos.

## Frequência de execução

| Gatilho | Escopo | Motivo |
|---|---|---|
| Pull request | Suíte completa (3 projetos em paralelo) | Barrar regressões antes do merge; ~20 s por projeto |
| Push em `main` | Suíte completa | Confirmar o estado integrado |
| Manual (`workflow_dispatch`) | Por navegador e/ou tag | Reproduzir falhas e investigar |
| Agendada (recomendada, não habilitada) | `@smoke` diário | Detectar mudanças na aplicação de terceiros. Não foi habilitada para respeitar a restrição de não gerar execuções recorrentes contra um site público |

## Limitações conhecidas

- **Aplicação de terceiros, sem versionamento:** mudanças na PlayLab podem quebrar testes sem relação com a suíte.
- **Sem back-end:** os dados vivem em memória, então não há como preparar o estado via API. Cada teste parte da massa padrão.
- **Baseline de a11y por regra:** novas ocorrências de uma regra já conhecida não falham o teste. Elas aparecem no JSON anexado.
- **O axe cobre só parte dos problemas de acessibilidade** (ver README). Teclado, foco e leitor de tela exigem validação manual.
- **Contagem de execuções:** os 8 testes geram 14 execuções (8 chromium + 3 firefox + 3 mobile).

## Próximos passos

1. Cobrir exclusão (USR-09) depois da definição de produto sobre confirmação.
2. FRM-08 / A11Y-03: operação do formulário só por teclado.
3. DYN-03: tabela com colunas embaralhadas, reaproveitando `columnValues`.
4. A11Y-07: foco no modal, depois da correção do A11Y-BUG-06.
5. Projeto WebKit (Safari) e um tablet (768 px, no limite do breakpoint).
6. Teste visual seletivo (`toHaveScreenshot`) só para o card da tabela em mobile.
7. Integrar o relatório a um dashboard de histórico (flakiness ao longo do tempo).
