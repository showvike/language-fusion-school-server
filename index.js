const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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

    // classes api
    app.get("/classes", async (req, res) => {
      const { type, limit } = req.query;
      if (type && limit) {
        const query = { type };
        const options = { projection: { image: 1, name: 1 } };
        const classesCursor = classesCollection
          .find(query, options)
          .limit(parseInt(limit));
        const result = await classesCursor.toArray();
        return res.send(result);
      }
      const classesCursor = classesCollection.find();
      const result = await classesCursor.toArray();
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
