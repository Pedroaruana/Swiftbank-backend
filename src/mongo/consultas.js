// consultas.js
// Consultas com operadores na colecao log_transacoes.
// Rodar depois do setup.js:   mongosh src/mongo/consultas.js
// Ou no shell interativo:     use swiftbank   e colar cada comando.
// Os resultados esperados abaixo consideram os 45 documentos do transacoes.csv.

db = db.getSiblingDB('swiftbank')

const exibir = (titulo, cursor) => {
  const docs = cursor.toArray()
  print(`\n${titulo} (${docs.length} documentos)`)
  printjson(docs)
}

// 1) Igualdade: transacoes do tipo deposito
// db.log_transacoes.find({ tipo: 'deposito' })
// Esperado: 17 documentos
exibir('1) tipo = deposito', db.log_transacoes.find({ tipo: 'deposito' }))

// 2) $gte: valor maior ou igual a 1000
// db.log_transacoes.find({ valor: { $gte: 1000 } })
// Esperado: 13 documentos
exibir('2) valor >= 1000', db.log_transacoes.find({ valor: { $gte: 1000 } }))

// 3) $in: transacoes de 2024-01 e 2024-02
// data esta salva como string 'YYYY-MM-DD', entao o $in recebe regex de prefixo
// (ancoradas em ^, aproveitam indice se existir em data).
// db.log_transacoes.find({ data: { $in: [/^2024-01/, /^2024-02/] } })
// Esperado: 45 documentos (o dataset inteiro e de jan/fev de 2024)
exibir('3) data em 2024-01 ou 2024-02', db.log_transacoes.find({ data: { $in: [/^2024-01/, /^2024-02/] } }))

// 4) $and: transferencias concluidas
// db.log_transacoes.find({ $and: [{ tipo: 'transferencia' }, { status: 'concluida' }] })
// Esperado: 8 documentos
exibir('4) transferencia AND concluida', db.log_transacoes.find({
  $and: [{ tipo: 'transferencia' }, { status: 'concluida' }]
}))

// 5) Projecao + ordenacao + limite
// db.log_transacoes.find({}, { tipo: 1, valor: 1, _id: 0 }).sort({ valor: -1 }).limit(10)
// Esperado (valor desc): deposito 4100, 3300, 3200.5, 2750, 2500, 2100, 1950, 1800,
//                        transferencia 1650, deposito 1500
exibir('5) top 10 por valor', db.log_transacoes
  .find({}, { tipo: 1, valor: 1, _id: 0 })
  .sort({ valor: -1 })
  .limit(10))

// 6) updateOne com $set: adiciona canal a uma transacao que ainda nao tem o campo
// O filtro $exists: false garante que so atualiza se o campo nao existir.
// db.log_transacoes.updateOne(
//   { id: 1, canal: { $exists: false } },
//   { $set: { canal: 'app_mobile' } }
// )
// Esperado: { matchedCount: 1, modifiedCount: 1 } na primeira execucao, 0/0 nas seguintes
const resUpdate = db.log_transacoes.updateOne(
  { id: 1, canal: { $exists: false } },
  { $set: { canal: 'app_mobile' } }
)
print('\n6) updateOne canal = app_mobile')
printjson(resUpdate)
printjson(db.log_transacoes.findOne({ id: 1 }, { _id: 0 }))

// 7) deleteMany: remove transacoes estornadas
// db.log_transacoes.deleteMany({ status: 'estornada' })
// Esperado: { deletedCount: 2 } (ids 21 e 36) na primeira execucao
const resDelete = db.log_transacoes.deleteMany({ status: 'estornada' })
print('\n7) deleteMany status = estornada')
printjson(resDelete)
print(`documentos restantes: ${db.log_transacoes.countDocuments()}`) // 43
