import express from 'express';
import cors from "cors"
import 'dotenv/config'
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yrwn1se.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // database and collections 
    const taskCollection = client.db("taskNestleDB").collection("tasks")

    // all get methods 
    // get all tasks user specific 
    app.get("/task-nestle/get-tasks/:email", async(req,res)=>{
      const userEmail = req.params.email;
      const query = {email:userEmail}
      const result = await taskCollection.find(query).toArray()
      res.send(result);
    })
    // get single task 
    app.get("/task-nestle/single-task/:id", async(req, res)=>{
      const id = req.params.id;
      const task = await taskCollection.findOne({_id: new ObjectId(id)})
      res.send(task)
    })

    // all post methods
    app.post("/task-nestle/create-task", async(req, res)=>{
        const task = req.body;
        const result = await taskCollection.insertOne(task,);
        res.send(result)
    })

    // all put and patch method 
    app.patch("/task-nestle/status-change/:id", async(req, res)=>{
      const id = req.params.id;
      const {status} = req.body;
      console.log(status);
      const filter = {_id: new ObjectId(id)}
      const updatedData = {
        $set:{
          status: status
        }
      }
      const result = await taskCollection.updateOne(filter,updatedData);
      res.send(result)
    })

    // update task 
    app.put("/task-nestle/update-task/:id", async(req,res)=>{
      const id = req.params.id;
      const task = req.body;
      const filter = {_id: new ObjectId(id)};
      const updatedTask = {
        $set:{
          ...task
        }
      }
      const result = await taskCollection.updateOne(filter,updatedTask,{upsert:false})
      res.send(result)
    })

    // all delete methods 

    app.delete("/task-nestle/delete-task/:id", async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await taskCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req,res)=>{
    res.send("task nestle server running well")
})
app.listen(port, ()=>{
    console.log(`My task nestle server running on port: ${port}`);
})