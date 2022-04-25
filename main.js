import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.137.0-X5O2PK3x44y1WRry67Kr/mode=imports/optimized/three.js';
import { EffectComposer } from 'https://unpkg.com/three@0.137.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.137.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.137.0/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'https://unpkg.com/three@0.137.0/examples/jsm/postprocessing/SMAAPass.js';
import { GammaCorrectionShader } from 'https://unpkg.com/three@0.137.0/examples/jsm/shaders/GammaCorrectionShader.js';
import { EffectShader } from "./EffectShader.js";
import { EffectCompositer } from "./EffectCompositer.js";
import { OrbitControls } from 'https://unpkg.com/three@0.137.0/examples/jsm/controls/OrbitControls.js';
import { AssetManager } from './AssetManager.js';
import { Stats } from "./stats.js";
import { GUI } from 'https://unpkg.com/three@0.138.0/examples/jsm/libs/lil-gui.module.min.js';
async function main() {
    // Setup basic renderer, controls, and profiler
    const clientWidth = window.innerWidth * 0.99;
    const clientHeight = window.innerHeight * 0.98;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, clientWidth / clientHeight, 0.1, 1000);
    camera.position.set(50, 75, 50);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(clientWidth, clientHeight);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 25, 0);
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
    // Setup scene
    // Skybox
    const environment = new THREE.CubeTextureLoader().load([
        "skybox/Box_Right.bmp",
        "skybox/Box_Left.bmp",
        "skybox/Box_Top.bmp",
        "skybox/Box_Bottom.bmp",
        "skybox/Box_Front.bmp",
        "skybox/Box_Back.bmp"
    ]);
    scene.background = environment;
    // Lighting
    const ambientLight = new THREE.AmbientLight(new THREE.Color(1.0, 1.0, 1.0), 0.25);
    //scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.35);
    directionalLight.position.set(150, 200, 50);
    // Shadows
    //directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.left = -75;
    directionalLight.shadow.camera.right = 75;
    directionalLight.shadow.camera.top = 75;
    directionalLight.shadow.camera.bottom = -75;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.bias = -0.001;
    directionalLight.shadow.blurSamples = 8;
    directionalLight.shadow.radius = 4;
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.15);
    directionalLight2.color.setRGB(1.0, 1.0, 1.0);
    directionalLight2.position.set(-50, 200, -150);
    scene.add(directionalLight2);
    // Objects
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100).applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2)), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide }));
    ground.castShadow = true;
    ground.receiveShadow = true;
    //scene.add(ground);
    const box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, color: new THREE.Color(1.0, 0.0, 0.0) }));
    box.castShadow = true;
    box.receiveShadow = true;
    box.position.y = 5.01;
    //scene.add(box);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(6.25, 32, 32), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, envMap: environment, metalness: 1.0, roughness: 0.25 }));
    sphere.position.y = 5.01;
    sphere.position.x = 25;
    sphere.position.z = 25;
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    //scene.add(sphere);
    const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(5, 1.5, 200, 32), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, envMap: environment, metalness: 0.5, roughness: 0.5, color: new THREE.Color(0.0, 1.0, 0.0) }));
    torusKnot.position.y = 5.01;
    torusKnot.position.x = -25;
    torusKnot.position.z = -25;
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = true;
    //scene.add(torusKnot);
    const sponza = (await AssetManager.loadGLTFAsync("sponza.glb")).scene;
    sponza.traverse(object => {
        if (object.material) {
            object.material.envMap = environment;
        }
    })
    sponza.scale.set(10, 10, 10)
    scene.add(sponza);
    const dragonGeo = (await AssetManager.loadGLTFAsync("dragon.glb")).scene.children[0].children[0].geometry;
    const dragon = new THREE.Mesh(dragonGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2)).applyMatrix4(new THREE.Matrix4().makeScale(3.0, 3.0, 3.0)),
        new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, emissive: new THREE.Color(2, 10, 2), envMap: environment, metalness: 0.5, roughness: 0.2, color: new THREE.Color(0.0, 1.0, 0.0) }));
    scene.add(dragon);
    const dragon2 = new THREE.Mesh(dragonGeo,
        new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, envMap: environment, metalness: 0.5, roughness: 0.2, color: new THREE.Color(1.0, 0.0, 0.0) }));
    dragon2.position.x = 80;
    dragon2.rotation.y = Math.PI / 2;
    const dragon3 = new THREE.Mesh(dragonGeo,
        new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, envMap: environment, metalness: 0.5, roughness: 0.2, color: new THREE.Color(0.0, 0.0, 1.0) }));
    dragon3.position.x = -80;
    dragon3.rotation.y = 3 * Math.PI / 2;
    scene.add(dragon2);
    scene.add(dragon3);
    // Build postprocessing stack
    // Render Targets
    const defaultTexture = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        type: THREE.FloatType
    });
    defaultTexture.depthTexture = new THREE.DepthTexture(clientWidth, clientHeight, THREE.FloatType);
    // Post Effects
    const composer = new EffectComposer(renderer);
    const smaaPass = new SMAAPass(clientWidth, clientHeight);
    const effectPass = new ShaderPass(EffectShader);
    const effectCompositer = new ShaderPass(EffectCompositer);
    composer.addPass(effectPass);
    composer.addPass(effectCompositer);
    composer.addPass(smaaPass);
    const effectController = {
        samples: 16.0,
        blur: 24.0,
        strength: 5.0,
        quality: 6.0
    };
    const gui = new GUI();
    gui.add(effectController, "samples", 8.0, 64.0, 0.001).name("Samples");
    gui.add(effectController, "blur", 0.0, 24.0, 0.001).name("Blur");
    gui.add(effectController, "strength", 0.0, 10.0, 0.001).name("Strength");
    gui.add(effectController, "quality", 1.0, 12.0, 0.001).name("Blur Quality");
    /*  for (let i = 0; i < 50; i++) {
          const emitterMesh = new THREE.Mesh(new THREE.PlaneGeometry(5 + Math.random() * 10, 5 + Math.random() * 10), new THREE.MeshStandardMaterial({ emissive: new THREE.Color(10.0 * Math.random(), 10.0 * Math.random(), 10.0 * Math.random()), side: THREE.DoubleSide }));
          emitterMesh.position.y = 100 * Math.random();
          emitterMesh.position.x = 200 * Math.random() - 100;
          emitterMesh.position.z = 100 * Math.random() - 50;
          emitterMesh.rotation.y = Math.random() * 2 * Math.PI;
          emitterMesh.rotation.x = Math.random() * 2 * Math.PI;
          emitterMesh.rotation.z = Math.random() * 2 * Math.PI;
          scene.add(emitterMesh);
      }*/
    let emitters = [];
    for (let i = 1; i < 9; i++) {
        const emitterMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ emissive: new THREE.Color(10.0 * Math.random(), 10.0 * Math.random(), 10.0 * Math.random()), side: THREE.DoubleSide }));
        emitterMesh.position.y = 40;
        emitterMesh.position.x = -100 + 20 * i;
        emitterMesh.position.z = -35;
        emitterMesh.turnPattern = i;
        emitters.push(emitterMesh);
        scene.add(emitterMesh)
    }
    for (let i = 1; i < 9; i++) {
        const emitterMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ emissive: new THREE.Color(10.0 * Math.random(), 10.0 * Math.random(), 10.0 * Math.random()), side: THREE.DoubleSide }));
        emitterMesh.position.y = 40;
        emitterMesh.position.x = -100 + 20 * i;
        emitterMesh.position.z = 35;
        emitterMesh.turnPattern = -i;
        emitters.push(emitterMesh);
        scene.add(emitterMesh)
    }
    const emissiveSphere1 = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), new THREE.MeshStandardMaterial({ emissive: new THREE.Color(1.0, 10.0, 1.0) }));
    emissiveSphere1.position.y = 45;
    emissiveSphere1.position.z = -2.5;
    emissiveSphere1.position.x = -97.5;
    scene.add(emissiveSphere1);
    const emissiveSphere2 = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), new THREE.MeshStandardMaterial({ emissive: new THREE.Color(10.0, 1.0, 1.0) }));
    emissiveSphere2.position.y = 45;
    emissiveSphere2.position.z = -2.5;
    emissiveSphere2.position.x = 87.5;
    scene.add(emissiveSphere2);

    function animate() {
        //emitterMesh.rotation.x += 0.01;
        emitters.forEach(emitter => {
            if (emitter.turnPattern % 2 === 0) {
                emitter.rotation.x += 0.01 * Math.sign(emitter.turnPattern);
            } else {
                emitter.rotation.y += 0.01 * Math.sign(emitter.turnPattern);
            }
        })
        renderer.setRenderTarget(defaultTexture);
        renderer.clear();
        renderer.render(scene, camera);
        effectCompositer.uniforms["sceneDiffuse"].value = defaultTexture.texture;
        effectCompositer.uniforms["sceneDepth"].value = defaultTexture.depthTexture;
        effectPass.uniforms["sceneDiffuse"].value = defaultTexture.texture;
        effectPass.uniforms["sceneDepth"].value = defaultTexture.depthTexture;
        camera.updateMatrixWorld();
        effectPass.uniforms["projMat"].value = camera.projectionMatrix;
        effectPass.uniforms["viewMat"].value = camera.matrixWorldInverse;
        effectPass.uniforms["projViewMat"].value = camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse.clone());
        effectPass.uniforms["projectionMatrixInv"].value = camera.projectionMatrixInverse;
        effectPass.uniforms["viewMatrixInv"].value = camera.matrixWorld;
        effectPass.uniforms["cameraPos"].value = camera.position;
        effectPass.uniforms['resolution'].value = new THREE.Vector2(clientWidth, clientHeight);
        effectPass.uniforms['time'].value = performance.now() / 1000;
        effectPass.uniforms['samples'].value = effectController.samples;
        effectCompositer.uniforms["resolution"].value = new THREE.Vector2(clientWidth, clientHeight);
        effectCompositer.uniforms["blur"].value = effectController.blur;
        effectCompositer.uniforms["strength"].value = effectController.strength;
        effectCompositer.uniforms["quality"].value = effectController.quality;
        composer.render();
        controls.update();
        stats.update();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}
main();