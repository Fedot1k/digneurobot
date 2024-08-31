import gradio as gr
import numpy as np
import random
import spaces
import torch
from diffusers import DiffusionPipeline, FlowMatchEulerDiscreteScheduler, FluxTransformer2DModel
from transformers import CLIPTextModel, CLIPTokenizer,T5EncoderModel, T5TokenizerFast

dtype = torch.bfloat16
device = "cuda" if torch.cuda.is_available() else "cpu"

pipe = DiffusionPipeline.from_pretrained("sayakpaul/FLUX.1-merged", torch_dtype=dtype).to(device)

MAX_SEED = np.iinfo(np.int32).max
MAX_IMAGE_SIZE = 2048

@spaces.GPU()
def infer(prompt, seed=42, randomize_seed=False, width=1024, height=1024, guidance_scale=3.5, num_inference_steps=8, progress=gr.Progress(track_tqdm=True)):
    if randomize_seed:
        seed = random.randint(0, MAX_SEED)
    generator = torch.Generator().manual_seed(seed)
    image = pipe(
        prompt = prompt, 
        width = width,
        height = height,
        num_inference_steps = num_inference_steps, 
        generator = generator,
        guidance_scale=guidance_scale
    ).images[0] 
    return image, seed
 
examples = [
    "a tiny astronaut hatching from an egg on the moon",
    "a cat holding a sign that says hello world",
    "an anime illustration of a wiener schnitzel",
]

css="""
#col-container {
    margin: 0 auto;
    max-width: 520px;
}
"""

with gr.Blocks(css=css) as demo:
    
    with gr.Column(elem_id="col-container"):
        gr.Markdown(f"""# [FLUX.1 [merged]](https://huggingface.co/sayakpaul/FLUX.1-merged)
Merge by [Sayak Paul](https://huggingface.co/sayakpaul) of 2 of the 12B param rectified flow transformers [FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev) and [FLUX.1 [schnell]](https://huggingface.co/black-forest-labs/FLUX.1-schnell) by [Black Forest Labs](https://blackforestlabs.ai/)
        """)
        
        with gr.Row():
            
            prompt = gr.Text(
                label="Prompt",
                show_label=False,
                max_lines=1,
                placeholder="Enter your prompt",
                container=False,
            )
            run_button = gr.Button("Run", scale=0)
        
        num_inference_steps = gr.Slider(
            label="Number of inference steps",
            minimum=1,
            maximum=50,
            step=1,
            value=8,
        )
        
        result = gr.Image(label="Result", show_label=False)
        
        with gr.Accordion("Advanced Settings", open=False):
            
            seed = gr.Slider(
                label="Seed",
                minimum=0,
                maximum=MAX_SEED,
                step=1,
                value=0,
            )
            
            randomize_seed = gr.Checkbox(label="Randomize seed", value=True)
            
            with gr.Row():
                
                width = gr.Slider(
                    label="Width",
                    minimum=256,
                    maximum=MAX_IMAGE_SIZE,
                    step=32,
                    value=1024,
                )
                
                height = gr.Slider(
                    label="Height",
                    minimum=256,
                    maximum=MAX_IMAGE_SIZE,
                    step=32,
                    value=1024,
                )
            
            with gr.Row():

                guidance_scale = gr.Slider(
                    label="Guidance Scale",
                    minimum=1,
                    maximum=15,
                    step=0.1,
                    value=3.5,
                )
        
        gr.Examples(
            examples = examples,
            fn = infer,
            inputs = [prompt],
            outputs = [result, seed],
            cache_examples="lazy"
        )

    gr.on(
        triggers=[run_button.click, prompt.submit],
        fn = infer,
        inputs = [prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps],
        outputs = [result, seed]
    )

demo.launch()
