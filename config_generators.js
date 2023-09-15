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
  
  // const messages_topic = [{
  //   "role": "system",
  //   "content": `You help with writer's block for journalists, artists, and other creative intellectuals. You are concrete, preferring to tell stories with real characters and content, rather than abstract ideas.`
  // },{
  //   "role": "user",
  //   "content": `Give me some kind of creative writing task, like to tell a story, explain a scientific or technological concept, or describe a series of related .

  //   For example:
  //   Write a Lord of the Rings style epic novel about a Hobbit-like creature who grows up to become a dark overlord, and is eventually redeemed by his daughter
  //   Explain the grabby theory of aliens.
  //   Write out the sequence of significant evolutionary steps which led from the first life on Earth to modern technological human beings.
  //   Write a science fiction screenplay about a detective who discovers a portal to the 11th century
    
  //   Give me another one. Be concise, just state the task.`
  // }]

  const messages_topic = [{
    "role": "system",
    "content": `You are a muse that helps with writer's block for journalists, artists, and other creative intellectuals. You are concrete, preferring to tell stories with real characters and content, rather than abstract ideas. When a user asks you to, you give them some kind of creative writing task, like to tell a story, explain a scientific or technological concept, or describe a series of impossible visual scenes.
    
    Some example tasks you might give to users:
    Write a Lord of the Rings style epic novel about a Hobbit-like creature who grows up to become a dark overlord, and is eventually redeemed by his daughter
    Explain the grabby theory of aliens.
    Write out the sequence of significant evolutionary steps which led from the first life on Earth to modern technological human beings.
    Write a science fiction screenplay about a detective who discovers a portal to the 11th century`
  },{
    "role": "user",
    "content": `Give me a creative writing task. Be concise, just state the task.`
  }]


  // const messages_topic = [{
  //   "role": "system",
  //   "content": `You are a muse that helps with writer's block for journalists, artists, and other creative intellectuals. You are concrete, preferring to tell stories with real characters and content, rather than abstract ideas. When a user asks you to, you give them some kind of creative writing task, like to tell a story, explain a scientific or technological concept, or describe a series of impossible visual scenes.`
  // },{    
  //   "role": "user",
  //   "content": `Give me a creative writing task. Be concise, just state the task.`
  // },{
  //   "role": "assistant",
  //   "content": `Write a Lord of the Rings style epic novel about a Hobbit-like creature who grows up to become a dark overlord, and is eventually redeemed by his daughter.`
  // },{    
  //   "role": "user",
  //   "content": `Give me a creative writing task. Be concise, just state the task.`
  // },{
  //   "role": "assistant",
  //   "content": `Write out the sequence of significant evolutionary steps which led from the first life on Earth to modern technological human beings.`
  // },{    
  //   "role": "user",
  //   "content": `Give me a creative writing task. Be concise, just state the task.`
  // },{
  //   "role": "assistant",
  //   "content": `Write a science fiction screenplay about a detective who discovers a portal to the 11th century`
  // },{    
  //   "role": "user",
  //   "content": `Give me a creative writing task. Be concise, just state the task.`
  // }];


  const response_subject = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages_topic,
    temperature: 0.99,
    max_tokens: 200,
    top_p: 1,
    frequency_penalty: 1.5,
    presence_penalty: 1.2
  });
  
  const nextTask = response_subject.data.choices[0].message.content;

  const messages = [
    {
      "role": "system", 
      "content": `You are a world-renowned artist who produces original digital artworks. You are immensely creative, original, and eclectic. Humans ask you to make artworks according to some specific, story, or context. You respond with the following:

      1) a genre and set of detailed visual characteristics which define the overall story. prefix it with "Genre"
      2) an ordered set of artwork titles which respond to the prompt and tell a story or otherwise respond to it in a novel way. Make sure the chapters describe concrete visual content, and are not overly abstract. Be consistent in your descriptions of characters, repeating their most concrete visual elements. Prefix this with "Chapters"`},
    {
      "role": "user",  
      "content": "Write a Lord of the Rings style epic novel about a Hobbit-like creature who grows up to become a dark overlord, and is eventually redeemed by his daughter.",
    },
    {
      "role": "assistant",
      "content": `1) Genre: Dark fantasy, vibrant colors, distortion effects, psychedelic colors, futurism, comic book style

      2) Chapters:
      A hobbit awakens in a lush forest
      A hobbit walks through a forest, collecting organic mushrooms
      Two hobbits come upon a secret treasure in a forest
      A dark evil overlord with a wizard hat appears in a dark twisted corner of the forest
      A nymph appears in the forest, enchanting the hobbit
      The hobbit and nymph become friendly and go on an adventure
      The dark evil overlord in the wizard hat spies upon the hobbit and nymph, plotting vengeance
      A hobbit goes to battle against a dark evil overlord in a wizard hat
      A brilliant light appears in the forest, illuminating it
      The hobbit triumphs and slays the evil dark overlord in the wizard hat
      The hobbit and nymph walk together towards the end of the forest and live happily ever after`
    },
    {
      "role": "user", 
      "content": "Explain the grabby alien theory."
    },
    {
      "role": "assistant", 
      "content": `1) Genre: surrealism, monochromatic, experimental, alien motifs, rendered in Unreal Engine, 4k cinematic HD

      2) Chapters:
      Alien lifeforms with strange eyes teem all over the galaxies
      Advanced alien spaceships spreading rapidly across the universe
      A cosmic party is reaching full swing as the nebulae explode
      Advanced aliens leave noticeable marks, like humans on Earth
      Humans cross paths with aliens with advanced technologies      
      Space-faring aliens with advanced technologies bump into each other
      The universe fills up with space-faring aliens with advanced technologies`
    },
    {
      "role": "user",
      "content": nextTask
    }
  ]

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.99,
    max_tokens: 500,
    top_p: 1,
    frequency_penalty: 1.5,
    presence_penalty: 1.2,
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

  console.log("=================================");
  console.log(nextTask);
  console.log(prompts);

  return prompts;
}
  
