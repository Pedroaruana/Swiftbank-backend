const FilaTransacoes = require('./Fila')
const PilhaHistorico = require('./Pilha')
const carregarTransacoes = require('../utils/carregarTransacoes')

const formatar = (t) => `#${t.id} ${t.tipo} R$ ${t.valor.toFixed(2)} (${t.data}, ${t.status})`

const main = async () => {
  const transacoes = await carregarTransacoes()
  const fila = new FilaTransacoes()
  const pilha = new PilhaHistorico()

  for (const transacao of transacoes) {
    if (transacao.status === 'pendente') fila.enfileirar(transacao)
    if (transacao.status === 'concluida') pilha.empilhar(transacao)
  }

  console.log(`Transacoes carregadas: ${transacoes.length}`)
  console.log(`Fila de pendentes: ${fila.tamanho()} | Pilha de concluidas: ${pilha.tamanho()}`)

  console.log('\nProcessando 3 transacoes da fila (FIFO):')
  for (let i = 0; i < 3; i++) {
    const transacao = fila.retirar()
    console.log(transacao ? `  Processada ${formatar(transacao)}` : '  Fila vazia')
  }
  console.log(`  Restam na fila: ${fila.tamanho()}`)

  console.log('\nEstornando as 2 ultimas transacoes do historico (LIFO):')
  for (let i = 0; i < 2; i++) {
    const transacao = pilha.desempilhar()
    console.log(transacao ? `  Estornada ${formatar(transacao)}` : '  Historico vazio')
  }
  console.log(`  Restam no historico: ${pilha.tamanho()}`)
}

main().catch((erro) => {
  console.error('Erro ao executar a etapa 1:', erro.message)
  process.exitCode = 1
})
