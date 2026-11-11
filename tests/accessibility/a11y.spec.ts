import { expect, test } from '../../src/fixtures/test';
import { findNewA11yViolations } from '../../src/utils/a11y';

test.describe('Acessibilidade', () => {
  test(
    'A11Y-02/06 formulário e tabela sem violações WCAG A/AA fora da baseline conhecida',
    { tag: ['@a11y'] },
    async ({ registrationPage, page }, testInfo) => {
      await test.step('A11Y-02: campos obrigatórios possuem label associado e são editáveis', async () => {
        for (const field of [registrationPage.fullName, registrationPage.email, registrationPage.password]) {
          await expect(field).toBeEditable();
        }
        await expect(registrationPage.terms).toBeEnabled();
      });

      await test.step('A11Y-06: análise automatizada (axe) do formulário de cadastro', async () => {
        const newViolations = await findNewA11yViolations(page, testInfo, '[data-testid="registration-form"]');
        expect(newViolations, 'violações novas no formulário').toEqual([]);
      });

      await test.step('A11Y-06: análise automatizada (axe) da tabela de usuários', async () => {
        const newViolations = await findNewA11yViolations(page, testInfo, '[data-testid="table-card"]');
        expect(newViolations, 'violações novas na tabela').toEqual([]);
      });
    },
  );
});
