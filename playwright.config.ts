import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

/**
 * Configuração centralizada da suíte.
 * - baseURL vem de variável de ambiente (com fallback para a aplicação pública).
 * - Paralelismo limitado: a aplicação é pública e de terceiros (ver restrições do case).
* - Evidências: trace, screenshot e vídeo somente em falha.
*/
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : 3,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: isCI
    ? [['list'], ['github'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://playwrightlab.github.io',
    testIdAttribute: 'data-testid',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      // Navegador de referência: executa a suíte completa.
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
    },
    {
      // Compatibilidade: apenas os testes críticos (@smoke) em outro engine.
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1366, height: 768 } },
      grep: /@smoke/,
    },
    {
      // Responsividade: jornadas marcadas como @mobile em viewport de smartphone.
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      grep: /@mobile/,
    },
  ],
});
