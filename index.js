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
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 8000;

let nMade = 0;
let nRunning = 3;
let nCompletions = 0;

const title_prompt = `A diverse set of highly detailed and imaginative titles of digital artworks I would like to make, one per line.

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

const question_prompt = `A diverse set of highly arresting and vexing philosophical questions, one per line.

what is the meaning of life?
why should there be any existence at all?
is there a natural teleology to the universe?
what is the true nature of consciousness?
are we living in a simulation?
`;


async function createQuestion() {
  const configuration = new openai.Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai_api = new openai.OpenAIApi(configuration);
  let question = '';
  while (question.length == 0) {
    let completion = await openai_api.createCompletion({
      model: "text-davinci-002",
      prompt: question_prompt,
      temperature: 0.99,
      max_tokens: 30,
      top_p: 1,
      frequency_penalty: 2.0,
      presence_penalty: 1.0,
      stop: ["\n"]
    });
    nCompletions += 1;
    question = completion.data.choices[0].text;
    console.log(`complete (${nCompletions}) question: ${question}`)
    return question;
  }
}

async function createPrompt() {
  
  const configuration = new openai.Configuration({
    apiKey: OPENAI_API_KEY,
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
    nCompletions += 1;
    title = completion.data.choices[0].text;
    console.log(`complete (${nCompletions}) title: ${title}`)
    
  }

  while (modifiers.length == 0) {
    const mod_prompt = `${modifier_prompt}Title: ${title}\nModifiers:`
    // console.log('---')
    // console.log(mod_prompt)
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
    nCompletions += 1;
    modifiers = completion.data.choices[0].text;
    console.log(`complete (${nCompletions}) modifiers: ${modifiers}`)
    
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


async function run_eden_jobs(N) {
  if (N == 0) {
    return;
  }
  
  let authData = {
    "apiKey": API_KEY, 
    "apiSecret": API_SECRET
  };
  
  let authToken = await getAuthToken(authData);

  let prompts = [];
  for (var i = 0; i < N; i++) {
    let genPrompt = await createPrompt();
    if (genPrompt) {
      prompts.push(genPrompt);
    }
  }

  let predictions = [];

  for (var i = 0; i < prompts.length; i++) {

    let config = {
      "mode": "generate", 
      "text_input": prompts[i],
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
    predictions.push(prediction_id);
    console.log(`job submitted, task id ${prediction_id}`);    
  }

  // also run oracle once
  /*
  let question = await createQuestion();

  const oracle_config = {
    "question": question,
    "voice_embedding": "data/rivka_embedding.pkl",
    "face": "data/oracle.jpg"
  }

  const request = {
    "token": authToken,
    "application": "oracle", 
    "generator_name": "oracle", 
    "config": oracle_config,
    "metadata": null
  }
  let oracle_response = await startPrediction(request);
  let oracle_prediction_id = oracle_response.data;
  console.log(`oracle job submitted, task id ${oracle_prediction_id}`);
  */
 
  // poll every few seconds for update to the job
  setInterval(async function() {
    let response = await axios.post(GATEWAY_URL+'/fetch', {
      "taskIds": predictions
    });
    for (var i = 0; i < response.data.length; i++) {
      let {status, output} = response.data[i];
      if (status == 'complete') {
        let outputUrl = `${MINIO_URL}/${MINIO_BUCKET}/${output}`;
        console.log(`finished! result at ${outputUrl}`);
        nMade = nMade+1;
        clearInterval(this);
      }
      else if (status == 'failed') {
        console.log("failed");
        clearInterval(this);
      }
    }
  }, 10000);
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
    await run_eden_jobs(nRunning);
    setTimeout(update, 300000);
  }
  update();
});
