import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { EdenClient } from "eden-sdk";
import {generatePrompts} from './config_generators.js';

dotenv.config()

const API_KEY = process.env.EDEN_API_KEY;
const API_SECRET = process.env.EDEN_API_SECRET;
const PORT = process.env.PORT || 8000;

let eden = new EdenClient(API_KEY, API_SECRET);

let nMade = 0;
let nRunning = 2;
let nCompletions = 0;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const main = async () => {

  const prompts = await generatePrompts();
  
  for (var i=0; i<prompts.length; i++) {
    let prompt = prompts[i];
    console.log("==========")
    console.log(prompt)

    let sizes = [[576, 576], [640, 640], [832, 576], [800, 576], [768, 512], [800, 512]];
    let steps = [100, 120, 80, 90, 100];
    let samplers = ["euler", "euler_ancestral", "euler", "klms"];

    let size = sizes[Math.floor(Math.random() * sizes.length)];
    if (Math.random() < 0.25) {
      size = [size[1], size[0]];
    }

    let sampler = samplers[Math.floor(Math.random() * samplers.length)];
    let numSteps = steps[Math.floor(Math.random() * steps.length)];
    let W = size[0];
    let H = size[1];
    let scale = 5.0 + 8.0*Math.random();
    let upscale_f = 1.0 + 1.0*Math.random();

    let config = {
      "mode": "generate", 
      "text_input": prompt,
      "sampler": sampler,
      "scale": scale,
      "steps": numSteps, 
      "width": W,
      "height": H,
      "seed": Math.floor(1e8 * Math.random()),
      "upscale_f": upscale_f,
    }

    try {
      let result = await eden.create("create", config);
      console.log(result);
      nMade++;
      await sleep(1000 * 60 * 4);
    } catch (error) {
      console.error(error);
      await sleep(1000);
    } finally {
      await sleep(1000);
    }
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

app.post("/update", handleUpdate);

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

