import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { Tween, Easing } from 'tween';

function initializeScene(containerId, imageUrl) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID ${containerId} not found.`);
        return;
    }
    const scene = new THREE.Scene();

    // Set the background color
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement);

    // Disable tone mapping to avoid brightness issues
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Add orbit controls
    // const controls = new OrbitControls(camera, renderer.domElement);

    // Create PC Monitor Components
    const monitorGroup = new THREE.Group();

    // Load the texture for the screen
    const textureLoader = new THREE.TextureLoader();
    const screenTexture = textureLoader.load(imageUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        screenMaterial.map = texture;
        renderer.render(scene, camera);
    });

    // Screen
    const screenGeometry = new THREE.BoxGeometry(4, 2.3, 0.1);
    const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 0, 0.1);
    monitorGroup.add(screen);

    // Frame
    const frameGeometry = new THREE.BoxGeometry(4.1, 2.4, 0.2);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8, metalness: 0.3 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    frame.receiveShadow = false;
    monitorGroup.add(frame);

    // Stand
    const standGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.1);
    const standMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7, metalness: 0.2 });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.set(0, -1.3, -0.1);
    stand.castShadow = true;
    stand.receiveShadow = false;
    monitorGroup.add(stand);

    // Base
    const baseGeometry = new THREE.BoxGeometry(1, 0.1, 0.7);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.7, metalness: 0.2 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, -1.4, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    monitorGroup.add(base);

    // Recompute normals for your geometries
    stand.geometry.computeVertexNormals();
    base.geometry.computeVertexNormals();

    scene.add(monitorGroup);

    // Set the camera position and make it look at the origin (0, 0, 0)
    camera.position.set(-1.5, 1, 5); // Adjust as needed
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    

    // Add Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 6);
    directionalLight.position.set(5, 10, 3).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add Back Light
    const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
    backLight.position.set(0, 2, -5).normalize();
    backLight.shadow.mapSize.width = 1024;
    backLight.shadow.mapSize.height = 1024;
    backLight.castShadow = true;
    scene.add(backLight);

    // Create the EffectComposer and Passes
    const composer = new EffectComposer(renderer);

    // Add a RenderPass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Variables for TweenJS animations
    let hoverTweenPosition;
    let leaveTweenPosition;
    let isRendering = false;
    let hoverTweenActive = false;
    let leaveTweenActive = false;
    let hoverCooldown = false;
    let leaveCooldown = false;

    function createTweens() {
        hoverTweenPosition = new Tween(camera.position)
            .to({ x: 0, y: 0, z: 5 }, 500)
            .easing(Easing.Quadratic.Out)
            .onComplete(() => {
                isRendering = false;
                hoverTweenActive = false;
                hoverCooldown = true;
                setTimeout(() => {
                    hoverCooldown = false;
                }, 200); // Adjust cooldown time as needed
            });

        leaveTweenPosition = new Tween(camera.position)
            .to({ x: -1.5, y: 1, z: 5 }, 500)
            .easing(Easing.Quadratic.Out)
            .onComplete(() => {
                isRendering = false;
                leaveTweenActive = false;
                leaveCooldown = true;
                setTimeout(() => {
                    leaveCooldown = false;
                }, 200); // Adjust cooldown time as needed
            });
    }

    createTweens();

    // Tween animations
    function onHover() {
        if (!hoverTweenActive && !hoverCooldown) {
          isRendering = true;
          hoverTweenPosition.start();
          hoverTweenActive = true;
        }
      }
      
      function onLeave() {
        if (!leaveTweenActive && !leaveCooldown) {
          isRendering = true;
          leaveTweenPosition.start();
          leaveTweenActive = true;
        }
      }

    container.addEventListener('mouseenter', onHover);
    container.addEventListener('mouseleave', onLeave);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        if (isRendering) {
            // console.log('rendering frames')
            if (hoverTweenPosition) hoverTweenPosition.update();
            if (leaveTweenPosition) leaveTweenPosition.update();
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            composer.render();
        }
    }
    animate()

    // Adjust renderer size on window resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        composer.setSize(width, height);  
    });

    // Initial resize handling to ensure the scene fits the container
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    composer.setSize(width, height);
}

document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM fully loaded and parsed');
    // Initialize scenes for different containers with different images
    initializeScene('threejs-background-1', './assets/tunebox.png');
    initializeScene('threejs-background-2', './assets/connectfour.png');
    initializeScene('threejs-background-3', './assets/chordtranslator.png');
    initializeScene('threejs-background-4', './assets/docwait.png');
});