import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import {generatePrompts, createPrompt} from './config_generators.js';

dotenv.config()

const GATEWAY_URL = process.env.GATEWAY_URL;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const PORT = process.env.PORT || 8000;

let nMade = 0;
let nRunning = 3;
let nCompletions = 0;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getAuthToken(data) {
  let response = await axios.post(GATEWAY_URL+'/sign_in', data)
  var authToken = response.data.authToken;
  return authToken;
}


async function startPrediction(data) {
  let response = await axios.post(GATEWAY_URL+'/request', data)
  return response;
}


const main = async () => {
  const prompts = await generatePrompts(6);
  const promptString = prompts.join('\n');
  //const prompt = await createPrompt();

  let prompt = await generatePrompts(1);
  prompt = prompt[0];

  console.log(prompt);
  
  let authData = {
    "apiKey": API_KEY, 
    "apiSecret": API_SECRET
  };
  
  let authToken = await getAuthToken(authData);

  let config = {
    "mode": "generate", 
    "text_input": prompt,
    "sampler": "euler_ancestral",
    "scale": 10.0,
    "steps": 50, 
    "width": 512,
    "height": 512,
    "seed": Math.floor(1e8 * Math.random())
  }

  const request = {
    "token": authToken,
    "application": "heartbeat", 
    "generator_name": "stable-diffusion", 
    "config": config,
    "metadata": null
  }

  let response = await startPrediction(request);
  let prediction_id = response.data;
  console.log(`job submitted, task id ${prediction_id}`);
  nCompletions++;
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

// app.post("/update", handleUpdate);

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

