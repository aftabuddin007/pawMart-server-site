const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port =process.env.port || 3000

app.use(cors());
app.use(express.json());
require('dotenv').config()
// firebase
const admin = require("firebase-admin");

const serviceAccount = require("./serviceKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const verifyToken = async(req,res,next)=>{
  
 const authorization = req.headers.authorization
 if(!authorization ) {
  return res.status(401).send({
    message:"unauthorize access. Token not found"
  })
}
const token = authorization.split(' ')[1]
 try{

   const decode = await admin.auth().verifyIdToken(token)
   res.user = decode
    next()
 }catch (err){
  res.status(401).send({
    message:"unauthorize access"
  })
 }

}



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.7n9qtku.mongodb.net/?appName=Cluster0`;
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
    // await client.connect();
// find data
const db = client.db('paw_db')

const pawCollection = db.collection('pet_product')
// app.get('/pet_product', async (req, res) => {
//   const sort = req.query.sort === 'low' ? 1 : -1;
//   const result = await pawCollection.find().sort({ price: sort }).toArray();
//   res.send(result);
// });
app.get('/pet_product', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;   // current page
    const limit = 8;                              // products per page
    const skip = (page - 1) * limit;

    const sortOrder = req.query.sort === 'low' ? 1 : -1;

    const totalProducts = await pawCollection.countDocuments();

    const products = await pawCollection
      .find()
      .sort({ price: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.send({
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      products
    });
  } catch (error) {
    res.status(500).send({ message: 'Server Error' });
  }
});


// post product
app.post('/pet_product', async (req,res)=>{
  const data = req.body
  // console.log(data)
const result = await pawCollection.insertOne(data)

  res.send(result)
})
// product details
app.get('/pet_product/:id',async (req,res)=>{
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
app.get('/pet_products' ,async (req,res)=>{
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

// delete product
app.delete('/pet_product/:id', async (req,res)=>{
  const {id} = req.params
    const query = { _id: new ObjectId(id) };

const result = await pawCollection.deleteOne(query)

res.send({
  success:true,
  result
})

})




// my Order list
app.get('/orders' , async (req,res)=>{
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
const result = await pawCollection.find().sort({date:'desc'}).limit(8).toArray()
  res.send(result)
})

// search
app.get('/search',async (req,res)=>{
  const searchText = req.query.search
  const result =await pawCollection.find({name: {$regex : searchText,$options:'i'}}).toArray()
  res.send(result)

})
// filter by category
app.get('/filterProduct', async (req,res)=>{
  const category = req.query.category;
 let query = {}
  if(category && category !== 'All'){
    query={category:category}
    const result = await pawCollection.find(query).toArray();
    res.send(result)
  }
})








   
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
