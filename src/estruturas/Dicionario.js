// Dicionario com dois arrays paralelos: chaves[i] corresponde a valores[i]
class DicionarioContas {
  constructor() {
    this.chaves = []
    this.valores = []
  }

  definir(chave, valor) {
    const indice = this.chaves.indexOf(chave)

    if (indice > -1) {
      this.valores[indice] = valor
      return
    }

    this.chaves.push(chave)
    this.valores.push(valor)
  }

  obter(chave) {
    const indice = this.chaves.indexOf(chave)
    return indice > -1 ? this.valores[indice] : null
  }

  contem(chave) {
    return this.chaves.indexOf(chave) > -1
  }

  tamanho() {
    return this.chaves.length
  }
}

module.exports = DicionarioContas
