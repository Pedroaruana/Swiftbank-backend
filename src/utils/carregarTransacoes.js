const { createReadStream } = require('node:fs')
const { createInterface } = require('node:readline')
const path = require('node:path')

const CAMINHO_PADRAO = path.join(__dirname, '..', '..', 'data', 'transacoes.csv')

const parseLinha = (linha) => {
  const [id, cpf_cliente, tipo, valor, data, conta_origem, conta_destino, status] = linha.split(',')

  return {
    id: Number(id),
    cpf_cliente,
    tipo,
    valor: Number(valor),
    data,
    conta_origem: Number(conta_origem),
    conta_destino: conta_destino ? Number(conta_destino) : null,
    status: status.trim()
  }
}

const carregarTransacoes = async (caminho = CAMINHO_PADRAO) => {
  const leitor = createInterface({
    input: createReadStream(caminho, { encoding: 'utf8' }),
    crlfDelay: Infinity
  })

  const transacoes = []
  let cabecalho = true

  for await (const linha of leitor) {
    if (cabecalho) {
      cabecalho = false
      continue
    }
    if (!linha.trim()) continue
    transacoes.push(parseLinha(linha))
  }

  return transacoes
}

module.exports = carregarTransacoes
