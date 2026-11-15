const menorValor = require('./menorValor')

// O(n²): ordena in place por valor (crescente)
const selectionSort = (transacoes) => {
  for (let atual = 0; atual < transacoes.length; atual++) {
    const menor = menorValor(transacoes, atual)

    const itemAtual = transacoes[atual]
    const itemMenor = transacoes[menor]

    transacoes[atual] = itemMenor
    transacoes[menor] = itemAtual
  }

  return transacoes
}

module.exports = selectionSort
