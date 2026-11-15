-- 01_ddl.sql
-- Estrutura do banco swiftbank (PostgreSQL 14+)
-- Pre-requisito: CREATE DATABASE swiftbank; e conectar nele (\c swiftbank)

CREATE SCHEMA IF NOT EXISTS swiftbank;

CREATE TABLE IF NOT EXISTS swiftbank.clientes (
  id              SERIAL PRIMARY KEY,
  cpf             VARCHAR(11)  NOT NULL UNIQUE,
  nome            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  data_nascimento DATE         NOT NULL,
  status_civil    VARCHAR(20)  CHECK (status_civil IN ('Solteiro', 'Casado', 'Divorciado', 'Viuvo'))
);

CREATE TABLE IF NOT EXISTS swiftbank.contas (
  id            SERIAL PRIMARY KEY,
  numero        INTEGER       NOT NULL UNIQUE,
  tipo          VARCHAR(20)   CHECK (tipo IN ('corrente', 'poupanca')),
  saldo         NUMERIC(12,2) DEFAULT 0,
  data_abertura DATE          NOT NULL,
  cliente_id    INTEGER       NOT NULL REFERENCES swiftbank.clientes(id)
);

CREATE TABLE IF NOT EXISTS swiftbank.transacoes (
  id               INTEGER PRIMARY KEY,
  tipo             VARCHAR(20)   NOT NULL,
  valor            NUMERIC(12,2) NOT NULL,
  data             DATE          NOT NULL,
  conta_origem_id  INTEGER REFERENCES swiftbank.contas(id),
  conta_destino_id INTEGER REFERENCES swiftbank.contas(id),
  status           VARCHAR(20)   DEFAULT 'pendente'
);
