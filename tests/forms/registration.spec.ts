import { buildRegistrationUser, INVALID_EMAILS } from '../../src/data/factories';
import { expect, test } from '../../src/fixtures/test';

test.describe('Formulário de cadastro', () => {
  test('FRM-01 cadastra com dados válidos e exibe confirmação', { tag: ['@smoke', '@mobile'] }, async ({ registrationPage }) => {
    const user = buildRegistrationUser();

    await registrationPage.fill(user);
    await registrationPage.submit();

    await expect(registrationPage.successMessage).toBeVisible();
    await expect(registrationPage.successMessage).toHaveText(/Registration successful/);
    await expect(registrationPage.form).toBeHidden();
  });

  test('FRM-02/03/06 bloqueia envio inválido e exibe mensagem por campo', async ({ registrationPage }) => {
    await test.step('envio vazio: todos os obrigatórios sinalizados', async () => {
      await registrationPage.submit();

      await expect(registrationPage.errors.fullName).toHaveText('Name is required');
      await expect(registrationPage.errors.email).toHaveText('Valid email is required');
      await expect(registrationPage.errors.password).toHaveText('Password must be at least 8 characters');
      await expect(registrationPage.errors.terms).toHaveText('You must accept the terms');
      await expect(registrationPage.successMessage).toBeHidden();
    });

    for (const invalidEmail of INVALID_EMAILS) {
      await test.step(`e-mail inválido "${invalidEmail}": apenas o campo e-mail sinalizado`, async () => {
        await registrationPage.fill(buildRegistrationUser({ email: invalidEmail }));
        await registrationPage.submit();

        await expect(registrationPage.errors.email).toHaveText('Valid email is required');
        await expect(registrationPage.email).toHaveClass(/error/);
        await expect(registrationPage.errors.fullName).toBeEmpty();
        await expect(registrationPage.errors.password).toBeEmpty();
        await expect(registrationPage.errors.terms).toBeEmpty();
        await expect(registrationPage.successMessage).toBeHidden();
      });
    }
  });
});
