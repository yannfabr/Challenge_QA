# Matriz de cenários

**Legenda de status:** ✅ Automatizado · 🔁 Coberto por outro teste · 📝 Manual · ⏭️ Próximo passo · ❌ Não automatizar

Os 8 testes automatizados agrupam cenários de referência relacionados (por exemplo, USR-05 e USR-06 no mesmo teste), porque compartilham o mesmo estado e o mesmo risco protegido. Separá-los repetiria a preparação sem proteger nada a mais.

## Testes implementados

| # | Arquivo | Cenários | Tags | Projetos |
|---|---|---|---|---|
| T1 | `tests/users/users-table.spec.ts` | USR-01, USR-02, USR-07, RSP-04 | @smoke @mobile | chromium, firefox, mobile-chrome |
| T2 | `tests/users/users-table.spec.ts` | USR-03, USR-04 (negativo) | @smoke @mobile | chromium, firefox, mobile-chrome |
| T3 | `tests/users/users-table.spec.ts` | USR-05, USR-06 | — | chromium |
| T4 | `tests/users/users-table.spec.ts` | USR-08 | — | chromium |
| T5 | `tests/forms/registration.spec.ts` | FRM-01, FRM-07 | @smoke @mobile | chromium, firefox, mobile-chrome |
| T6 | `tests/forms/registration.spec.ts` | FRM-02, FRM-03, FRM-06 (negativo) | — | chromium |
| T7 | `tests/dynamic/delayed-dropdown.spec.ts` | DYN-01, DYN-02, DYN-05, DYN-06, DYN-07 | — | chromium |
| T8 | `tests/accessibility/a11y.spec.ts` | A11Y-02, A11Y-06 | @a11y | chromium |

## Matriz completa

| ID | Jornada | Descrição | Tipo | Risco protegido | Prioridade | Automatizar? | Justificativa | Status |
|---|---|---|---|---|---|---|---|---|
| USR-01 | Usuários | Carregamento da tabela | Funcional / smoke | RF-03 | P0 | Sim | Porta de entrada da jornada principal; se falhar, nada mais funciona | ✅ T1 |
| USR-02 | Usuários | Estrutura e cabeçalhos | Funcional | RF-02, RT-04 | P0 | Sim | Barato e detecta regressões de layout que quebram todas as outras verificações | ✅ T1 |
| USR-03 | Usuários | Localizar usuário existente | Funcional | RF-01 | P0 | Sim | Ação mais frequente do administrador | ✅ T2 |
| USR-04 | Usuários | Usuário inexistente | Funcional / negativo | RF-01, RU-01 | P0 | Sim | Cenário negativo obrigatório; revelou o BUG-01 | ✅ T2 |
| USR-05 | Usuários | Ordenar por coluna | Funcional | RF-02 | P0 | Sim | Lógica de ordenação é propensa a regressão (tipos e locale) | ✅ T3 |
| USR-06 | Usuários | Navegar entre páginas | Funcional | RF-03 | P0 | Sim | Combinado com USR-05: valida que a ordenação persiste e que não há duplicação nem omissão | ✅ T3 |
| USR-07 | Usuários | Situação do usuário | Funcional / dados | RF-01 | P1 | Sim | Validado por regra de domínio (active/inactive/pending), sem valor fixo | ✅ T1 |
| USR-08 | Usuários | Executar ação (adicionar) | Funcional / E2E | RF-04 | P0 | Sim | Única operação de escrita com resultado verificável; usa modal | ✅ T4 |
| USR-09 | Usuários | Excluir usuário | Funcional | RF-08 | P1 | Não (por ora) | Aguarda decisão de produto sobre confirmação; automatizar o comportamento atual congelaria um possível defeito | ⏭️ |
| USR-10 | Usuários | Filtro por papel | Funcional | RF-01 | P1 | Não (por ora) | Mesma lógica de `filter` da pesquisa (T2); retorno marginal | ⏭️ |
| FRM-01 | Formulário | Envio com dados válidos | Funcional / smoke | RF-06 | P0 | Sim | Caminho feliz de conversão | ✅ T5 |
| FRM-02 | Formulário | Obrigatórios vazios | Negativo | RF-05 | P0 | Sim | Validação central do formulário | ✅ T6 |
| FRM-03 | Formulário | E-mail inválido | Negativo / data-driven | RF-05 | P0 | Sim | Três formatos inválidos; verifica isolamento do erro no campo | ✅ T6 |
| FRM-04 | Formulário | Limite de caracteres | Funcional | — | P2 | Não | `maxlength` é comportamento nativo do navegador; a regra pertence a teste de componente ou de API | ❌ |
| FRM-05 | Formulário | Reset | Funcional | — | P2 | Não | Baixo impacto; botão nativo `type="reset"` | ⏭️ |
| FRM-06 | Formulário | Mensagens de erro | Funcional | RF-05 | P0 | Sim | Texto exato por campo | ✅ T6 |
| FRM-07 | Formulário | Associação label ↔ campo | A11y | A11Y | P1 | Sim | Indireta: todos os campos são localizados com `getByLabel` | 🔁 T5/T8 |
| FRM-08 | Formulário | Operação por teclado | A11y | A11Y | P1 | Não (por ora) | Bom candidato para a próxima iteração | ⏭️ |
| DYN-01 | Dinâmicos | Aguardar dropdown assíncrono | Sincronização | RT-01 | P0 | Sim | Exercita sincronização sem espera fixa | ✅ T7 |
| DYN-02 | Dinâmicos | Selecionar opção dinâmica | Funcional | RT-01 | P0 | Sim | — | ✅ T7 |
| DYN-03 | Dinâmicos | Colunas que mudam de posição | Robustez | RT-04 | P1 | Não (por ora) | A técnica (índice pelo cabeçalho) já está em `UsersTablePage.columnValues` | ⏭️ |
| DYN-04 | Dinâmicos | Comportamento após recarregar | Funcional | RF-09 | P2 | Não | Requisito indefinido (persistência?); precisa de decisão de produto | ❌ |
| DYN-05 | Dinâmicos | Dados sem valores fixos | Robustez | RT-02 | P0 | Sim | Opção escolhida a partir da lista carregada | ✅ T7 (também T1–T3) |
| DYN-06 | Dinâmicos | Múltiplos cliques | Robustez | RT-01 | P1 | Sim | Verifica o botão desabilitado durante o carregamento | ✅ T7 |
| DYN-07 | Dinâmicos | Estado de carregamento | UX | RT-01 | P1 | Sim | Loader visível e depois oculto | ✅ T7 |
| DYN-08 | Dinâmicos | Opção indisponível | Funcional | — | P2 | Não | `<option disabled>` nativo; baixo risco | ⏭️ |
| UPL-01..05 | Upload | Upload de arquivos | Funcional | — | P2 | Não | Opcional no case; UPL-04 exigiria versionar arquivo > 5 MB. A regra de tamanho e de extensão deve ser garantida no back-end | ⏭️ |
| A11Y-01 | A11y | Nomes acessíveis | A11y | A11Y-BUG-01/03 | P1 | Sim (via axe) | Regras `button-name`, `select-name` | 🔁 T8 |
| A11Y-02 | A11y | Labels do formulário | A11y | A11Y | P0 | Sim | — | ✅ T8 |
| A11Y-03 | A11y | Navegação por teclado | A11y | A11Y-BUG-05 | P1 | Não (por ora) | Inspeção manual identificou defeito; automatizar depois da correção | 📝 |
| A11Y-04 | A11y | Ordem de foco | A11y | — | P2 | Não | Exige julgamento humano sobre a ordem "lógica" | 📝 |
| A11Y-05 | A11y | Hierarquia de títulos | A11y | — | P2 | Não | Melhor coberta por lint de HTML ou revisão manual | 📝 |
| A11Y-06 | A11y | Análise automatizada | A11y | A11Y-BUG-01..04 | P0 | Sim | axe-core com baseline de defeitos conhecidos | ✅ T8 |
| A11Y-07 | A11y | Modal sem armadilha de teclado | A11y | A11Y-BUG-06 | P1 | Não (por ora) | Modal já falha em requisitos básicos (foco, Esc); o teste seria vermelho até a correção | 📝 |
| RSP-01 | Responsivo | Jornada crítica em desktop | Responsivo | RU-03 | P0 | Sim | Projeto `chromium` (1366×768) | 🔁 T1–T8 |
| RSP-02 | Responsivo | Jornada crítica em mobile | Responsivo | RU-03 | P0 | Sim | Projeto `mobile-chrome` (Pixel 7) com testes `@mobile` | 🔁 T1, T2, T5 |
| RSP-03 | Responsivo | Ausência de sobreposição | Visual | RU-02 | P2 | Não | Exige comparação visual (screenshot), com alto custo de manutenção | ⏭️ |
| RSP-04 | Responsivo | Sem scroll horizontal | Responsivo | RU-02 | P1 | Sim | Verificação por métrica (`scrollWidth`), sem screenshot | ✅ T1 |
| RSP-05 | Responsivo | Ações em tela reduzida | Responsivo | RU-03 | P1 | Sim | Pesquisa e envio de formulário executados no mobile | 🔁 T2, T5 |
