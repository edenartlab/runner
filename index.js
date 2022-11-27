import express from 'express';
import cors from 'cors';
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const GATEWAY_URL = process.env.GATEWAY_URL;
const MINIO_URL = process.env.MINIO_URL;
const MINIO_BUCKET = process.env.MINIO_BUCKET;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const PORT = 8000;

let count = 0;

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

  let config = {
    "mode": "generate", 
    "text_input": "The quick brown fox jumps over the lazy dog.",
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
  res.status(200).send(`Count ${count}!`);
}

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.get("/fetch", handleFetchRequest);

//app.post("/fetch", handleFetchRequest);



app.get("/", async (req, res) => {
  res.send("Gateway is running yay");
});

app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT} !`);

  // every 5 minutes
  setInterval(async () => {
    console.log("RUN LOOP")
    count += 1;
    run_eden_job();
  }
  , 5*60*1000);


});
  
