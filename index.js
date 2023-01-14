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
  
  //const prompts = await generatePrompts(6);
  //const promptString = prompts.join('\n');

  //const prompt = await createPrompt();

  const prompt = await generatePrompt();
  
  console.log(prompt);
  
  let authData = {
    "apiKey": API_KEY, 
    "apiSecret": API_SECRET
  };
  
  try {
    var authToken = await getAuthToken(authData);
  } catch (error) {
    console.error(error);
    return await sleep(1000);
  }

  let sizes = [[512, 512], [640, 640], [768, 480], [800, 576], [768, 512], [800, 512]];
  let steps = [50, 60, 60, 80, 100];
  let samplers = ["klms", "euler_ancestral", "euler", "klms"];

  let size = sizes[Math.floor(Math.random() * sizes.length)];
  let sampler = samplers[Math.floor(Math.random() * samplers.length)];
  let numSteps = steps[Math.floor(Math.random() * steps.length)];
  let W = size[0];
  let H = size[1];
  let scale = 5.0 + 8.0*Math.random();

  let config = {
    "mode": "generate", 
    "text_input": prompt,
    "sampler": sampler,
    "scale": scale,
    "steps": numSteps, 
    "width": W,
    "height": H,
    "seed": Math.floor(1e8 * Math.random())
  }

  console.log(config);
  const request = {
    "token": authToken,
    "application": "heartbeat", 
    "generator_name": "stable-diffusion", 
    "config": config,
    "metadata": null
  }

  try {
    let response = await startPrediction(request);
    let prediction_id = response.data;
    console.log(`job submitted, task id ${prediction_id}`);
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

