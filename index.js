const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.03pjgrw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    /* await */ client.connect();

    const languageFusionSchoolDB = client.db("languageFusionSchoolDB");
    const classesCollection =
      languageFusionSchoolDB.collection("classesCollection");
    const instructorsCollection = languageFusionSchoolDB.collection(
      "instructorsCollection"
    );
    const usersCollection =
      languageFusionSchoolDB.collection("usersCollection");
    const cartCollection = languageFusionSchoolDB.collection("cartCollection");

    // common function
    const commonFunction = async (req, res, collection) => {
      const { type, limit, email } = req.query;
      if (email || (type && limit)) {
        let query = {};
        let options = {};
        if (type && limit) {
          query = { type };
          options = { projection: { image: 1, name: 1 } };
        }
        if (email) {
          query = { email };
          options = { projection: { role: 1 } };
        }
        const cursor = collection.find(query, options).limit(parseInt(limit));
        const result = await cursor.toArray();
        return res.send(result);
      }
      const cursor = collection.find();
      const result = await cursor.toArray();
      res.send(result);
    };

    // classes api
    app.get("/classes", async (req, res) => {
      commonFunction(req, res, classesCollection);
    });

    // instructors api
    app.get("/instructors", async (req, res) => {
      commonFunction(req, res, instructorsCollection);
    });

    // users api
    app.get("/users", async (req, res) => {
      commonFunction(req, res, usersCollection);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // class cart apis
    app.get("/carts", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }

      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send({ message: "server is running" });
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
