import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js'


document.addEventListener('DOMContentLoaded', () => {
    // Basic setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadow maps
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use soft shadows
    renderer.setPixelRatio(window.devicePixelRatio)
    document.body.appendChild(renderer.domElement);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true; // Enable zoom

    // Create a particle system with cubes
    const geometry = new THREE.BoxGeometry(1, 1, 1); // Use BoxGeometry to create cubes
    const material = new THREE.MeshStandardMaterial({
        color: 0x9e2902, 
        roughness: 1,
        emissive: 0x000000, 
        emissiveIntensity: 0.5
    });

    const particles = new THREE.Group();
    scene.add(particles);

    for (let i = 0; i < 70; i++) {
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50);
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.01, // Adjust speed for smoother movement
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01
        );
        particle.userData.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 0.005, // Adjust rotation speed
            (Math.random() - 0.5) * 0.005,
            (Math.random() - 0.5) * 0.005
        );
        particle.castShadow = true; // Enable shadow casting
        particle.receiveShadow = true; // Enable shadow receiving
        particles.add(particle);
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 12); // Moderate ambient light
    scene.add(ambientLight);

    // Add point light to simulate the sun
    const pointLight = new THREE.PointLight(0xffff00, 10, 0, 0); // Bright yellow light
    pointLight.position.set(10, 15, 0); // Position the light at the same location as the sun
    pointLight.castShadow = true; // Enable shadow casting for the point light
    pointLight.shadow.mapSize.width = 2048; // Increase shadow map size
    pointLight.shadow.mapSize.height = 2048; // Increase shadow map size
    pointLight.shadow.camera.near = 0.1; // Set shadow camera near plane
    pointLight.shadow.camera.far = 500; // Set shadow camera far plane
    pointLight.shadow.bias = -0.001; // Reduce shadow bias
    scene.add(pointLight);

    // Add second point light
    const pointLight2 = new THREE.PointLight(0xffff00, 3, 0, 0); // Bright yellow light
    pointLight2.position.set(10, 10, 100); // Position the light to illuminate the scene
    pointLight2.shadow.mapSize.width = 2048; // Increase shadow map size
    pointLight2.shadow.mapSize.height = 2048; // Increase shadow map size
    pointLight2.shadow.camera.near = 10; // Set shadow camera near plane
    pointLight2.shadow.camera.far = 1000; // Set shadow camera far plane
    pointLight2.shadow.bias = -0.001; // Reduce shadow bias
    scene.add(pointLight2);
    
    // Add glowing sun object
    const sunGeometry = new THREE.SphereGeometry(2.5, 32, 32); // Create a sphere to represent the sun
    const sunMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00, // Yellow color
        emissive: 0xffff00, // Glowing effect
        emissiveIntensity: 1 // Intensity of the glow
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(10, 15, 0); // Position the sun in the scene
    scene.add(sun);

    // Setup post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5, // Bloom strength
        1, // Bloom radius
        0.8 // Bloom threshold
    );
    composer.addPass(bloomPass);

    const smaaPass = new SMAAPass(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
    composer.addPass(smaaPass);
    
    // Set camera position
    camera.position.set(20, 20, 100); // Center the camera view on the scene
    camera.lookAt(scene.position); // Make sure the camera is looking at the center of the scene

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Move particles
        particles.children.forEach(particle => {
            particle.position.add(particle.userData.velocity);

            // Rotate particles
            particle.rotation.x += particle.userData.rotationSpeed.x;
            particle.rotation.y += particle.userData.rotationSpeed.y;
            particle.rotation.z += particle.userData.rotationSpeed.z;

            // Bounce particles off walls
            if (particle.position.x > 50 || particle.position.x < -50) particle.userData.velocity.x *= -1;
            if (particle.position.y > 50 || particle.position.y < -50) particle.userData.velocity.y *= -1;
            if (particle.position.z > 50 || particle.position.z < -50) particle.userData.velocity.z *= -1;
        });

        controls.update();
        composer.render(); // Use composer for rendering
    }

    animate();

    // Handle resizing
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
});