import os
import dotenv
import json
import time
import random
from typing import List
from pydantic import BaseModel
from openai import OpenAI

import eden

class PromptSequence(BaseModel):
    title: str
    genre: str
    prompts: List[str]

schema = PromptSequence.schema()

dotenv.load_dotenv()

client = OpenAI()
client.api_key = os.environ['OPENAI_API_KEY']

eden.api_url = os.environ['EDEN_API_URL'] or "https://api.eden.art"
eden.api_key = os.environ['EDEN_API_KEY']
eden.api_secret = os.environ['EDEN_API_SECRET']

generator_name = "create"
delay_time = int(20 * 60)  # 20 minutes

system_message1 = """You are a muse that helps with writer's block for journalists, artists, and other creative intellectuals. You are concrete, preferring to tell stories with real characters and content, rather than abstract ideas. When a user asks you to, you give them some kind of creative writing task, like to tell a story, explain a scientific or technological concept, or describe a series of impossible visual scenes.

Some example tasks you might give to users:
Write a Lord of the Rings style epic novel about a Hobbit-like creature who grows up to become a dark overlord, and is eventually redeemed by his daughter
Explain the grabby theory of aliens.
Write out the sequence of significant evolutionary steps which led from the first life on Earth to modern technological human beings.
Write a science fiction screenplay about a detective who discovers a portal to the 11th century"""


system_message2 = """You are a world-renowned artist who produces original digital artworks. You are immensely creative, original, and eclectic. Humans ask you to make artworks according to some specific, story, or context. You respond with the following:

1) "Genre": a short concise set of detailed visual characteristics which define the overall aesthetic of the story.
2) "Prompts": an ordered set of artwork titles which respond to the prompt and tell a story or otherwise respond to it in a novel way. Make sure the chapters describe concrete visual content, and are not overly abstract. Be consistent in your descriptions of characters, repeating their most concrete visual elements. Prefix this with "Chapters"
"""

prompt1 = 'Write a Lord of the Rings style epic novel about a Hobbit-like creature who grows up to become a dark overlord, and is eventually redeemed by his daughter.'

response1 = {
    'title': 'The Hobbit Awakens',
    'genre': 'Dark fantasy, vibrant colors, distortion effects, psychedelic colors, futurism, comic book style',
    'prompts': [
        'A hobbit awakens in a lush forest',
        'A hobbit walks through a forest, collecting organic mushrooms',
        'Two hobbits come upon a secret treasure in a forest',
        'A dark evil overlord with a wizard hat appears in a dark twisted corner of the forest',
        'A nymph appears in the forest, enchanting the hobbit',
        'The hobbit and nymph become friendly and go on an adventure',
        'The dark evil overlord in the wizard hat spies upon the hobbit and nymph, plotting vengeance',
        'A hobbit goes to battle against a dark evil overlord in a wizard hat',
        'A brilliant light appears in the forest, illuminating it',
        'The hobbit triumphs and slays the evil dark overlord in the wizard hat',
        'The hobbit and nymph walk together towards the end of the forest and live happily ever after'
    ]
}

prompt2 = 'Explain the grabby alien theory.'

response2 = {
    'title': 'Grabby Aliens',
    'genre': 'surrealism, monochromatic, experimental, alien motifs, rendered in Unreal Engine, 4k cinematic HD',
    'prompts': [
        'Alien lifeforms with strange eyes teem all over the galaxies',
        'Advanced alien spaceships spreading rapidly across the universe',
        'A cosmic party is reaching full swing as the nebulae explode',
        'Advanced aliens leave noticeable marks, like humans on Earth',
        'Humans cross paths with aliens with advanced technologies',
        'Space-faring aliens with advanced technologies bump into each other',
        'The universe fills up with space-faring aliens with advanced technologies'
    ]
}


def generate_story():

    response = client.chat.completions.create(
        model="gpt-4-1106-preview",
        messages=[
            {
                "role": "system",
                "content": system_message1
            },
            {
                "role": "user",
                "content": "Give me a creative writing task. Be concise, just state the task."
            }
        ],
        temperature=1,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    next_task = response.choices[0].message.content

    response = client.chat.completions.create(
        model="gpt-4-1106-preview",
        messages=[
            {"role": "system", "content": system_message2},
            {"role": "user", "content": prompt1},
            {"role": "assistant", "content": json.dumps(response1)},
            {"role": "user", "content": prompt2},
            {"role": "assistant", "content": json.dumps(response2)},
            {"role": "user", "content": next_task},
        ],
        functions=[
            {
                "name": "get_story",
                "description": "Get a story as a visual genre description and sequence of prompts that tell a story",
                "parameters": PromptSequence.schema()
            }
        ],
        function_call={"name": "get_story"}
    )

    args = json.loads(response.choices[0].message.function_call.arguments)
    title, genre, prompts = args['title'], args['genre'], args['prompts']

    #collection = eden.collections.create(name=title, description=next_task)
    #eden.collections.addcreations[collection['collectionId'],]

    for prompt in prompts:
        
        try:
            print("=========================================")
            print(f'{prompt}, {genre}')

            size = random.choice([[1024, 1024], [1280, 960], [960, 1280], [1280, 1280], [896, 1536], [1536, 896], [1280, 960]])
            width, height = size[0], size[1]

            if random.random() < 0.33:
                width, height = height, width

            config = {
                "width": width,
                "height": height,
                "text_input": f'{prompt}, {genre}',
                "uc_text": "natural, ugly, tiling, birds, clocks, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft",
                "guidance_scale": 7.5,
                "sampler": "euler",
                "steps": 35,
            }

            creation = eden.tasks.create(generator_name, config)
            print(creation)

        except Exception as e:
            print(e)
        
        time.sleep(delay_time)


def run_abraham_loop():
    while True:
        try:
            generate_story()
        except Exception as e:
            print(e)
        time.sleep(5)


if __name__ == "__main__":
    run_abraham_loop()

