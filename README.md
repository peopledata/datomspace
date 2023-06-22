# datomspace 
构建数据空间的协议和工具。

## 功能描述
- datomspace是管理datoms的服务组件。
- datom是最小的数据资产单元。
- 每个datom具有独立的结构，具备「可确权、可赋权、可交易、可计量和可管理」的属性。
- 多个datom组成datoms，形成不同类别、不同安全级别、不同权力属性设置的数据资产。
- datomspace是建设、维护和管理以datoms为基础组件构建数据空间（data space）的工具。

## 数据空间和数据市场
- datomspace是构建数据空间的工具和服务。
- 采用分布式架构，不同数据所有者的datomspace可以组成数据市场。


## 开始使用
1. 安装软件包
```js
> npm i datomspace 
```

2. 编写代码（示例）
peer 1: (数据所有者/提供方)

Alice在peer 1构建自己的数据空间。把自己的一些个人数据（例如联系人）资产化。
首先，需要创建一个datomspace（服务端）。

```js
//创建一个datomServer实例
const { Server : datomsServer } = require('datomspace')
const datomSpaceServer = 'hostname'  // 例如 ‘alice_dataspace


async function start () {

  const Server = new datomsServer( {
    storage: './',   //本地存储地址或分布式存储url
    host: datomSpaceServer
})

  await Server.ready()

  console.log(`${datomSpaceServer} are ready...`)

  // 客户端访问的log...
  Server.on('client-open', () => {
    console.log('(local) A datomspaceClient has connected')
  })
  Server.on('client-close', () => {
    console.log('(local) A datomsspaceClient has disconnected')
  })

  Server.on('client-open', () => {
    console.log('(remote) A datomspaceClient has connected')
  })
  Server.on('client-close', () => {
    console.log('(remote) A datomspaceClient has disconnected')
  })

  process.on('SIGINT', cleanup)

  async function cleanup () {
    console.log('datomspace servers are shutting down...')
    await Server.close()
  }

}
```
然后，alice将自己的联系人数据资产化，生产contact datoms.

```js

const { Client: datomsClient } = require('datomspace') 

async function start () {
  const c = new datomsClient({
    host: aliice_datomSpaceServer
  })


  const myStore = c.corestore()

  const datom = myStore.get({
    valueEncoding: 'json'
  })

  console.log('创建联系人 datom\n')

  /*
  alice按照自己的隐私策略和安全要求设置联系人的数据赋权、置权。
  */
 
  console.log('the private key is:', datom.key.toString('hex'))

  console.log('the discovery key is:', crypto.discoveryKey(Buffer.from(datom.key)).toString('hex'))
  
  
}
```
Alice得到contact datoms的 key， 将contact datoms的key发给bob.

peer 2: (数据使用方/处理方)
Bob接收到alice的contact datoms的alice_key, 就得到授权可以使用alice的联系人数据。

Bob在peer 2上：
```js

  const c = new Client({
    host: alice_datomSpaceName
  })

  const store = c.corestore()

  const core = store.get({key: alice_key, valueEncoding: 'json'})

  await core.ready()

```
bob就可以访问alice的数据并处理。


## 创建带API的 `datomSpaceServer`

为便于隐私计算或其他算法镜像与`datomspace`交互，用户可以创建带API端点的`datomSpaceServer`。
示例如下：

1. 创建`carea_datoms`,`append_datom`和`get_datoms`的API端点的`datomSpaceServer`如下；
```js
// my_datomSpaceServer.js 
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
```

启动上述服务。用`curl`测试API接口：

1. 测试`/create_datoms`
```bash
$curl -X POST -H "Content-Type: application/json" -d '{"name":"jerry ZZZ","bank":"bank of china","account":"1234","balance":"1000000"}' http://localhost:3000/cr
eate_datoms
```
返回：
```bash
{"success":true}
```
服务器端console.log:
```bash
Datoms created!
Private key is: 1f8c336d8736a363349ff6f4241dae78f0440ce0d465678b4825eb1eab8a79e8
Public key is aff190eb9e72fc7efd8d76d15a51633817749ec9093c326d7a3318582f4960f7
{
  name: 'jerry ZZZ',
  bank: 'bank of china',
  account: '1234',
  balance: '1000000'
}
```
在本地`.mydatomspace`中就创建来相应的datoms。

2. 测试`get_datoms`:
需要步骤一返回的`private_key`:

```bash
$ curl -X GET -H "Content-Type: application/json" -d '{"private_key":"1f8c336d8736a363349ff6f4241dae78f0440ce0d465678b4825eb1eab8a79e8"}' http://localhost:3000/get_datoms
```
返回相应的datoms:
```json
[{"name":"jerry ZZZ","bank":"bank of china","account":"1234","balance":"1000000"}]`
```

3. 测试`append_datom`:
需要步骤一返回的该datoms的`private_key`以及需要添加的数据：
```bash
$ curl -X POST \
  http://localhost:3000/append_datoms \
  -H 'Content-Type: application/json' \
  -d '{
        "key": "1f8c336d8736a363349ff6f4241dae78f0440ce0d465678b4825eb1eab8a79e8",
        "data": {
                  "name": "jerry ZZZ",
                  "bank": "ICBC",
                  "account": "5678",
                  "balance": "2000000"
                }
      }'
```
返回
```bash
{"success":true}
```

查看`.mydatomspace`，新的datom已经被添加。

4. 调用`get_datoms`核实：
```bash
$ curl -X GET -H "Content-Type: application/json" -d '{"private_key":"1f8c336d8736a363349ff6f4241dae78f0440ce0d465678b4825eb1eab8a79e8"}' http://localhost:3000/get_datoms
```
返回：
```json
[{"name":"jerry ZZZ","bank":"bank of china","account":"1234","balance":"1000000"},{"name":"jerry ZZZ","bank":"ICBC","account":"5678","balance":"2000000"}]
```

*上述示例代码在`test`中。*







### 参考资料
- 关于个人数据空间的建模以及基本概念：

[浅议个人数据开发利用新范式]<https://www.163.com/dy/article/GSFDUP2G0511831M.html?f=post2020_dy_recommends>