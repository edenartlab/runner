import openai from 'openai';
import dotenv from 'dotenv';

dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getRandomSample(arr, sampleSize) {
  return arr
    .sort(() => 0.5 - Math.random())
    .slice(0, sampleSize);
}


const promptIntro = `I am generating text prompts for AI generators. These are descriptions of artworks which are highly detailed and aesthetically imaginative, and diverse. They should start with a description of the content and then a long list of modifiers which elaborate on the style, genre, and medium. They should be creative, bold, evocative, edgy, diverse, and eclectic.

Here are some examples.`;

const promptExamples = [
  'Prototype of an isometric diorama, particle effects, 2.2 gama, sony a7r7, tamron 10-24mm f/3.5-4.5, iso 3200, extremely detailed, 8k texture, lots of flowers and vibrant plants',
  'A steampunk fox fursona with boots sitting on a vespa moped with sunglasses, vector drawing, graphic novel, grunge, geometric',
  'A cat chef making ramen, cartoon style, comic style, manga style',
  'Sheikh Zayed Grand Mosque in Abu Dhabi, extremely detailed digital painting, matte colors, rim light, beautiful Lighting, 8k, stunning scene, raytracing, octane',
  'Pikachu doing deadlifts and getting swole at a luxury gym, portra 400, gym shot, render in unreal engine',
  'Tall green hedge maze with an evil monster in shadows, light pink smoke, geometric, minimal, vintage, creepy',
  'An astronaut wearing a helmet with a galaxy in the background, symmetrical portrait, facing directly forward, unreal engine, cozy indoor lighting, artstation, detailed, digital painting, cinematic, hyperrealistic',
  'Photograph of Spacex starship on top of heavy Falcon rocket, UHD, unreal 5 render,',
  'cute punk rock girl, mad max jacket, renaissance, cables on her body, hyper realistic style, oil painting, fantasy',
  '1950 paysage, collines, sapins, chevaux, train rouge, flat design',
  'Vintage 90s anime style. cluttered starship interior; male and female crew sleeping a starship',
  'castle in the sky, pale black paper, very detailed illustration, sketch, concept art, ink outlines, smooth',
  'wide shot of a chaotic arcade at night; a woman wearing streetwear playing an arcade game / line art. Environmental arcade art.',
  'Draw a phoenix with vibrant, glowing feathers, rising from the ashes of its former self. The bird should look powerful and majestic, as if it has just undergone a transformative rebirth. In the background, depict a fiery inferno, a symbol of the destruction that precedes the phoenix resurrection. As you draw, imagine the phoenix energy and spirit, radiating outward and inspiring hope and renewal',
  'pen and ink, illustrated by hergé, Background space and earth. boy alone in his bedroom at night',
  'Detailed isometric castle, pixel art, unreal engine voxel render'
]

function generatePromptPrompt() {
  const numPrompts = Math.floor(6 * Math.random()) + 3;
  const promptSelection = getRandomSample(promptExamples, numPrompts);
  const promptPrompt = `${promptIntro}

${promptSelection.join('\n')}

I want you to generate a list of 10-20 such text prompts.`

  return promptPrompt;
}


function removeNumbering(line) {
  return line.replace(/^\d+[:.)]/, '').trim();
}

export async function combinePrompt() {
  const subject = getRandomSample(subjects, 1);
  const context = getRandomSample(contexts, 1);
  const flavors2 = getRandomSample(flavors, 2);
  const medium2 = getRandomSample(media, 2);
  const prompt = `${subject} ${context}, ${medium2[0]}, ${flavors2[0]}, ${medium2[1]}, ${flavors2[1]}`;
  return prompt;
}

export async function generatePrompts() {
  
  const configuration = new openai.Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai_api = new openai.OpenAIApi(configuration);

  const promptPrompt = generatePromptPrompt();

  let completion = await openai_api.createCompletion({
    model: "text-davinci-003",
    prompt: promptPrompt,
    temperature: 0.99,
    max_tokens: 400,
    top_p: 1,
    frequency_penalty: 0.35,
    presence_penalty: 0.25
  });
    
  let prompts = completion.data.choices[0].text;
  prompts = prompts.split("\n");
  prompts = prompts.filter((line) => line.length > 0);
  prompts = prompts.map(removeNumbering);
  
  return prompts;
}
  