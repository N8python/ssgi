import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.137.0-X5O2PK3x44y1WRry67Kr/mode=imports/optimized/three.js';

const EffectCompositer = {
    uniforms: {

        'sceneDiffuse': { value: null },
        'sceneDepth': { value: null },
        'tDiffuse': { value: null },
        'projMat': { value: new THREE.Matrix4() },
        'viewMat': { value: new THREE.Matrix4() },
        'projectionMatrixInv': { value: new THREE.Matrix4() },
        'viewMatrixInv': { value: new THREE.Matrix4() },
        'cameraPos': { value: new THREE.Vector3() },
        'resolution': { value: new THREE.Vector2() },
        'time': { value: 0.0 },
        'blur': { value: 12.0 },
        'strength': { value: 5.0 },
        'quality': { value: 6.0 }
    },
    vertexShader: /* glsl */ `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,
    fragmentShader: /* glsl */ `
		uniform sampler2D sceneDiffuse;
    uniform sampler2D sceneDepth;
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float blur;
    uniform float strength;
    uniform float quality;
    varying vec2 vUv;
    highp float linearize_depth(highp float d, highp float zNear,highp float zFar)
    {
        highp float z_n = 2.0 * d - 1.0;
        return 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));
    }
    void main() {
        const float directions = 16.0;
        const float pi = 3.14159;
        float size = blur;//1000.0 * (1.0 - texture2D(sceneDepth, vUv).x);
        vec2 radius = vec2(size) / resolution;
        vec3 texel = texture2D(tDiffuse, vUv).rgb;
        float count = 0.0;
        float initialDepth = linearize_depth(texture2D(sceneDepth, vUv).x, 0.1, 1000.0);
        for(float d =0.0; d < pi * 2.0; d+=(pi * 2.0) / directions) {
            for(float i = 1.0/quality; i<=1.0; i+=1.0/quality) {
                vec2 sampleUv = vUv+vec2(cos(d), sin(d)) * radius * i;
                if (abs(linearize_depth(texture2D(sceneDepth, sampleUv).x, 0.1, 1000.0) - initialDepth) < 5.0) {
                    texel += texture2D(tDiffuse, sampleUv).rgb;
                    count += 1.0;
                }
            }
        }
        texel /= count;
        if (abs(vUv.x - 0.0) <= 1.0 / resolution.x) {
            gl_FragColor = vec4(1.0);
        } else if (vUv.x < 0.0) {
            gl_FragColor = vec4(texture2D(sceneDiffuse, vUv).rgb, 1.0);
        } else {
            gl_FragColor = vec4(texture2D(sceneDiffuse, vUv).rgb + strength * texel.rgb * texture2D(sceneDiffuse, vUv).rgb, 1.0);
        }
    }
    `

}
export { EffectCompositer };