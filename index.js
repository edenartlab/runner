import express from 'express';
import cors from 'cors';
import axios from 'axios'
import dotenv from 'dotenv'
import openai from 'openai';

dotenv.config()

const GATEWAY_URL = process.env.GATEWAY_URL;
const MINIO_URL = process.env.MINIO_URL;
const MINIO_BUCKET = process.env.MINIO_BUCKET;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const PORT = 8000;

let count = 0;
let isRunning = true;

const title_prompt = `A diverse set of highly detailed and imaginative titles of digital artworks I would like to make, one per line
off-grid cyberpunk vanlife explorer surveying mars oasis
photo of holy futuristic cyborg robot painter
digital illustration of tokyo cityscape
cyber neon AI art kid on vast barren desert
portrait of a biomechanical head inside an orb
lush tropical forest with strange birdlike creatures patrolling the canopies
cyberpunk hero whiz kid in the neon city super high-tech future
a film still of an adventurer kid with cyber gear riding an electric unicycle on a desert with rocks, cactus, mountains
hyper mecha digital nomads clad in cyberpunk attire looking menacing
off-grid survivalist scientists vanlife in a desert oasis
epic winged Hippogriff flying over a medieval castle under a dark starred sky
futuristic military cyborgs with high-tech gear in a desolate wasteland
vibrant xenomorph with aurora inspired by fine greek sculpture
cybernetic holographic ninja riding a motorcycle with a katana
`;

const modifier_prompt = `For each title, propose a set of detailed and relevant stylistic modifiers which create a unique aesthetic.
Title: off-grid cyberpunk vanlife explorer surveying mars oasis
Modifiers: storybook illustration, trending on pixiv, rendered 4k in Octane, raytracing
Title: epic winged Hippogriff flying over a medieval castle under a dark starred sky
Modifiers: magic realism, storybook fantasy, ink drawing, behance best of the week
Title: portrait of a biomechanical head inside a futuristic space helmet
Modifiers: Baroque, kinetic pointillism, watercolors, concept art, divine and awe-inspiring
Title: lush tropical forest with strange birdlike creatures patrolling the canopies
Modifiers: album cover, mix of afrofuturism and sōsaku hanga, detailed pencil sketch
`;


async function createPrompt() {
  console.log("create prompt");
  const configuration = new openai.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai_api = new openai.OpenAIApi(configuration);

  let title = '';
  let modifiers = '';

  while (title.length == 0) {
    let completion = await openai_api.createCompletion({
      model: "text-davinci-002",
      prompt: title_prompt,
      temperature: 0.99,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 2.0,
      presence_penalty: 1.0,
      stop: ["\n"]
    });
    title = completion.data.choices[0].text;
  }

  while (modifiers.length == 0) {
    const mod_prompt = `${modifier_prompt}\nTitle: ${title}\nModifiers: `
    let completion = await openai_api.createCompletion({
      model: "text-davinci-002",
      prompt: mod_prompt,
      temperature: 0.99,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 2.0,
      presence_penalty: 1.0,
      stop: ["\n"]
    });    
    modifiers = completion.data.choices[0].text;
  }

  const prompt = `${title}, ${modifiers}`

  return prompt;
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


async function run_eden_job() {
  console.log("RUN EDEN JOB")
  let authData = {
    "apiKey": API_KEY, 
    "apiSecret": API_SECRET
  };

  let gen_prompt = await createPrompt();

  console.log(gen_prompt);

  let config = {
    "mode": "generate", 
    "text_input": gen_prompt,
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
    "metadata": {"count": count}  
  }

  console.log(request);

  let response = await startPrediction(request);
  let prediction_id = response.data;
  console.log(`job submitted, task id ${prediction_id}`);

  // poll every few seconds for update to the job
  setInterval(async function() {
    let response = await axios.post(GATEWAY_URL+'/fetch', {
      "taskIds": [prediction_id]
    });
    let {status, output} = response.data[0];
    if (status == 'complete') {
      let outputUrl = `${MINIO_URL}/${MINIO_BUCKET}/${output}`;
      console.log(`finished! result at ${outputUrl}`);
      clearInterval(this);
    }
    else if (status == 'failed') {
      console.log("failed");
      clearInterval(this);
    }
  }, 2000);

}



async function handleFetchRequest(req, res) {
  console.log("make isRunning false");
  isRunning = false;
  res.status(200).send(`Count ${count}!`);
}

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.get("/fetch", handleFetchRequest);

//app.post("/fetch", handleFetchRequest);



app.get("/", async (req, res) => {
  res.send("Runner running yay");
});

app.listen(PORT, () => {
  console.log(`Runner is now listening on port ${PORT} !`);
  console.log("looping token");
  
  async function update() {
    
    if (isRunning) {
      await run_eden_job();
    }
    else {
      console.log("IS NOT RUNNING")      
    }

    setTimeout(update, 300000);
  }
  update();


  console.log("LOOP DONE")
});
  

console.log("RUNNER DONE")