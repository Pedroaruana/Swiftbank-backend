-- 04_admin.sql
-- Indices e manutencao. VACUUM nao roda dentro de BEGIN/COMMIT, execute fora de transacao.

-- 1) Indice na coluna filtrada
CREATE INDEX IF NOT EXISTS idx_transacoes_valor ON swiftbank.transacoes (valor);

-- 2) Atualiza estatisticas para o planner enxergar o indice novo
ANALYZE swiftbank.transacoes;

-- 3) Mesmo EXPLAIN da etapa anterior
EXPLAIN SELECT * FROM swiftbank.transacoes WHERE valor > 1000;
-- Observacao: com ~44 linhas a tabela cabe em 1 pagina, entao o planner continua
-- escolhendo Seq Scan (ler 1 pagina e mais barato que percorrer o indice e depois a tabela).
-- Isso e esperado. Em tabelas grandes e filtros seletivos o plano passa a usar
-- Index Scan / Bitmap Index Scan em idx_transacoes_valor.

-- 3b) Apenas para demonstrar que o indice e utilizavel: desliga o Seq Scan na sessao
SET enable_seqscan = off;
EXPLAIN SELECT * FROM swiftbank.transacoes WHERE valor > 1000;
-- esperado: Index Scan ou Bitmap Index Scan usando idx_transacoes_valor
RESET enable_seqscan;

-- 4) Manutencao
VACUUM ANALYZE swiftbank.transacoes;
REINDEX TABLE swiftbank.transacoes;

-- 5) Backup (executar no terminal, nao no psql/pgAdmin):
--   pg_dump -U postgres -f /tmp/swiftbank_backup.sql swiftbank
-- Restaurar em um banco vazio:
--   createdb -U postgres swiftbank_restore
--   psql -U postgres -d swiftbank_restore -f /tmp/swiftbank_backup.sql
