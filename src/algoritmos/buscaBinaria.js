// O(log n): exige array ordenado por valor. Retorna o indice ou -1
const buscaBinaria = (transacoes, de, ate, valorBuscado) => {
  if (de > ate) return -1

  const meio = Math.floor((de + ate) / 2)
  const atual = transacoes[meio].valor

  if (atual === valorBuscado) return meio
  if (valorBuscado < atual) return buscaBinaria(transacoes, de, meio - 1, valorBuscado)
  return buscaBinaria(transacoes, meio + 1, ate, valorBuscado)
}

module.exports = buscaBinaria
