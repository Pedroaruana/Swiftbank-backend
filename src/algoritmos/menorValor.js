// Retorna o indice da transacao de menor valor a partir de posicaoInicial
const menorValor = (arr, posicaoInicial) => {
  let menor = posicaoInicial

  for (let atual = posicaoInicial + 1; atual < arr.length; atual++) {
    if (arr[atual].valor < arr[menor].valor) menor = atual
  }

  return menor
}

module.exports = menorValor
