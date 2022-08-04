
const { Client: datomsClient } = require('../') 
const crypto  = require('hypercore-crypto')
const datomSpaceServer = 'test_datomSpaceServer'

//如创建新的就不用此key 
//const key = '3e3b7c1ca1e2b4090afdfea38fce9cfa67beaba856b52618a43f766a397d24b3' 



async function create_datoms () {
  const c = new datomsClient({
    host: datomSpaceServer
  })

  // Ask for the RPC server status to see that everything works
  console.log(`连接 ${datomSpaceServer} ....`)
  console.log(await c.status()) 

  const myStore = c.corestore()

  const datom = myStore.get({
    valueEncoding: 'json'
  })

  console.log('Step 1: create my contact datoms\n')

  //Append 4 new blocks to the daomspace.

  
  
  await datom.append({
      name: 'jerry zhang',
      bank: 'bank of china',
      account: '92892xxxx',
      balance: '82988292002'
  })

/*
//生产大量core
  for (let i =0; i < 100; i++) {  
    await datom.append({
          index: i,
          value: i*12345
        })
    }



  /*
  // Append new blocks to the conatct core.
  for (let i =0; i < 10; i++) {
    await datom.append({
      name: fake.name.firstName(),
      Company: fake.company.companyName(),
      jobTitle: fake.name.jobTitle(),
      Tel: fake.phone.phoneNumber(),
      City: fake.address.city(),
      Address: fake.address.streetAddress(),
      emal: fake.internet.email(),
      zipcode: fake.address.zipCode()
    }) 
  }
  */
  

  //console.log('Lengther of the conatct datoms:', Core.length)


  /*
  //创建戴签名的datoms

  await datom.append({
    "数据类型": "电商消费记录",
    "数据控制者": 
      {
        "法人登记证书":"78shs99s8s8",
        "公司名称":"京东电子商务股份有限公司",
        "数据解析规范url":"www.jd.com/schemma/v0.01"
      }，
    "数据块":[
      {
        //消费数据
      }
    ]
  }
  
  })




  */
  console.log('Create the datoms is:')


  datom.createReadStream()
        .on('data', console.log)
        .on('end', console.log.bind(console, '\n(end)'))
  
 
  console.log('the private key is:', datom.key.toString('hex'))

  console.log('the discovery key is:', crypto.discoveryKey(Buffer.from(datom.key)).toString('hex'))

  c.network.configure(datom.discoveryKey, { announce: true, lookup: true })
  
  
};



create_datoms()

//module.exports = create_datoms();
