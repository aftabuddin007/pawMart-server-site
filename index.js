const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

const db = client.db('paw_db')
const pawCollection = db.collection('pet_product')
app.get('/pet_product',async (req,res)=>{


  const result =await pawCollection.find().toArray()

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
