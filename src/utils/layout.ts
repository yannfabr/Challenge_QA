import { expect, type Page } from '@playwright/test';

/**
 * RSP-04: a página não deve ter scroll horizontal no nível do documento.
 * Tabelas largas podem rolar dentro do próprio contêiner — isso é aceitável
 * e não é capturado aqui, pois não desloca o layout da página inteira.
 */
export async function expectNoHorizontalPageScroll(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, 'largura do documento não deve exceder o viewport').toBeLessThanOrEqual(clientWidth);
}
