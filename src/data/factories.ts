import { randomUUID } from 'node:crypto';

/**
 * Fábricas de dados de teste.
 * Cada chamada gera dados únicos (sufixo aleatório) para que os testes
 * sejam independentes entre si e possam rodar em paralelo sem colisão.
 * Apenas dados fictícios — domínio reservado ".test" (RFC 2606).
 */

const uid = () => randomUUID().slice(0, 8);

export type Role = 'admin' | 'editor' | 'viewer';

export interface TableUser {
  name: string;
  email: string;
  role: Role;
}

export interface RegistrationUser {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  gender?: 'Male' | 'Female' | 'Other';
  skills?: string[];
  bio?: string;
}

export function buildTableUser(overrides: Partial<TableUser> = {}): TableUser {
  const id = uid();
  return {
    name: `QA User ${id}`,
    email: `qa.user.${id}@example.test`,
    role: 'editor',
    ...overrides,
  };
}

export function buildRegistrationUser(overrides: Partial<RegistrationUser> = {}): RegistrationUser {
  const id = uid();
  return {
    fullName: `QA Candidate ${id}`,
    email: `qa.candidate.${id}@example.test`,
    password: `Str0ng!${id}`,
    phone: '+55 11 90000-0000',
    country: 'Brazil',
    gender: 'Other',
    skills: ['JavaScript'],
    bio: 'Perfil fictício gerado para testes automatizados.',
    ...overrides,
  };
}

/** Valores de e-mail que a aplicação deve rejeitar. */
export const INVALID_EMAILS = ['sem-arroba.example.test', 'usuario@dominio-sem-tld', 'com espaco@example.test'];
