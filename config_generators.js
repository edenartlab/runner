import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getRandomSample(arr, sampleSize) {
  return arr
    .sort(() => 0.5 - Math.random())
    .slice(0, sampleSize);
}


const promptIntro = `I am generating text prompts for AI art generators. These are descriptions of original artworks which are . They should start with a description of the content and then a long list of modifiers which elaborate on the style, genre, and medium. They should be creative, bold, evocative, edgy, diverse, and eclectic.

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
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  
  const messages_topic = [{
    "role": "system",
    "content": `You help with writer's block for journalists, artists, and other creative intellectuals.`
  },{
    "role": "user",
    "content": `Give me some kind of artistic or intellectual task, like to explain a scientific concept, write a poem, tell a story, or 

    For example:
    Write a Lord of the Rings style epic novel about a Hobbit-like creature who grows up to become a dark overlord, and is eventually redeemed by his daughter
    Explain the grabby theory of aliens.
    Write out the sequence of significant evolutionary steps which led from the first life on Earth to modern technological human beings.
    Write the Lord's Prayer in English in every other century since the 10th century.
    
    Give me another one. Be concise, just state the task.`
  }]

  const response_subject = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages_topic,
    temperature: 1,
    max_tokens: 500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  
  const nextTask = response_subject.data.choices[0].message.content;
  

  const messages = [
    {
      "role": "system", 
      "content": `You are a world-renowned artist who produces original digital artworks. You are immensely creative, original, and eclectic. Humans ask you to make artworks according to some specific, story, or context. You respond with the following:

      1) a genre and set of detailed visual characteristics which define the overall story. prefix it with "Genre"
      2) an ordered set of artwork titles which respond to the prompt and tell a story or otherwise respond to it in a novel way. Prefix this with "Chapters"`},
    {
      "role": "user",  
      "content": "Write a Lord of the Rings style epic novel about a Hobbit-like creature who grows up to become a dark overlord, and is eventually redeemed by his daughter.",
    },
    {
      "role": "assistant",
      "content": `1) Genre: Dark fantasy, monochromatic, deep dark blues, 35mm, 2.2 gamma, sony a7r7, tamron 10-24mm f/3.5-4.5

      2) Chapters:
      Innocence Awakens
      A Journey Begins
      Secrets of the Shadows
      The Lure of Power
      Corrupted Descent
      Crown of Shadows
      Daughter of Light
      The Fateful Encounter with the Daughter
      Clash of the Heirs and Daughter
      Battles in the Twilight
      The Vortex of Destiny
      The Triumph of Light
      Forgiveness and Daughter's Redemption
      A New Era Dawns`
    },
    {
      "role": "user", 
      "content": "Explain the grabby alien theory."
    },
    {
      "role": "assistant", 
      "content": `1) Genre: Abstract surrealism, vibrant colors, distortion effects, psychedelic colors, futurism

      2) Chapters:
      Life is common, a rule rather than an exception
      Advanced civilizations spread rapidly, like seeds in the wind
      We're early, the cosmic party's yet to reach full swing
      We're not unique; if we can, others can too
      Advanced aliens leave noticeable marks, like humans on Earth
      Eventually, we're likely to cross paths with these aliens
      Tech-savvy civilizations expand swiftly into space
      Space-faring civilizations are bound to bump into each other
      Aliens, like us, use up their local resources
      Unseen does not mean nonexistent; aliens could be beyond observation`
    },
    {
      "role": "user",
      "content": nextTask
    }
  ]

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 1,
    max_tokens: 500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  
  const text = response.data.choices[0].message.content;
  const lines = text.split('\n');
    
  // extract genre
  const genreLine = lines.find(line => line.includes('1) Genre:'));
  if (!genreLine) throw new Error("Genre not found");
  const genre = genreLine.split(': ')[1];

  // extract chapters
  const chapterIndex = lines.findIndex(line => line.includes('2) Chapters:'));
  if (chapterIndex === -1) throw new Error("Chapters not found");
  const chapters = lines.slice(chapterIndex + 1).map(line => line.trim()).filter(line => line !== '');

  const prompts = chapters.map(chapter => {
    return `${chapter}, ${genre}`;
  });

  console.log(nextTask);
  console.log(prompts);

  return prompts;
}
  