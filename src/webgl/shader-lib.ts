import {
    KERNEL_ENVIRONMENT,
    KERNEL_RAY_CLOSEST_HIT,
    KERNEL_RAY_GENERATE,
    KERNEL_RAY_MISSED,
} from "../constants";
import { fetch_string } from "../utils/network";

const bucket = new Map<string, any>();

export class ShaderLib {
    public static get(name: string): string {
        return bucket.get(name);
    }

    public static set(name: string, value: string): void {
        bucket.set(name, value);
    }

    public static async init() {
        bucket.set("stdlib", await fetch_string('kernel/stdlib.glsl'));
        bucket.set("primitive", await fetch_string('kernel/primitive.glsl'));
        bucket.set("trace", await fetch_string('kernel/trace.glsl'));
        bucket.set("material", await fetch_string('kernel/material.glsl'));
        bucket.set("disney", await fetch_string('kernel/disney.glsl'));
        bucket.set(KERNEL_RAY_GENERATE, await fetch_string('kernel/ray_generate.glsl'));
        bucket.set(KERNEL_RAY_CLOSEST_HIT, await fetch_string('kernel/ray_closest_hit.glsl'));
        bucket.set(KERNEL_RAY_MISSED, await fetch_string('kernel/ray_missed.glsl'));
        bucket.set(KERNEL_ENVIRONMENT, await fetch_string('kernel/environment.glsl'));
    }
}
