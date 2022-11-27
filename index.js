
console.log("BEGIN BOOTING UP !!!")

import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const PORT = 8000;
const GATEWAY_URL = process.env.GATEWAY_URL;

const MINIO_URL = process.env.MINIO_URL;
const MINIO_BUCKET = process.env.MINIO_BUCKET;

// two ways to authenticate:

// 1) API Key
const API_KEY  = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;



console.log("THE GATEWAY YRP IS: ", GATEWAY_URL)

console.log("THE GATEWAY YRP IS: ", API_KEY)



import express from 'express';
import cors from 'cors';

console.log("END BOOTING UP")


async function handleFetchRequest(req, res) {
  res.status(200).send("Hello from the server yay!");
}

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.post("/fetch", handleFetchRequest);

app.get("/", async (req, res) => {
  res.send("Gateway is running yay");
});

app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT} !`);
})
  
