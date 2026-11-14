class PilhaHistorico {
  constructor() {
    this.elementos = []
  }

  empilhar(transacao) {
    this.elementos[this.elementos.length] = transacao
  }

  desempilhar() {
    if (this.estaVazia()) return null

    const ultimo = this.elementos[this.elementos.length - 1]
    this.elementos = this.elementos.slice(0, this.elementos.length - 1)
    return ultimo
  }

  estaVazia() {
    return this.elementos.length === 0
  }

  tamanho() {
    return this.elementos.length
  }
}

module.exports = PilhaHistorico
