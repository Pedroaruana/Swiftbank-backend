-- 02_dml.sql
-- Insercao dos dados. Executar com o psql a partir da RAIZ do projeto:
--   psql -U postgres -d swiftbank -f sql/02_dml.sql
-- Re-executavel: ON CONFLICT DO NOTHING evita duplicar registros.

-- 1) Clientes (precisam existir antes das contas por causa da FK)
INSERT INTO swiftbank.clientes (cpf, nome, email, data_nascimento, status_civil) VALUES
  ('11122233344', 'Ana Beatriz Souza', 'ana.souza@email.com', '1990-03-15', 'Solteiro'),
  ('22233344455', 'Bruno Carvalho Lima', 'bruno.lima@email.com', '1985-07-22', 'Casado'),
  ('33344455566', 'Carla Mendes Ferreira', 'carla.ferreira@email.com', '1992-11-08', 'Solteiro'),
  ('44455566677', 'Diego Ramos Oliveira', 'diego.oliveira@email.com', '1988-01-30', 'Divorciado'),
  ('55566677788', 'Elena Costa Santos', 'elena.santos@email.com', '1995-05-12', 'Solteiro'),
  ('66677788899', 'Felipe Augusto Dias', 'felipe.dias@email.com', '1991-09-25', 'Casado'),
  ('77788899900', 'Gabriela Nunes Pereira', 'gabriela.pereira@email.com', '1987-12-03', 'Viuvo'),
  ('88899900011', 'Henrique Alves Martins', 'henrique.martins@email.com', '1993-06-18', 'Solteiro'),
  ('99900011122', 'Isabela Rocha Campos', 'isabela.campos@email.com', '1996-02-28', 'Solteiro')
ON CONFLICT (cpf) DO NOTHING;

-- 2) Contas: cliente_id resolvido pelo CPF, sem depender do valor gerado pelo SERIAL
INSERT INTO swiftbank.contas (numero, tipo, saldo, data_abertura, cliente_id)
SELECT v.numero, v.tipo, v.saldo, v.data_abertura::date, c.id
FROM (VALUES
  (1001, 'corrente', 8500.00, '2023-06-01', '11122233344'),
  (1002, 'corrente', 3200.75, '2023-07-10', '22233344455'),
  (1003, 'poupanca', 12450.30, '2023-05-20', '33344455566'),
  (1004, 'corrente', 5670.00, '2023-08-15', '44455566677'),
  (1005, 'poupanca', 15800.50, '2023-04-01', '55566677788'),
  (1006, 'corrente', 2100.00, '2023-09-05', '66677788899'),
  (1007, 'corrente', 9300.00, '2023-03-18', '77788899900'),
  (1008, 'poupanca', 4780.00, '2023-10-22', '88899900011'),
  (1009, 'corrente', 6200.00, '2023-11-01', '99900011122')
) AS v (numero, tipo, saldo, data_abertura, cpf)
JOIN swiftbank.clientes c ON c.cpf = v.cpf
ON CONFLICT (numero) DO NOTHING;

-- 3) Transacoes
-- O CSV traz o NUMERO da conta (1001..1009), mas a tabela referencia contas(id).
-- Por isso o CSV vai primeiro para uma tabela de staging e depois e convertido.
-- Contas de destino 9001..9008 (favorecidos externos de pagamentos) nao existem
-- em swiftbank.contas, entao ficam NULL via LEFT JOIN.

CREATE TABLE IF NOT EXISTS swiftbank.transacoes_staging (
  id            INTEGER,
  cpf_cliente   VARCHAR(11),
  tipo          VARCHAR(20),
  valor         NUMERIC(12,2),
  data          DATE,
  conta_origem  INTEGER,
  conta_destino INTEGER,
  status        VARCHAR(20)
);

TRUNCATE swiftbank.transacoes_staging;

-- Opcao A (psql): \copy le o arquivo da maquina cliente
\copy swiftbank.transacoes_staging FROM 'data/transacoes.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',')

-- Opcao B (pgAdmin): comente a linha acima, clique com o botao direito em
-- swiftbank.transacoes_staging > Import/Export Data > Import, selecione
-- data/transacoes.csv, Format csv, Header ligado, Delimiter ",". Depois rode o INSERT abaixo.

INSERT INTO swiftbank.transacoes (id, tipo, valor, data, conta_origem_id, conta_destino_id, status)
SELECT s.id, s.tipo, s.valor, s.data, co.id, cd.id, s.status
FROM swiftbank.transacoes_staging s
JOIN swiftbank.contas co ON co.numero = s.conta_origem
LEFT JOIN swiftbank.contas cd ON cd.numero = s.conta_destino
ON CONFLICT (id) DO NOTHING;

DROP TABLE swiftbank.transacoes_staging;

-- Conferencia: esperado 9 | 9 | 45
SELECT
  (SELECT COUNT(*) FROM swiftbank.clientes)   AS clientes,
  (SELECT COUNT(*) FROM swiftbank.contas)     AS contas,
  (SELECT COUNT(*) FROM swiftbank.transacoes) AS transacoes;
