// O(n²) no pior caso, O(n) se ja estiver quase ordenado
const insertionSort = (transacoes) => {
  for (let atual = 1; atual < transacoes.length; atual++) {
    let analise = atual

    while (analise > 0 && transacoes[analise].valor < transacoes[analise - 1].valor) {
      const itemAnalise = transacoes[analise]
      const itemAnterior = transacoes[analise - 1]

      transacoes[analise] = itemAnterior
      transacoes[analise - 1] = itemAnalise

      analise--
    }
  }

  return transacoes
}

module.exports = insertionSort
