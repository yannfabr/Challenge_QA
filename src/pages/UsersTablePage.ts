import { expect, type Locator, type Page } from '@playwright/test';
import type { TableUser } from '../data/factories';

/**
 * Page Object do card "User Management".
 * Expõe localizadores e ações de negócio; as asserções ficam nos testes,
 * para que a intenção de cada cenário continue explícita.
 */
export class UsersTablePage {
  readonly card: Locator;
  readonly search: Locator;
  readonly roleFilter: Locator;
  readonly rowsPerPage: Locator;
  readonly addUserButton: Locator;
  readonly table: Locator;
  readonly headerCells: Locator;
  readonly rows: Locator;
  readonly info: Locator;
  readonly prevPage: Locator;
  readonly nextPage: Locator;
  readonly modal: Locator;

  constructor(private readonly page: Page) {
    this.card = page.getByTestId('table-card');
    this.search = this.card.getByPlaceholder('Search users...');
    this.roleFilter = page.getByTestId('table-filter');
    this.rowsPerPage = page.getByTestId('rows-per-page');
    this.addUserButton = this.card.getByRole('button', { name: '+ Add User' });
    this.table = page.getByTestId('data-table');
    this.headerCells = this.table.locator('thead th');
    this.rows = page.getByTestId('table-body').getByRole('row');
    this.info = page.getByTestId('table-info');
    this.prevPage = page.getByTestId('page-prev');
    this.nextPage = page.getByTestId('page-next');
    this.modal = page.getByTestId('modal');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.rows.first()).toBeVisible();
  }

  pageButton(n: number): Locator {
    return this.page.getByTestId(`page-${n}`);
  }

  sortHeader(column: 'id' | 'name' | 'email' | 'status'): Locator {
    return this.page.getByTestId(`sort-${column}`);
  }

  /**
   * Textos dos cabeçalhos, sem o indicador visual de ordenação.
   * Usa textContent (dado real) e não innerText (texto renderizado), pois o CSS
   * aplica text-transform: uppercase — o teste não deve depender de estilo.
   */
  async headerTexts(): Promise<string[]> {
    const raw = await this.headerCells.allTextContents();
    return raw.map((t) => t.replace(/[↕↑↓]/g, '').trim());
  }

  /**
   * Valores de uma coluna na página atual.
   * O índice é resolvido pelo texto do cabeçalho, e não por posição fixa,
   * para que a reordenação de colunas não quebre o teste.
   */
  async columnValues(header: string): Promise<string[]> {
    const index = (await this.headerTexts()).indexOf(header);
    if (index < 0) throw new Error(`Coluna "${header}" não encontrada na tabela`);
    const cells = await this.rows.locator(`td:nth-child(${index + 1})`).allTextContents();
    return cells.map((c) => c.trim());
  }

  /** Total de registros informado no rodapé ("Showing x-y of N entries"). */
  async totalEntries(): Promise<number> {
    const text = ((await this.info.textContent()) ?? '').trim();
    const match = text.match(/of (\d+) entries/);
    if (!match) throw new Error(`Rodapé da tabela em formato inesperado: "${text}"`);
    return Number(match[1]);
  }

  rowContaining(text: string): Locator {
    return this.rows.filter({ hasText: text });
  }

  async addUser(user: TableUser) {
    await this.addUserButton.click();
    await expect(this.modal).toBeVisible();
    await expect(this.modal.getByTestId('modal-title')).toHaveText('Add New User');
    await this.modal.getByTestId('new-user-name').fill(user.name);
    await this.modal.getByTestId('new-user-email').fill(user.email);
    await this.modal.getByTestId('new-user-role').selectOption(user.role);
    await this.modal.getByRole('button', { name: 'Confirm' }).click();
  }
}
