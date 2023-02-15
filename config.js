let sizes = [[512, 512], [640, 640], [768, 480], [800, 576], [768, 512], [800, 512]];
let steps = [50, 60, 60, 80, 100];
let samplers = ["klms", "euler_ancestral", "euler", "klms"];

let size = sizes[Math.floor(Math.random() * sizes.length)];
let sampler = samplers[Math.floor(Math.random() * samplers.length)];
let numSteps = steps[Math.floor(Math.random() * steps.length)];
let W = size[0];
let H = size[1];
let scale = 5.0 + 8.0*Math.random();

export default {sizes, steps, samplers, size, sampler, numSteps, W, H, scale}