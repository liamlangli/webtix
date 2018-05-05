#ifndef stdlib
#define stdlib

#define EPSILON 0.000001
#define PI 3.141592653
#define Naturn_E 2.718281828

float minElement(vec3 V) {
    return min(V.x, min(V.y, V.z));
}

float maxElement(vec3 V) {
    return max(V.x, max(V.y, V.z));
}

bool contain(const vec3 V, const vec3 minV, const vec3 maxV) {
    return dot(step(minV, V), step(V, maxV)) >= 3.0;
}

float boxIntersect(vec3 minV, vec3 maxV, vec3 ori, vec3 dir) {
    if (contain(ori, minV, maxV)) {
        return 0.0;
    }

    vec3 invDir = 1.0 / dir;

    vec3 bmin = (minV - ori) * invDir;
    vec3 bmax = (maxV - ori) * invDir;

    vec3 near = min(bmin, bmax);
    vec3 far = max(bmin, bmax);

    float ext_n = max(near.x, max(near.y, near.z));
    float ext_f = min(far.x, min(far.y, far.z));
    if(ext_f < 0.0 || ext_n > ext_f) {
        return -1.0;
    }
    return ext_n;
}

#endif