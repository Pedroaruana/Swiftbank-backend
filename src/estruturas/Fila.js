class FilaTransacoes {
  constructor() {
    this.elementos = []
  }

  enfileirar(transacao) {
    this.elementos[this.elementos.length] = transacao
  }

  retirar() {
    if (this.estaVazia()) return null

    const primeiro = this.elementos[0]
    this.elementos = this.elementos.slice(1)
    return primeiro
  }

  estaVazia() {
    return this.elementos.length === 0
  }

  tamanho() {
    return this.elementos.length
  }
}

module.exports = FilaTransacoes
