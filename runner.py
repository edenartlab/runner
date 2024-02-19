import os
import dotenv
import random
import time
from io import BytesIO
import requests
import replicate
from typing import Optional, List
from pydantic import BaseModel, Field
import mongo

dotenv.load_dotenv()

REPLICATE_API_KEY = os.environ.get("REPLICATE_API_KEY")


def get_version(replicate_client, model_name: str):
    model = replicate_client.models.get(model_name)
    return model.latest_version.id


def run_task(
    config: dict[any], 
    model_name: str = None, 
    model_version: str = None
):
    r = replicate.Client(api_token=REPLICATE_API_KEY)
    
    if not model_version:
        version = get_version(r, model_name)
        model_version = f"{model_name}:{version}"

    output = r.run(model_version=model_version, input=config)

    return output


def submit_task(
    config: dict[any],
    model_name: str = None,
    model_version: str = None,
    webhook: str = None,
    webhook_events_filter: list[str] = None,
):
    r = replicate.Client(api_token=REPLICATE_API_KEY)

    if not model_version:
        model_version = get_version(r, model_name)

    prediction = r.predictions.create(
        version=model_version,
        input=config,
        webhook=webhook,
        webhook_events_filter=webhook_events_filter,
    )
    return prediction


def sdxl(config: dict[any]):
    output = run_task(
        config, 
        model_name="abraham-ai/eden-sd-pipelines-sdxl"
    )
    
    output = list(output)
    output_url = output[0]["files"][0]
    thumbnail_url = output[0]["thumbnails"][0]

    output_url = output[0]["files"][0]
    thumbnail_url = output[0]["thumbnails"][0]
    
    return output_url, thumbnail_url


def comfy_heartbeat():
    print("comfy heartbeat")

    config = {
        "mode": "txt2img",
        "text_input": "heartbeat",
        "width": random.choice([512, 768]),
        "height": random.choice([512, 768]),
    }

    model_version = mongo.get_latest_version_comfy()

    output = submit_task(
        config, 
        model_name="abraham-ai/eden-comfyui",
        model_version=model_version
    )
    
    return output


def video_heartbeat():
    print("video heartbeat")

    config = {
        "mode": "create",
        "text_input": "heartbeat",
        "width": random.choice([512, 768]),
        "height": random.choice([512, 768])
    }

    model_version = mongo.get_latest_version_video()
    
    output = submit_task(
        config, 
        model_name="abraham-ai/eden-sd-pipelines-sdxl",
        model_version=model_version
    )
    
    return output


def run_comfy_heartbeat():
    time.sleep(5)
    while True:
        try:
            output_url = comfy_heartbeat()
            print(output_url)
        except Exception as e:
            print(e)
        time.sleep(292)


def run_video_heartbeat():
    time.sleep(2)
    while True:
        try:
            output_url = video_heartbeat()
            print(output_url)
        except Exception as e:
            print(e)
        time.sleep(176)


# if __name__ == "__main__":
#     comfy_heartbeat()
