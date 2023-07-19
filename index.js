import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { EdenClient } from "@edenlabs/eden-sdk";
import {generatePrompts} from './config_generators.js';

dotenv.config()

const API_KEY = process.env.EDEN_API_KEY;
const API_SECRET = process.env.EDEN_API_SECRET;
const PORT = process.env.PORT || 8000;

let eden = new EdenClient({
  apiKey: API_KEY, 
  apiSecret: API_SECRET
});

let nMade = 0;
let nRunning = 1;
let nCompletions = 0;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const main = async () => {

  console.log("==========")
  const prompts = await generatePrompts();
  
  for (var i=0; i<prompts.length; i++) {
    let prompt = prompts[i];
    console.log(prompt)

    let sizes = [[768, 768], [960, 960], [960, 640], [1024, 640], [1152, 768]];
    let steps = [40, 50, 60];
    //let samplers = ["euler", "euler_ancestral", "euler", "klms"];
    let samplers = ["euler"];

    let size = sizes[Math.floor(Math.random() * sizes.length)];
    if (Math.random() < 0.33) {
      size = [size[1], size[0]];
    }

    let sampler = samplers[Math.floor(Math.random() * samplers.length)];
    let numSteps = steps[Math.floor(Math.random() * steps.length)];
    let W = size[0];
    let H = size[1];
    let scale = 6.5 + 2.0*Math.random();
    let upscale_f = 1.5;

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
      const result = await eden.tasks.create({
        generatorName: "create",
        config: config
      });
      console.log(config);
      console.log(result);
      nMade++;
    } catch (error) {
      console.error(error);
    }
    await sleep(2.5 * 60 * 1000);
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

async function status(req, res) {
  res.send(`Runner has made ${nMade} creations so far. ${nRunning} threads are running. Completions ${nCompletions}.`);
}

const app = express();
app.use(cors());
app.post("/update", handleUpdate);
app.get("/", status);

app.listen(PORT, async () => {
  console.log(`Runner is now listening on port ${PORT} !`);

  while (true) {
    for (var i=0; i<nRunning; i++) {
      await main();
    }
    await sleep(5000);
  }
  
});

