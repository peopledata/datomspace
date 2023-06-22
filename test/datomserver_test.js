const { Server : datomsServer } = require('../')
const express = require('express')
const app = express()

const { Client: datomsClient } = require('../') 
const crypto  = require('hypercore-crypto')
const { on } = require('hypercore-protocol')

app.use(express.json()) // for parsing application/json

const datomSpaceServer = 'my_datomSpaceServer'

// 创建一个datomsServer实例
let server

async function start () {

  server = new datomsServer({
    storage: './mydatomspace',
    host: datomSpaceServer
  })

  await server.ready()

  console.log(`${datomSpaceServer} are ready...`)

  // todo: 以后添加verbose功能
  // Print client connection/disconnection events.
  server.on('client-open', () => {
    console.log('(local) A datomspaceClient has connected')
  })
  server.on('client-close', () => {
    console.log('(local) A datomsspaceClient has disconnected')
  })

  server.on('client-open', () => {
    console.log('(remote) A datomspaceClient has connected')
  })
  server.on('client-close', () => {
    console.log('(remote) A datomspaceClient has disconnected')
  })

  // create_datoms API endpoint
  app.post('/create_datoms', async (req, res) => {
    const c = new datomsClient({
      host: datomSpaceServer
    })
  
    console.log(`连接 ${datomSpaceServer} ....`)
    console.log(await c.status()) 
  
    const myStore = c.corestore()
  
    const datom = myStore.get({
      valueEncoding: 'json'
    })
  
    console.log('Step 1: create datoms\n')

    const datomData = req.body
    console.log("datomData is", datomData)

    // 你需要解构datomData，否则你会创建一个包含datomData对象的新对象，这可能并不是你想要的
    await datom.append(datomData)



    await datom.createReadStream()
           .on('data', console.log)
           .on('end', console.log.bind(console, '\n(end)'))
    

    private_key = datom.key.toString('hex')
    publick_key = crypto.discoveryKey(Buffer.from(datom.key)).toString('hex')


    console.log('Datoms created!')
  
    console.log('Private key is:', private_key)
    console.log('Public key is', publick_key)


    res.send({ success: true }) 
  })

  // append a datom to current datoms using private key
  app.post('/append_datoms', async (req, res) => {
    const c = new datomsClient({
      host: datomSpaceServer
    })
  
    console.log(`连接 ${datomSpaceServer} ....`)
    console.log(await c.status()) 
    
    const private_key = req.body.key

    const myStore = c.corestore()
  
    const datom = myStore.get({
      valueEncoding: 'json',
      key: private_key
    })
  
    console.log('Step 1: append datoms\n')

    const datomData = req.body.data
    console.log("datomData is", datomData)

    await datom.append(datomData)

    await datom.createReadStream()
           .on('data', console.log)
           .on('end', console.log.bind(console, '\n(end)'))
    

    const private_key_hex = datom.key.toString('hex')
    const public_key_hex = crypto.discoveryKey(Buffer.from(datom.key)).toString('hex')

    console.log('An new datom is appended!')
  
    console.log('Private key is:', private_key_hex)
    console.log('Public key is', public_key_hex)

    res.send({ success: true }) 
  })

  // get_datoms API endpoint
  app.get('/get_datoms', async (req, res) => {
    // 一般来说，GET请求不应该包含请求体
    // 你可能需要改为使用URL参数或者查询参数
    // const private_key = req.params.private_key 或 const private_key = req.query.private_key

    const req_data = req.body
    
    const c = new datomsClient({
      host: datomSpaceServer
    })
  
    console.log(`连接 ${datomSpaceServer} ....`)
    console.log(await c.status()) 
  
    const myStore = c.corestore()
    
    
    const datom = myStore.get({
      key: req_data.private_key,
      valueEncoding: 'json'
    
    })
    
    
  let datomData = []

  datom.createReadStream()
    .on('data', function (data) {
      datomData.push(data)
    })
    .on('end', function() {
      console.log('Data:', datomData)
      res.send(datomData)
    })
})

  app.listen(3000, () => {
    console.log('Express server is running on port 3000')
  })

  process.on('SIGINT', cleanup)

  async function cleanup () {
    console.log('datomspace servers are shutting down...')
    await server.close()
  }

}

start()
