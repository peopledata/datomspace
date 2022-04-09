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


### 参考资料
- 关于个人数据空间的建模以及基本概念：

[浅议个人数据开发利用新范式]<https://www.163.com/dy/article/GSFDUP2G0511831M.html?f=post2020_dy_recommends>