// Intercala duas sublistas ja ordenadas por valor
const ordena = (parte1, parte2) => {
  let posicaoParte1 = 0
  let posicaoParte2 = 0
  const resultado = []

  while (posicaoParte1 < parte1.length && posicaoParte2 < parte2.length) {
    const item1 = parte1[posicaoParte1]
    const item2 = parte2[posicaoParte2]

    // <= mantem a ordenacao estavel para valores iguais
    if (item1.valor <= item2.valor) {
      resultado.push(item1)
      posicaoParte1++
    } else {
      resultado.push(item2)
      posicaoParte2++
    }
  }

  return resultado.concat(
    posicaoParte1 < parte1.length
      ? parte1.slice(posicaoParte1)
      : parte2.slice(posicaoParte2)
  )
}

// O(n log n): nao altera o array original
const mergeSort = (transacoes) => {
  if (transacoes.length <= 1) return transacoes

  const meio = Math.floor(transacoes.length / 2)
  const parte1 = mergeSort(transacoes.slice(0, meio))
  const parte2 = mergeSort(transacoes.slice(meio))

  return ordena(parte1, parte2)
}

module.exports = mergeSort
