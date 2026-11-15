const carregarTransacoes = require('../utils/carregarTransacoes')
const selectionSort = require('./selectionSort')
const insertionSort = require('./insertionSort')
const mergeSort = require('./mergeSort')
const buscaBinaria = require('./buscaBinaria')

const formatar = (t) => `#${t.id} ${t.tipo} R$ ${t.valor.toFixed(2)}`

const exibirPrimeiros = (titulo, transacoes, quantidade = 5) => {
  console.log(`\n${titulo} (5 primeiros):`)
  transacoes.slice(0, quantidade).forEach((t) => console.log(`  ${formatar(t)}`))
}

const main = async () => {
  const transacoes = await carregarTransacoes()
  console.log(`Transacoes carregadas: ${transacoes.length}`)

  exibirPrimeiros('Selection Sort', selectionSort([...transacoes]))
  exibirPrimeiros('Insertion Sort', insertionSort([...transacoes]))

  const ordenadas = mergeSort([...transacoes])
  exibirPrimeiros('Merge Sort', ordenadas)

  const valorBuscado = 500.0
  const indice = buscaBinaria(ordenadas, 0, ordenadas.length - 1, valorBuscado)

  console.log(`\nBusca binaria por R$ ${valorBuscado.toFixed(2)}:`)
  console.log(indice === -1
    ? '  Nao encontrada'
    : `  Encontrada na posicao ${indice}: ${formatar(ordenadas[indice])}`)

  const inexistente = buscaBinaria(ordenadas, 0, ordenadas.length - 1, 12345.67)
  console.log(`  Busca por R$ 12345.67 (inexistente): ${inexistente}`)
}

main().catch((erro) => {
  console.error('Erro ao executar a etapa 2:', erro.message)
  process.exitCode = 1
})
