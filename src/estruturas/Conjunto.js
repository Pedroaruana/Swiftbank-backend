class ConjuntoClientes {
  constructor() {
    this.elementos = []
  }

  adicionar(elemento) {
    if (this.contem(elemento)) return false

    this.elementos.push(elemento)
    return true
  }

  contem(elemento) {
    return this.elementos.indexOf(elemento) > -1
  }

  tamanho() {
    return this.elementos.length
  }

  valores() {
    return [...this.elementos]
  }
}

module.exports = ConjuntoClientes
