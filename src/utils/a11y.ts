import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

/**
 * Baseline de violações conhecidas, por escopo e por regra do axe.
 * Todas estão registradas em docs/matriz-de-riscos.md.
 *
 * Trade-off: a comparação é por REGRA e não por elemento, porque os seletores
 * gerados pelo axe não são estáveis entre execuções. Assim, o teste falha quando
 * surge um TIPO novo de violação; novas ocorrências de um tipo já conhecido não
 * falham, mas aparecem no relatório anexado a cada execução.
 * Ao corrigir um defeito, remova-o daqui — o teste passa a protegê-lo.
 */
export const KNOWN_A11Y_ISSUES: Record<string, Record<string, string>> = {
  '[data-testid="registration-form"]': {
    'color-contrast': 'A11Y-BUG-04: contador de caracteres e botão "Register" abaixo de 4.5:1',
  },
  '[data-testid="table-card"]': {
    'button-name': 'A11Y-BUG-01: botões de página anterior/próxima sem nome acessível',
    label: 'A11Y-BUG-02: checkboxes "selecionar todos" e de cada linha sem label',
    'select-name': 'A11Y-BUG-03: selects "por página" e "filtro de papel" sem nome acessível',
    'color-contrast': 'A11Y-BUG-04: badges de papel/situação, botão "+ Add User" e rodapé abaixo de 4.5:1',
  },
};

export interface A11yViolation {
  rule: string;
  impact: string | null | undefined;
  help: string;
  occurrences: number;
}

/**
 * Executa o axe (WCAG 2.0/2.1 níveis A e AA) no escopo informado, anexa o
 * relatório completo ao teste e retorna apenas as violações fora da baseline.
 */
export async function findNewA11yViolations(page: Page, testInfo: TestInfo, scope: string): Promise<A11yViolation[]> {
  // O axe não consegue calcular contraste de elementos fora do viewport
  // (resultado "incomplete"). Rolar até o escopo torna o resultado determinístico.
  await page.locator(scope).scrollIntoViewIfNeeded();

  const results = await new AxeBuilder({ page })
    .include(scope)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  await testInfo.attach(`axe${scope.replace(/\W+/g, '-')}.json`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  const known = KNOWN_A11Y_ISSUES[scope] ?? {};
  for (const v of results.violations.filter((v) => known[v.id])) {
    testInfo.annotations.push({ type: 'known-a11y-issue', description: `${known[v.id]} (${v.nodes.length} ocorrência(s))` });
  }

  return results.violations
    .filter((v) => !known[v.id])
    .map((v) => ({ rule: v.id, impact: v.impact, help: v.help, occurrences: v.nodes.length }));
}
