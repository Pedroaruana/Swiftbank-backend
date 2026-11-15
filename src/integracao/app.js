const carregarTransacoes = require('../utils/carregarTransacoes')
const FilaTransacoes = require('../estruturas/Fila')
const PilhaHistorico = require('../estruturas/Pilha')
const DicionarioContas = require('../estruturas/Dicionario')
const ConjuntoClientes = require('../estruturas/Conjunto')
const mergeSort = require('../algoritmos/mergeSort')
const buscaBinaria = require('../algoritmos/buscaBinaria')

const formatar = (t) => `#${t.id} ${t.tipo} R$ ${t.valor.toFixed(2)} (${t.data}, ${t.status})`

const agruparPorConta = (transacoes) => {
  const dicionario = new DicionarioContas()

  for (const transacao of transacoes) {
    const conta = transacao.conta_origem
    const lista = dicionario.contem(conta) ? dicionario.obter(conta) : []
    lista.push(transacao)
    dicionario.definir(conta, lista)
  }

  return dicionario
}

const main = async () => {
  const transacoes = await carregarTransacoes()
  console.log(`Transacoes carregadas do CSV: ${transacoes.length}`)

  // Fila: pendentes em ordem de chegada
  const fila = new FilaTransacoes()
  transacoes
    .filter((t) => t.status === 'pendente')
    .forEach((t) => fila.enfileirar(t))

  console.log(`\n[Fila] ${fila.tamanho()} pendentes. Processando 2:`)
  for (let i = 0; i < 2; i++) {
    const transacao = fila.retirar()
    console.log(transacao ? `  Processada ${formatar(transacao)}` : '  Fila vazia')
  }
  console.log(`  Restam na fila: ${fila.tamanho()}`)

  // Pilha: concluidas, estorno da ultima
  const pilha = new PilhaHistorico()
  transacoes
    .filter((t) => t.status === 'concluida')
    .forEach((t) => pilha.empilhar(t))

  const estornada = pilha.desempilhar()
  console.log(`\n[Pilha] ${pilha.tamanho() + 1} concluidas. Estorno da ultima:`)
  console.log(estornada ? `  Estornada ${formatar(estornada)}` : '  Historico vazio')

  // Ordenacao e busca
  const ordenadas = mergeSort([...transacoes])
  console.log('\n[Merge Sort] 5 primeiras por valor:')
  ordenadas.slice(0, 5).forEach((t) => console.log(`  ${formatar(t)}`))

  const valorBuscado = 920.3
  const indice = buscaBinaria(ordenadas, 0, ordenadas.length - 1, valorBuscado)
  console.log(`\n[Busca binaria] R$ ${valorBuscado.toFixed(2)}:`)
  console.log(indice === -1
    ? '  Nao encontrada'
    : `  Posicao ${indice}: ${formatar(ordenadas[indice])}`)

  // Dicionario: transacoes agrupadas por conta de origem
  const dicionario = agruparPorConta(transacoes)
  const conta1001 = dicionario.obter(1001) ?? []
  console.log(`\n[Dicionario] ${dicionario.tamanho()} contas. Conta 1001 (${conta1001.length} transacoes):`)
  conta1001.forEach((t) => console.log(`  ${formatar(t)}`))

  // Conjunto: CPFs unicos
  const conjunto = new ConjuntoClientes()
  transacoes.forEach((t) => conjunto.adicionar(t.cpf_cliente))
  console.log(`\n[Conjunto] ${conjunto.tamanho()} CPFs unicos:`)
  console.log(`  ${conjunto.valores().join(', ')}`)
}

main().catch((erro) => {
  console.error('Erro ao executar a integracao:', erro.message)
  process.exitCode = 1
})
