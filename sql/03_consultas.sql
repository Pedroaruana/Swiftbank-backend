-- 03_consultas.sql
-- Consultas, UPDATE seguro, controle transacional e EXPLAIN

-- 1) JOIN clientes x contas
SELECT c.nome, c.cpf, ct.numero AS numero_conta, ct.saldo
FROM swiftbank.clientes c
JOIN swiftbank.contas ct ON ct.cliente_id = c.id
ORDER BY ct.numero;

-- 2) UPDATE com SELECT antes para validar o alvo
-- Passo 1: confirmar que o filtro retorna exatamente 1 linha e qual o saldo atual
SELECT id, numero, saldo
FROM swiftbank.contas
WHERE numero = 1001;

-- Passo 2: aplicar o UPDATE com o mesmo filtro
UPDATE swiftbank.contas
SET saldo = saldo + 250.00
WHERE numero = 1001;

-- Passo 3: conferir o resultado
SELECT id, numero, saldo
FROM swiftbank.contas
WHERE numero = 1001;

-- 3) Controle transacional
-- 3a) BEGIN + DELETE + ROLLBACK: a exclusao e desfeita
SELECT id, tipo, valor, status FROM swiftbank.transacoes WHERE status = 'estornada';

BEGIN;
DELETE FROM swiftbank.transacoes WHERE id = 21 AND status = 'estornada';
SELECT COUNT(*) AS dentro_da_transacao FROM swiftbank.transacoes WHERE id = 21; -- 0
ROLLBACK;

SELECT COUNT(*) AS apos_rollback FROM swiftbank.transacoes WHERE id = 21; -- 1, registro preservado

-- 3b) BEGIN + DELETE + COMMIT: a exclusao e confirmada
BEGIN;
DELETE FROM swiftbank.transacoes WHERE id = 21 AND status = 'estornada';
COMMIT;

SELECT COUNT(*) AS apos_commit FROM swiftbank.transacoes WHERE id = 21; -- 0, registro removido

-- 4) EXPLAIN sem indice: esperado "Seq Scan on transacoes"
EXPLAIN SELECT * FROM swiftbank.transacoes WHERE valor > 1000;
