const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

// assignment-12

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.beqkzcx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  const categoriesAndProductsCollection = client
    .db("mobile-resell-service")
    .collection("categoriesAndProducts");

  const allProductsCollection = client
    .db("mobile-resell-service")
    .collection("allProducts");

  const categoriesCollection = client
    .db("mobile-resell-service")
    .collection("categories");

  const usersCollection = client
    .db("mobile-resell-service")
    .collection("allUsers");

  const bookedCollection = client
    .db("mobile-resell-service")
    .collection("bookedPhones");

  try {
    app.get("/categories", async (req, res) => {
      const query = {};
      const results = await categoriesCollection.find(query).toArray();
      res.send(results);
    });
  
    app.get("/categories/:name", async (req, res) => {
      const name = req.params.name;
      const query = { category_name: name };
      const results = await allProductsCollection.find(query).toArray();
      res.send(results);
    });

    app.post("/addUsers", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const find = await usersCollection.findOne(query);
      if (find === null || find.email !== user.email) {
        const results = await usersCollection.insertOne(user);
        res.send(results);
      } else {
        res.send("The user already available in the collection");
      }
    });
  
    app.put("/dashboard/userVerify/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const findUser = await usersCollection.findOne(query);

      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quality: "verified",
        },
      };
      const results = await usersCollection.updateOne(
        findUser,
        updateDoc,
        options
      );
      console.log(results);
      res.send(results);
    });
  
    app.get("/advertised", async (req, res) => {
      const query = { advertise: true };
      const results = await allProductsCollection.find(query).toArray();
      res.send(results);
    });  

    app.put("/advertised/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          advertise: true,
        },
      };
      const results = await allProductsCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(results);
    });

    app.delete("/dashboard/userDelete/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id, "delete");
      const query = { _id: ObjectId(id) };
      const results = await usersCollection.deleteOne(query);
      res.send(results);
    });

    app.get("/dashboard/allUsers", async (req, res) => {
      const query = {};
      const results = await usersCollection.find(query).toArray();
      res.send(results);
    });  

    app.get("/role/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const results = await usersCollection.findOne(query);
      // console.log(results, "results");
      if (results === null || results?.status) {
        res.send(results);
      } else {
        res.send("unauthorized");
      }
    });

    app.post("/bookedPhones", async (req, res) => {
      const body = req.body;
      const results = await bookedCollection.insertOne(body);
      res.send(results);
    });

    app.get("/bookedPhones/:email", async (req, res) => {
      const email = req.params.email;
      const query = { buyer_email: email };
      const results = await bookedCollection.find(query).toArray();
      res.send(results);
    });
  
    app.get("/myProducts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const results = await allProductsCollection.find(query).toArray();
      res.send(results);
    });

    app.delete("/deleteProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const results = await allProductsCollection.deleteOne(query);
      res.send(results);
    });

    app.get("/checkVerify", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const output = await usersCollection.findOne(query);
      if (output?.quality === "verified") {
        res.send(true);
      } else {
        res.send(false);
      }
    });

    app.post("/addProducts", async (req, res) => {
      const data = req.body;
      const results = await allProductsCollection.insertOne(data);
      res.send(results);
    });

    app.put("/sellerRequested", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const findUser = await usersCollection.findOne(query);
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quality: "requested",
        },
      };
      const results = await usersCollection.updateOne(
        findUser,
        updateDoc,
        options
      );
      res.send(results);
    });


      
  } finally {
  }
};
run().catch((err) => console.log(err, "Error by Function"));

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, (req, res) => {
  console.log(`Server listening on port ${port}`);
});
