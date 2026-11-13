import { buildTableUser } from '../../src/data/factories';
import { expect, test } from '../../src/fixtures/test';
import { expectNoHorizontalPageScroll } from '../../src/utils/layout';

const EXPECTED_HEADERS = ['', 'ID', 'Name', 'Email', 'Role', 'Status', 'Actions'];
const VALID_ROLES = ['admin', 'editor', 'viewer'];
const VALID_STATUSES = ['active', 'inactive', 'pending'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

test.describe('Gerenciamento de usuários', () => {
  test(
    'USR-01/02/07 carrega a tabela com estrutura, paginação inicial e dados consistentes',
    { tag: ['@smoke', '@mobile'] },
    async ({ usersPage, page }) => {
      await test.step('estrutura: cabeçalhos na ordem esperada', async () => {
        expect(await usersPage.headerTexts()).toEqual(EXPECTED_HEADERS);
      });

      await test.step('paginação inicial: 5 linhas, página 1 ativa, "anterior" desabilitado', async () => {
        await expect(usersPage.rows).toHaveCount(5);
        await expect(usersPage.info).toHaveText(/^Showing 1-5 of \d+ entries$/);
        await expect(usersPage.pageButton(1)).toHaveClass(/active/);
        await expect(usersPage.prevPage).toBeDisabled();
        expect(await usersPage.totalEntries()).toBeGreaterThan(5);
      });

      await test.step('dados: e-mail válido, papel e situação dentro do domínio permitido', async () => {
        // Validação por regra, não por valor fixo: a massa da aplicação pode mudar.
        for (const email of await usersPage.columnValues('Email')) expect(email).toMatch(EMAIL_PATTERN);
        for (const role of await usersPage.columnValues('Role')) expect(VALID_ROLES).toContain(role);
        for (const status of await usersPage.columnValues('Status')) expect(VALID_STATUSES).toContain(status);
      });

      await test.step('layout: sem scroll horizontal na página (RSP-04)', async () => {
        await expectNoHorizontalPageScroll(page);
      });
    },
  );

  test(
    'USR-03/04 localiza usuário existente e trata pesquisa sem resultados',
    { tag: ['@smoke', '@mobile'] },
    async ({ usersPage }) => {
      const [existingName] = await usersPage.columnValues('Name');

      await test.step('pesquisa por um usuário existente', async () => {
       await usersPage.search.fill(existingName);
        await expect(usersPage.rows).toHaveCount(1);
        await expect(usersPage.rowContaining(existingName)).toHaveCount(1);
        for (const name of await usersPage.columnValues('Name')) {
          expect(name.toLowerCase()).toContain(existingName.toLowerCase());
        }
      });

      await test.step('pesquisa por um usuário inexistente (cenário negativo)', async () => {
        await usersPage.search.fill(`inexistente-${Date.now()}`);
        await expect(usersPage.rows).toHaveCount(0);
        await expect(usersPage.info).toContainText('of 0 entries');
        await expect(usersPage.nextPage).toBeDisabled();

        // BUG-01 (docs/matriz-de-riscos.md): o rodapé exibe "Showing 1-0 of 0 entries".
        // O comportamento esperado seria "Showing 0 entries". Mantido como anotação
        // para não mascarar outras regressões deste teste.
        test.info().annotations.push({
          type: 'known-bug',
          description: `BUG-01: rodapé exibido como "${await usersPage.info.textContent()}"`,
        });
      });

      await test.step('limpar a pesquisa restaura a listagem completa', async () => {
        await usersPage.search.clear();
        await expect(usersPage.rows).toHaveCount(5);
      });
    },
  );

  test('USR-05/06 ordena por nome e mantém a ordenação ao navegar entre páginas', async ({ usersPage }) => {
    const total = await usersPage.totalEntries();

    await test.step('ordena por Name (desc) com dois cliques no cabeçalho', async () => {
      await usersPage.sortHeader('name').click();
      await usersPage.sortHeader('name').click();
    });

    const collected: string[] = [];
    await test.step('percorre todas as páginas pelo botão "próxima"', async () => {
      let pageNumber = 1;
      while (true) {
        await expect(usersPage.pageButton(pageNumber)).toHaveClass(/active/);
        collected.push(...(await usersPage.columnValues('Name')));
        if (await usersPage.nextPage.isDisabled()) break;
        await usersPage.nextPage.click();
        pageNumber++;
      }
      await expect(usersPage.prevPage).toBeEnabled();
    });

    await test.step('todos os registros foram exibidos uma única vez e em ordem decrescente', async () => {
      expect(collected).toHaveLength(total);
      expect(new Set(collected).size).toBe(total);
      expect(collected).toEqual([...collected].sort((a, b) => b.localeCompare(a)));
    });
  });

  test('USR-08 adiciona um usuário pelo modal e o localiza na tabela', async ({ usersPage }) => {
    const newUser = buildTableUser({ role: 'viewer' });
    const totalBefore = await usersPage.totalEntries();

    await usersPage.addUser(newUser);

    await test.step('modal fechado e total incrementado', async () => {
      await expect(usersPage.modal).toBeHidden();
      await expect(usersPage.info).toContainText(`of ${totalBefore + 1} entries`);
    });

    await test.step('novo usuário localizável com os dados informados', async () => {
      await usersPage.search.fill(newUser.email);
      await expect(usersPage.rows).toHaveCount(1);
      expect(await usersPage.columnValues('Name')).toEqual([newUser.name]);
      expect(await usersPage.columnValues('Role')).toEqual([newUser.role]);
      expect(await usersPage.columnValues('Status')).toEqual(['active']);
    });
  });
});
