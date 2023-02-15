import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import { EdenClient } from "eden-sdk";
import {generatePrompt} from './config_generators.js';

dotenv.config()

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const PORT = process.env.PORT || 8000;

let nMade = 0;
let nRunning = 3;
let nCompletions = 0;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const main = async () => {

  const prompt = await generatePrompt();
  
  console.log(prompt);

  let eden = new EdenClient(API_KEY, API_SECRET);

  eden.loginApi(
    "admin",
    "admin"
  )

  let config = {
    "text_input": prompt
  }

  try {
    let result = await eden.create("create", config);
    console.log(result);
    nMade++;
  } catch (error) {
    console.error(error);
    await sleep(1000);
  } finally {
    await sleep(1000);
  }
}

async function handleUpdate(req, res) {
  const {count, apiKey, apiSecret} = req.body;
  console.log(apiKey, apiSecret);
  if (apiKey == API_KEY && apiSecret == API_SECRET) {
    nRunning = count;
    res.status(200).send(`Number of running threads: ${nRunning}!`);
  } else {
    res.status(401).send(`Not authorized`);
  }
}

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.get("/", async (req, res) => {
  res.send(`Runner has made ${nMade} creations so far. ${nRunning} threads are running. Completions ${nCompletions}.`);
});

app.listen(PORT, () => {
  console.log(`Runner is now listening on port ${PORT} !`);
  async function update() {
    for (var i=0; i<nRunning; i++) {
      await main();
    }
    setTimeout(update, 300000);
    await sleep(5000);
  }
  update();
});

