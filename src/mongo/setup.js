// setup.js
// Cria o banco swiftbank, as colecoes e insere os dados.
// Executar a partir da raiz do projeto:   mongosh src/mongo/setup.js
// No shell interativo o equivalente e:    use swiftbank   e colar os comandos abaixo.
//
// ATENCAO: o script dropa as colecoes antes de recriar, para ser re-executavel.

db = db.getSiblingDB('swiftbank')

db.clientes.drop()
db.log_transacoes.drop()

// 1) clientes: schema rigido com $jsonSchema
// Endereco e conta sao documentos INCORPORADOS: sao lidos sempre junto com o cliente
// e pertencem a um unico cliente, entao uma unica leitura traz tudo sem $lookup.
db.createCollection('clientes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['cpf', 'nome', 'email'],
      properties: {
        cpf: {
          bsonType: 'string',
          minLength: 11,
          maxLength: 11,
          description: 'CPF com exatamente 11 digitos, obrigatorio'
        },
        nome: { bsonType: 'string', description: 'obrigatorio' },
        email: {
          bsonType: 'string',
          pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
          description: 'e-mail valido, obrigatorio'
        },
        data_nascimento: { bsonType: 'date' },
        status_civil: {
          bsonType: 'string',
          enum: ['Solteiro', 'Casado', 'Divorciado', 'Viuvo']
        },
        endereco: {
          bsonType: 'object',
          required: ['rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'],
          properties: {
            rua: { bsonType: 'string' },
            numero: { bsonType: 'int', description: 'inteiro, use NumberInt()' },
            bairro: { bsonType: 'string' },
            cidade: { bsonType: 'string' },
            estado: { bsonType: 'string', minLength: 2, maxLength: 2 },
            cep: { bsonType: 'string', minLength: 8, maxLength: 8 }
          }
        },
        conta: {
          bsonType: 'object',
          required: ['numero', 'tipo', 'saldo', 'data_abertura'],
          properties: {
            numero: { bsonType: 'int' },
            tipo: { bsonType: 'string', enum: ['corrente', 'poupanca'] },
            saldo: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
            data_abertura: { bsonType: 'date' }
          }
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
})

db.clientes.createIndex({ cpf: 1 }, { unique: true })
db.clientes.createIndex({ 'conta.numero': 1 }, { unique: true })

// 2) log_transacoes: sem validador (schema flexivel)
// Os documentos podem ter campos diferentes entre si (ex.: conta_destino so existe
// quando ha destino; canal e adicionado depois via updateOne).
// A ligacao com o cliente e uma REFERENCIA MANUAL por cpf_cliente / conta_origem.
db.createCollection('log_transacoes')

// 3) Insercao dos 9 clientes
const resClientes = db.clientes.insertMany([
  {
    cpf: '11122233344',
    nome: 'Ana Beatriz Souza',
    email: 'ana.souza@email.com',
    data_nascimento: ISODate('1990-03-15'),
    status_civil: 'Solteiro',
    endereco: { rua: 'Rua das Flores', numero: NumberInt(120), bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01001000' },
    conta: { numero: NumberInt(1001), tipo: 'corrente', saldo: Double(8500.00), data_abertura: ISODate('2023-06-01') }
  },
  {
    cpf: '22233344455',
    nome: 'Bruno Carvalho Lima',
    email: 'bruno.lima@email.com',
    data_nascimento: ISODate('1985-07-22'),
    status_civil: 'Casado',
    endereco: { rua: 'Av Brasil', numero: NumberInt(450), bairro: 'Jardim América', cidade: 'Rio de Janeiro', estado: 'RJ', cep: '20040020' },
    conta: { numero: NumberInt(1002), tipo: 'corrente', saldo: Double(3200.75), data_abertura: ISODate('2023-07-10') }
  },
  {
    cpf: '33344455566',
    nome: 'Carla Mendes Ferreira',
    email: 'carla.ferreira@email.com',
    data_nascimento: ISODate('1992-11-08'),
    status_civil: 'Solteiro',
    endereco: { rua: 'Rua Tiradentes', numero: NumberInt(88), bairro: 'Liberdade', cidade: 'São Paulo', estado: 'SP', cep: '01508010' },
    conta: { numero: NumberInt(1003), tipo: 'poupanca', saldo: Double(12450.30), data_abertura: ISODate('2023-05-20') }
  },
  {
    cpf: '44455566677',
    nome: 'Diego Ramos Oliveira',
    email: 'diego.oliveira@email.com',
    data_nascimento: ISODate('1988-01-30'),
    status_civil: 'Divorciado',
    endereco: { rua: 'Rua Sete de Setembro', numero: NumberInt(33), bairro: 'Boa Vista', cidade: 'Curitiba', estado: 'PR', cep: '80060070' },
    conta: { numero: NumberInt(1004), tipo: 'corrente', saldo: Double(5670.00), data_abertura: ISODate('2023-08-15') }
  },
  {
    cpf: '55566677788',
    nome: 'Elena Costa Santos',
    email: 'elena.santos@email.com',
    data_nascimento: ISODate('1995-05-12'),
    status_civil: 'Solteiro',
    endereco: { rua: 'Av Paulista', numero: NumberInt(1500), bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', cep: '01310100' },
    conta: { numero: NumberInt(1005), tipo: 'poupanca', saldo: Double(15800.50), data_abertura: ISODate('2023-04-01') }
  },
  {
    cpf: '66677788899',
    nome: 'Felipe Augusto Dias',
    email: 'felipe.dias@email.com',
    data_nascimento: ISODate('1991-09-25'),
    status_civil: 'Casado',
    endereco: { rua: 'Rua Augusta', numero: NumberInt(670), bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP', cep: '01304001' },
    conta: { numero: NumberInt(1006), tipo: 'corrente', saldo: Double(2100.00), data_abertura: ISODate('2023-09-05') }
  },
  {
    cpf: '77788899900',
    nome: 'Gabriela Nunes Pereira',
    email: 'gabriela.pereira@email.com',
    data_nascimento: ISODate('1987-12-03'),
    status_civil: 'Viuvo',
    endereco: { rua: 'Rua XV de Novembro', numero: NumberInt(200), bairro: 'Centro', cidade: 'Curitiba', estado: 'PR', cep: '80020310' },
    conta: { numero: NumberInt(1007), tipo: 'corrente', saldo: Double(9300.00), data_abertura: ISODate('2023-03-18') }
  },
  {
    cpf: '88899900011',
    nome: 'Henrique Alves Martins',
    email: 'henrique.martins@email.com',
    data_nascimento: ISODate('1993-06-18'),
    status_civil: 'Solteiro',
    endereco: { rua: 'Rua da Bahia', numero: NumberInt(1020), bairro: 'Funcionários', cidade: 'Belo Horizonte', estado: 'MG', cep: '30160011' },
    conta: { numero: NumberInt(1008), tipo: 'poupanca', saldo: Double(4780.00), data_abertura: ISODate('2023-10-22') }
  },
  {
    cpf: '99900011122',
    nome: 'Isabela Rocha Campos',
    email: 'isabela.campos@email.com',
    data_nascimento: ISODate('1996-02-28'),
    status_civil: 'Solteiro',
    endereco: { rua: 'Av Independência', numero: NumberInt(55), bairro: 'Moinhos de Vento', cidade: 'Porto Alegre', estado: 'RS', cep: '90035075' },
    conta: { numero: NumberInt(1009), tipo: 'corrente', saldo: Double(6200.00), data_abertura: ISODate('2023-11-01') }
  }
])
print(`clientes inseridos: ${Object.keys(resClientes.insertedIds).length}`)

// 4) Insercao das 45 transacoes (alternativa ao Import File do Compass)
// conta_destino e omitido quando vazio no CSV.
const resTransacoes = db.log_transacoes.insertMany([
  { id: NumberInt(1), cpf_cliente: '11122233344', tipo: 'deposito', valor: Double(1500.00), data: '2024-01-05', conta_origem: NumberInt(1001), status: 'concluida' },
  { id: NumberInt(2), cpf_cliente: '22233344455', tipo: 'transferencia', valor: Double(350.75), data: '2024-01-06', conta_origem: NumberInt(1002), conta_destino: NumberInt(1003), status: 'concluida' },
  { id: NumberInt(3), cpf_cliente: '33344455566', tipo: 'saque', valor: Double(200.00), data: '2024-01-07', conta_origem: NumberInt(1003), status: 'concluida' },
  { id: NumberInt(4), cpf_cliente: '44455566677', tipo: 'pagamento', valor: Double(89.90), data: '2024-01-08', conta_origem: NumberInt(1004), conta_destino: NumberInt(9001), status: 'concluida' },
  { id: NumberInt(5), cpf_cliente: '55566677788', tipo: 'deposito', valor: Double(3200.50), data: '2024-01-10', conta_origem: NumberInt(1005), status: 'concluida' },
  { id: NumberInt(6), cpf_cliente: '11122233344', tipo: 'transferencia', valor: Double(500.00), data: '2024-01-11', conta_origem: NumberInt(1001), conta_destino: NumberInt(1005), status: 'concluida' },
  { id: NumberInt(7), cpf_cliente: '66677788899', tipo: 'deposito', valor: Double(750.00), data: '2024-01-12', conta_origem: NumberInt(1006), status: 'concluida' },
  { id: NumberInt(8), cpf_cliente: '77788899900', tipo: 'saque', valor: Double(1200.00), data: '2024-01-13', conta_origem: NumberInt(1007), status: 'pendente' },
  { id: NumberInt(9), cpf_cliente: '88899900011', tipo: 'pagamento', valor: Double(45.00), data: '2024-01-14', conta_origem: NumberInt(1008), conta_destino: NumberInt(9002), status: 'concluida' },
  { id: NumberInt(10), cpf_cliente: '99900011122', tipo: 'deposito', valor: Double(600.00), data: '2024-01-15', conta_origem: NumberInt(1009), status: 'concluida' },
  { id: NumberInt(11), cpf_cliente: '11122233344', tipo: 'saque', valor: Double(300.00), data: '2024-01-16', conta_origem: NumberInt(1001), status: 'concluida' },
  { id: NumberInt(12), cpf_cliente: '22233344455', tipo: 'deposito', valor: Double(1800.00), data: '2024-01-17', conta_origem: NumberInt(1002), status: 'concluida' },
  { id: NumberInt(13), cpf_cliente: '33344455566', tipo: 'transferencia', valor: Double(920.30), data: '2024-01-18', conta_origem: NumberInt(1003), conta_destino: NumberInt(1001), status: 'concluida' },
  { id: NumberInt(14), cpf_cliente: '44455566677', tipo: 'deposito', valor: Double(150.00), data: '2024-01-19', conta_origem: NumberInt(1004), status: 'concluida' },
  { id: NumberInt(15), cpf_cliente: '55566677788', tipo: 'saque', valor: Double(500.00), data: '2024-01-20', conta_origem: NumberInt(1005), status: 'concluida' },
  { id: NumberInt(16), cpf_cliente: '66677788899', tipo: 'pagamento', valor: Double(230.00), data: '2024-01-21', conta_origem: NumberInt(1006), conta_destino: NumberInt(9003), status: 'pendente' },
  { id: NumberInt(17), cpf_cliente: '77788899900', tipo: 'deposito', valor: Double(4100.00), data: '2024-01-22', conta_origem: NumberInt(1007), status: 'concluida' },
  { id: NumberInt(18), cpf_cliente: '88899900011', tipo: 'transferencia', valor: Double(670.50), data: '2024-01-23', conta_origem: NumberInt(1008), conta_destino: NumberInt(1006), status: 'concluida' },
  { id: NumberInt(19), cpf_cliente: '99900011122', tipo: 'saque', valor: Double(100.00), data: '2024-01-24', conta_origem: NumberInt(1009), status: 'concluida' },
  { id: NumberInt(20), cpf_cliente: '11122233344', tipo: 'pagamento', valor: Double(55.90), data: '2024-01-25', conta_origem: NumberInt(1001), conta_destino: NumberInt(9004), status: 'concluida' },
  { id: NumberInt(21), cpf_cliente: '22233344455', tipo: 'saque', valor: Double(250.00), data: '2024-01-26', conta_origem: NumberInt(1002), status: 'estornada' },
  { id: NumberInt(22), cpf_cliente: '33344455566', tipo: 'deposito', valor: Double(2100.00), data: '2024-01-27', conta_origem: NumberInt(1003), status: 'concluida' },
  { id: NumberInt(23), cpf_cliente: '44455566677', tipo: 'transferencia', valor: Double(400.00), data: '2024-01-28', conta_origem: NumberInt(1004), conta_destino: NumberInt(1002), status: 'concluida' },
  { id: NumberInt(24), cpf_cliente: '55566677788', tipo: 'deposito', valor: Double(980.00), data: '2024-01-29', conta_origem: NumberInt(1005), status: 'concluida' },
  { id: NumberInt(25), cpf_cliente: '66677788899', tipo: 'saque', valor: Double(350.00), data: '2024-01-30', conta_origem: NumberInt(1006), status: 'concluida' },
  { id: NumberInt(26), cpf_cliente: '77788899900', tipo: 'pagamento', valor: Double(120.00), data: '2024-01-31', conta_origem: NumberInt(1007), conta_destino: NumberInt(9005), status: 'concluida' },
  { id: NumberInt(27), cpf_cliente: '88899900011', tipo: 'deposito', valor: Double(560.00), data: '2024-02-01', conta_origem: NumberInt(1008), status: 'concluida' },
  { id: NumberInt(28), cpf_cliente: '99900011122', tipo: 'transferencia', valor: Double(1300.00), data: '2024-02-02', conta_origem: NumberInt(1009), conta_destino: NumberInt(1007), status: 'pendente' },
  { id: NumberInt(29), cpf_cliente: '11122233344', tipo: 'deposito', valor: Double(2750.00), data: '2024-02-03', conta_origem: NumberInt(1001), status: 'concluida' },
  { id: NumberInt(30), cpf_cliente: '22233344455', tipo: 'pagamento', valor: Double(78.50), data: '2024-02-04', conta_origem: NumberInt(1002), conta_destino: NumberInt(9006), status: 'concluida' },
  { id: NumberInt(31), cpf_cliente: '33344455566', tipo: 'saque', valor: Double(450.00), data: '2024-02-05', conta_origem: NumberInt(1003), status: 'concluida' },
  { id: NumberInt(32), cpf_cliente: '44455566677', tipo: 'deposito', valor: Double(3300.00), data: '2024-02-06', conta_origem: NumberInt(1004), status: 'concluida' },
  { id: NumberInt(33), cpf_cliente: '55566677788', tipo: 'transferencia', valor: Double(190.00), data: '2024-02-07', conta_origem: NumberInt(1005), conta_destino: NumberInt(1004), status: 'concluida' },
  { id: NumberInt(34), cpf_cliente: '66677788899', tipo: 'deposito', valor: Double(1100.00), data: '2024-02-08', conta_origem: NumberInt(1006), status: 'concluida' },
  { id: NumberInt(35), cpf_cliente: '77788899900', tipo: 'saque', valor: Double(800.00), data: '2024-02-09', conta_origem: NumberInt(1007), status: 'concluida' },
  { id: NumberInt(36), cpf_cliente: '88899900011', tipo: 'pagamento', valor: Double(310.00), data: '2024-02-10', conta_origem: NumberInt(1008), conta_destino: NumberInt(9007), status: 'estornada' },
  { id: NumberInt(37), cpf_cliente: '99900011122', tipo: 'deposito', valor: Double(420.00), data: '2024-02-11', conta_origem: NumberInt(1009), status: 'concluida' },
  { id: NumberInt(38), cpf_cliente: '11122233344', tipo: 'transferencia', valor: Double(1650.00), data: '2024-02-12', conta_origem: NumberInt(1001), conta_destino: NumberInt(1003), status: 'concluida' },
  { id: NumberInt(39), cpf_cliente: '22233344455', tipo: 'deposito', valor: Double(500.00), data: '2024-02-13', conta_origem: NumberInt(1002), status: 'concluida' },
  { id: NumberInt(40), cpf_cliente: '33344455566', tipo: 'pagamento', valor: Double(95.00), data: '2024-02-14', conta_origem: NumberInt(1003), conta_destino: NumberInt(9008), status: 'concluida' },
  { id: NumberInt(41), cpf_cliente: '44455566677', tipo: 'saque', valor: Double(700.00), data: '2024-02-15', conta_origem: NumberInt(1004), status: 'concluida' },
  { id: NumberInt(42), cpf_cliente: '55566677788', tipo: 'deposito', valor: Double(2500.00), data: '2024-02-16', conta_origem: NumberInt(1005), status: 'concluida' },
  { id: NumberInt(43), cpf_cliente: '66677788899', tipo: 'transferencia', valor: Double(830.00), data: '2024-02-17', conta_origem: NumberInt(1006), conta_destino: NumberInt(1009), status: 'concluida' },
  { id: NumberInt(44), cpf_cliente: '77788899900', tipo: 'deposito', valor: Double(1950.00), data: '2024-02-18', conta_origem: NumberInt(1007), status: 'concluida' },
  { id: NumberInt(45), cpf_cliente: '88899900011', tipo: 'saque', valor: Double(220.00), data: '2024-02-19', conta_origem: NumberInt(1008), status: 'pendente' }
])
print(`transacoes inseridas: ${Object.keys(resTransacoes.insertedIds).length}`)

db.log_transacoes.createIndex({ cpf_cliente: 1 })
db.log_transacoes.createIndex({ conta_origem: 1 })

// Teste do validador: deve falhar (cpf com 10 digitos e status_civil fora do enum)
try {
  db.clientes.insertOne({ cpf: '1234567890', nome: 'Teste', email: 'teste@email.com', status_civil: 'Noivo' })
  print('ERRO: o validador deveria ter rejeitado o documento')
} catch (erro) {
  print(`validador OK, documento invalido rejeitado: ${erro.codeName ?? erro.message}`)
}
