import type { Locator, Page } from '@playwright/test';
import type { RegistrationUser } from '../data/factories';

/**
 * Page Object do "Registration Form".
 * Os campos são localizados pelo label associado (getByLabel): isso valida,
 * de forma indireta, a associação label ↔ campo exigida por acessibilidade.
 */
export class RegistrationFormPage {
  readonly form: Locator;
  readonly fullName: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly phone: Locator;
  readonly country: Locator;
  readonly bio: Locator;
  readonly terms: Locator;
  readonly submitButton: Locator;
  readonly resetButton: Locator;
  readonly successMessage: Locator;
  readonly errors: { fullName: Locator; email: Locator; password: Locator; terms: Locator };

  constructor(private readonly page: Page) {
    this.form = page.getByTestId('registration-form');
    this.fullName = this.form.getByLabel('Full Name');
    this.email = this.form.getByLabel('Email Address');
    // exact: o botão "Toggle password visibility" também contém "password" no nome acessível
    this.password = this.form.getByLabel('Password *', { exact: true });
    this.phone = this.form.getByLabel('Phone Number');
    this.country = this.form.getByLabel('Country');
    this.bio = this.form.getByLabel('Bio');
    this.terms = this.form.getByRole('checkbox', { name: /I agree to the Terms/ });
    this.submitButton = this.form.getByRole('button', { name: 'Register' });
    this.resetButton = this.form.getByRole('button', { name: 'Reset' });
    this.successMessage = page.getByTestId('form-success');
    this.errors = {
      fullName: page.getByTestId('error-fullname'),
      email: page.getByTestId('error-email'),
      password: page.getByTestId('error-password'),
      terms: page.getByTestId('error-terms'),
    };
  }

  async goto() {
    await this.page.goto('/');
    await this.form.scrollIntoViewIfNeeded();
  }

  async fill(user: RegistrationUser, { acceptTerms = true } = {}) {
    await this.fullName.fill(user.fullName);
    await this.email.fill(user.email);
    await this.password.fill(user.password);
    if (user.phone) await this.phone.fill(user.phone);
    if (user.country) await this.country.selectOption({ label: user.country });
    if (user.gender) await this.form.getByRole('radio', { name: user.gender, exact: true }).check();
    for (const skill of user.skills ?? []) {
      await this.form.getByRole('checkbox', { name: skill, exact: true }).check();
    }
    if (user.bio) await this.bio.fill(user.bio);
    if (acceptTerms) await this.terms.check();
  }

  async submit() {
    await this.submitButton.click();
  }
}
