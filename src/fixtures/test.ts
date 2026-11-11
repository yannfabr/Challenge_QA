import { test as base } from '@playwright/test';
import { RegistrationFormPage } from '../pages/RegistrationFormPage';
import { UsersTablePage } from '../pages/UsersTablePage';

/**
 * Domínios de terceiros que não fazem parte do comportamento sob teste.
 * São bloqueados para: (1) não poluir o analytics da aplicação pública,
 * (2) reduzir latência e flakiness causados por rede externa.
 */
const BLOCKED_THIRD_PARTY = [/googletagmanager\.com/, /google-analytics\.com/];

type Fixtures = {
  usersPage: UsersTablePage;
  registrationPage: RegistrationFormPage;
  blockThirdParty: void;
};

export const test = base.extend<Fixtures>({
  blockThirdParty: [
    async ({ page }, use) => {
      for (const pattern of BLOCKED_THIRD_PARTY) {
        await page.route(pattern, (route) => route.abort());
      }
      await use();
    },
    { auto: true },
  ],

  usersPage: async ({ page }, use) => {
    const usersPage = new UsersTablePage(page);
    await usersPage.goto();
    await use(usersPage);
  },

  registrationPage: async ({ page }, use) => {
    const registrationPage = new RegistrationFormPage(page);
    await registrationPage.goto();
    await use(registrationPage);
  },
});

export { expect } from '@playwright/test';
