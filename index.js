const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port =process.env.port || 3000

app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://paw_db:Qwu1bkSvonx1DDGL@cluster0.7n9qtku.mongodb.net/?appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    await client.connect();
// find data
const db = client.db('paw_db')

const pawCollection = db.collection('pet_product')
app.get('/pet_product',async (req,res)=>{
  const result =await pawCollection.find().toArray()
  res.send(result)
})

// post product
app.post('/pet_product', async (req,res)=>{
  const data = req.body
  // console.log(data)
const result = await pawCollection.insertOne(data)

  res.send(result)
})
// product details
app.get('/pet_product/:id', async (req,res)=>{
  const {id} = req.params
  // console.log(id)
  const result = await pawCollection.findOne({_id : new ObjectId(id)})
  res.send({
    success:true,
    result
  })
})
//order press

const orderCollection = db.collection('orders')
app.post('/orders', async(req,res)=>{
  const order = req.body;
  const result = await orderCollection.insertOne(order)
  res.send({
    success:true,
    result
  })
})




// my-list
app.get('/pet_products', async (req,res)=>{
const email = req.query.email
// console.log(email)
if (!email) {
    return res.status(400).send({ message: "Email is missing in query" });
  }
  const result = await pawCollection.find({email : email}).toArray()
  res.send(result)
})

// update product
app.put('/pet_product/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  // console.log("Updating product:", id, data);

  const query = { _id: new ObjectId(id) };
  const update = { $set: data };

  const result = await pawCollection.updateOne(query, update);
  res.send({
    success:true,
    result
  });
});






// my Order list
app.get('/orders', async (req,res)=>{
  const email = req.query.email
  // console.log(email)
  if (!email) {
    return res.status(400).send({ message: "Email is missing in query" });
  }
  const result = await orderCollection.find({email : email}).toArray()

  res.send(result)
})


// recent 6 data
app.get('/recent-product', async (req,res)=>{
const result = await pawCollection.find().sort({date:'desc'}).limit(6).toArray()
  res.send(result)
})








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);









//  

app.get('/', (req, res) => {
  res.send('PawMart server is running')
})

app.listen(port, () => {
  console.log(`PawMart server is running on port ${port}`)
})
