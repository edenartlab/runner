
console.log("BEGIN BOOTING UP")


import express from 'express';
import cors from 'cors';

console.log("END BOOTING UP")


async function handleFetchRequest(req, res) {
  return res.status(200).send("Hello from the server!");
}

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.post("/fetch", handleFetchRequest);

app.get("/", async (req, res) => {
  res.send("Gateway is running");
});

app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT} !`);
})
  
