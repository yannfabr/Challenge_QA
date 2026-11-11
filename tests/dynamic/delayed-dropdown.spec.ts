import { expect, test } from '../../src/fixtures/test';

/**
 * O dropdown simula uma chamada de API com ~2s de atraso.
 * Nenhuma espera fixa é usada: a sincronização acontece pelos estados
 * observáveis do componente (botão, loader e select habilitado).
 */
test.describe('Componentes assíncronos', () => {
  test('DYN-01/02/06/07 carrega opções sob demanda e permite selecionar uma delas', async ({ page }) => {
    await page.goto('/');
    const card = page.getByTestId('delayed-dropdown-card');
    const loadButton = card.getByRole('button', { name: 'Load Options' });
    const select = card.getByLabel('Select Category');
    const loader = card.getByTestId('delayed-dropdown-loader');
    const result = card.getByTestId('delayed-dropdown-result');

    await test.step('estado inicial: select desabilitado e sem opções reais', async () => {
      await expect(select).toBeDisabled();
      await expect(select.locator('option')).toHaveCount(1);
    });

    await test.step('durante o carregamento: loader visível e botão bloqueado contra cliques repetidos', async () => {
      await loadButton.click();
      await expect(loader).toBeVisible();
      await expect(card.getByRole('button', { name: 'Loading...' })).toBeDisabled();
      await expect(select).toBeDisabled();
    });

    await test.step('após o carregamento: select habilitado e loader oculto', async () => {
      await expect(select).toBeEnabled({ timeout: 10_000 });
      await expect(loader).toBeHidden();
      await expect(card.getByRole('button', { name: 'Options Loaded' })).toBeDisabled();
    });

    await test.step('seleciona uma opção carregada dinamicamente (sem valor fixo)', async () => {
      const options = await select.locator('option:not([value=""])').allInnerTexts();
      expect(options.length).toBeGreaterThan(0);
      const chosen = options[options.length - 1];

      await select.selectOption({ label: chosen });

      await expect(select).toHaveValue(/.+/);
      await expect(result).toHaveText(`Selected: ${chosen}`);
    });
  });
});
