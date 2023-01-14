import openai from 'openai';
import dotenv from 'dotenv';

dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


function getRandomSample(arr, sampleSize) {
  return arr
    .sort(() => 0.5 - Math.random())
    .slice(0, sampleSize);
}

const subjects = [
  'Coders',
  'Vanlife programming wizards',
  'Coders on electric unicycles',
  'Vanlife cyberpunk hackers',
  'Vanlife cyberpunk coders',
  'Intelligence as a service',
  'Comptuer brains and artificial intelligences',
  'Cyberpunk hackers',
  'Solarpunk coders',
  'Electric unicycle riding nomads',
  'Solarpunk electric bike riding coder gang',
  'The simulation',
  'A simulation containing cyberpunk nomads',
  'A simulation of a solarpunk building being constructed',
  'Off-grid cyberpunk vanlife explorer surveying mars oasis',
  'Holy futuristic cyborg',
  'Cyber neon AI art kid',
  'Portrait of a biomechanical head inside an orb',
  'Lush tropical canopy with creatures',
  'Cyberpunk hero whiz kid',
  'Hyper mecha digital nomads clad in cyberpunk attire',
  'Off-grid survivalist scientists vanlife',
  'Epic winged Hippogriff flying over a medieval castle',
  'Cybernetic holographic ninja riding a motorcycle with a kitana',
];

const contexts = [
  'in the desert',
  'in a solarpunk pavilion',
  'in a solarpunk pavilion in the desert',
  'in a lush zen buddhism garden',
  'futuristic desert village',
  'in a rustic Buddhist monastery',
  'in the cyberpunk city',
  'in a neon glow city',
];

const media = ['3D render', 'computer rendering', 'detailed drawing', 'detailed painting', 'digital painting', 'digital rendering', 'fine art painting', 'hologram', 'hyperrealistic painting', 'low poly render', 'macro photograph', 'painting', 'pastel', 'pencil sketch', 'photo', 'photorealistic painting', 'polaroid photo', 'pop art painting', 'poster', 'raytraced image', 'tilt shift photo', 'watercolor painting', 'wireframe diagram', 'acrylic painting', 'airbrush painting', 'album cover', 'ambient occlusion render', 'anime drawing', 'ultrafine detailed painting', 'chalk art', 'computer graphics', 'concept art', 'cyberpunk art', 'digital art', 'egyptiart', 'graffiti art', 'pixel art', 'poster art', 'vector art'];

const flavors = ['vaporwave', 'cyberpunk', 'synthwave', '4k', 'aestheticism', 'arabesque', 'baroque', 'crystal cubism', 'futurism', 'hyperrealism', 'hypermodernism', 'retrofuturism', 'highly detailed', 'sharp focus', 'intricate', 'digital painting', 'illustration', 'octane render', 'smooth', '8 k', 'elegant', '8k', 'cinematic', '4k', 'fantasy', 'cinematic lighting', 'detailed', '4 k', 'photorealistic', 'unreal engine', 'masterpiece', 'realistic', 'hd', 'dramatic lighting', 'volumetric lighting', 'high detail', 'beautiful', 'hyperrealistic', 'hyper detailed', 'portrait', 'high quality', 'hyper realistic', 'ultra realistic', 'unreal engine 5', 'matte painting', 'ultra detailed', 'award winning', 'matte', 'intricate details', 'epic', 'hdr', 'extremely detailed', 'very detailed', 'oil painting', 'dynamic lighting', 'hyperdetailed', 'oil on canvas', 'high resolution', 'sharp', 'studio lighting', 'depth of field', 'hyper realism', 'full body', 'colorful', 'dark', 'cyberpunk', 'octane', 'centered', 'high contrast', 'bokeh', 'global illumination', 'dramatic', 'symmetrical', 'd & d', 'intricate detail', 'atmospheric', 'd&d', 'golden ratio', 'wide angle', 'anime', 'golden hour', 'detailed face', 'rule of thirds', 'stunning', 'vibrant colors', 'soft lighting', 'ray tracing', 'photography', 'epic composition', 'radiant light', '8k resolution', 'cinematic composition', 'horror', 'vibrant', 'black and white', 'close up', 'medium shot', 'ornate', 'photo realistic', 'photo', 'vivid colors', '8 k resolution', 'trending on art station', 'futuristic', 'high details', 'high definition', 'volumetric light', 'wide shot', 'movie still', 'establishing shot', 'surreal', 'gothic', '3 d render', 'unreal 5', 'photograph', 'sunset', 'painting', 'sci-fi', 'rim light', 'hearthstone', 'beautiful lighting', 'ambient lighting', 'sci - fi', 'moody', 'digital illustration', 'symmetrical face', 'epic lighting', 'fog', 'sakimichan', 'beautiful face', 'soft light', 'fine details', 'dark fantasy', 'gorgeous', 'deep focus', 'night', '3 d', 'eerie', 'daz', 'shallow depth of field', '3d', 'atmospheric lighting', 'symmetry', 'cute', 'studio quality', 'scifi', 'chiaroscuro', 'insanely detailed', 'white background', 'natural light', 'details', 'hard edges', 'character design', 'artistic', 'asymmetrical', 'rpg portrait', 'sunny day', 'ethereal', 'bright colors', 'raytracing', 'perfect face', 'god rays', 'psychedelic', '35mm', 'dramatic light', 'dynamic pose', '3 5 mm', 'steampunk', 'focus', 'extreme detail', 'lifelike', 'organic painting', 'backlit', '3d render', 'octane rendered', 'neon', 'foggy', 'uhd', '4k resolution', 'cinematic shot', 'breathtaking', 'vivid', 'fantasy', 'ultra wide angle', 'subsurface scattering', 'very coherent', 'stylized', 'ultra hd', 'aesthetic', 'lens flare', 'intricate linework', 'vintage', 'focused', 'insanely detailed and intricate', 'hq', 'ultrarealistic', 'dreamy', 'high fantasy', 'award winning photo', 'minimalist', '4 k resolution', 'award-winning', 'manga', 'realistic shaded perfect', 'professional photography', 'perfect composition', 'dslr', 'render', 'award winning photography', 'magical', 'abstract', 'detailed illustration', 'vaporwave', 'atmosphere', 'beautiful composition', 'bouguereau', 'glowing lights', 'cel shaded', 'painted', 'sense of awe', 'full of colour', 'detailed painting', 'synthwave', 'dark atmosphere', 'neo-gothic', 'realistic lighting', 'mystical', 'science fiction', 'cinematic atmosphere'];


export async function generatePrompt() {
  const subject = getRandomSample(subjects, 1);
  const context = getRandomSample(contexts, 1);
  const flavors2 = getRandomSample(flavors, 2);
  const medium2 = getRandomSample(media, 2);
  const prompt = `${subject} ${context}, ${medium2[0]}, ${flavors2[0]}, ${medium2[1]}, ${flavors2[1]}`;
  return prompt;
}

export async function generatePrompts(n) {
  let prompts = [];
  for (var i=0; i<n; i++) {
    const prompt = generatePrompt();
    prompts.push(prompt);
  }
  return prompts;
}

export async function createPrompt() {
  
  const prompts = await generatePrompts(6);
  const combined_prompt = prompts.join('\n')+'\n';

  // combine into one string with newlines
  const initString = "Make a detailed imaginitive description of a detailed artwork in the following style. Here are some examples. Create another 1."
  const promptString = initString + prompts.join('\n');

  const configuration = new openai.Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai_api = new openai.OpenAIApi(configuration);

  let title = '';

  while (title.length == 0) {
    let completion = await openai_api.createCompletion({
      model: "davinci",
      prompt: combined_prompt,
      temperature: 0.99,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 2.0,
      presence_penalty: 1.0,
      stop: ["\n"]
    });
    title = completion.data.choices[0].text;
  }

  return title.trim();
}
  

