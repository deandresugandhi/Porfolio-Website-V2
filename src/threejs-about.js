import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { Tween, Easing } from 'tween';

function initializeScene(containerId, images, allowSlidingImages) {
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

    // Create PC Monitor Components
    const monitorGroup = new THREE.Group();

    // Crop screens to only display current screen
    const clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 2);
    const clipPlane2 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 2);
    const clipPlanes = [clipPlane, clipPlane2];
    renderer.localClippingEnabled = true;

    // Screen
    const screenGeometry = new THREE.BoxGeometry(4, 2.3, 0.01);
    const screenMaterial = new THREE.MeshBasicMaterial({ map: null, clippingPlanes: clipPlanes });
    const screenMaterial2 = new THREE.MeshBasicMaterial({ map: null, clippingPlanes: clipPlanes });
    const screenMaterial3 = new THREE.MeshBasicMaterial({ map: null, clippingPlanes: clipPlanes });
    let screen = new THREE.Mesh(screenGeometry, screenMaterial);
    let screen2 = new THREE.Mesh(screenGeometry, screenMaterial2);
    let screen3 = new THREE.Mesh(screenGeometry, screenMaterial3);
    screen.position.set(0, 0, 0.1);
    screen2.position.set(4, 0, 0.1);
    screen3.position.set(-4, 0, 0.1);
    monitorGroup.add(screen);
    monitorGroup.add(screen2);
    monitorGroup.add(screen3);

    // Load the texture for the screen
    let currentImageIndex = 0;
    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (index, screen, callback) => {
        textureLoader.load(images[index], (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            screen.material.map = texture;
            screen.material.needsUpdate = true;
            if (callback) callback();
            renderer.render(scene, camera);
        });
    };
    loadTexture(currentImageIndex, screen);
    loadTexture((currentImageIndex + 1) % images.length, screen2);
    loadTexture((currentImageIndex - 1 + images.length) % images.length, screen3);


    // Buttons
    function createTriangleGeometry(direction) {
        const shape = new THREE.Shape();
        if (direction === 'left') {
            shape.moveTo(0, 1);
            shape.lineTo(-1, 0);
            shape.lineTo(0, -1);
            shape.lineTo(0, 1);
        } else if (direction === 'right') {
            shape.moveTo(0, 1);
            shape.lineTo(1, 0);
            shape.lineTo(0, -1);
            shape.lineTo(0, 1);
        }
        return new THREE.ShapeGeometry(shape);
    }
    const leftArrowGeometry = createTriangleGeometry('left');
    const rightArrowGeometry = createTriangleGeometry('right');
    let buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    const leftButton = new THREE.Mesh(leftArrowGeometry, buttonMaterial);
    leftButton.scale.set(0.09, 0.07, 0.1)
    leftButton.position.set(-1.75, 0, 0.11); // Position on the left side of the screen
    monitorGroup.add(leftButton);
    const rightButton = new THREE.Mesh(rightArrowGeometry, buttonMaterial);
    rightButton.scale.set(0.09, 0.07, 0.1)
    rightButton.position.set(1.75, 0, 0.11); // Position on the right side of the screen
    monitorGroup.add(rightButton);

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
    camera.position.set(-3, 2, 6.5); // Adjust as needed
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

    // Setup raycaster and mouse vector for button press events
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Function to detect clicks
    function onMouseClick(event) {
        // Get bounding rectangle of the canvas
        const canvasBoundingRect = renderer.domElement.getBoundingClientRect();

        // Normalize mouse coordinates relative to canvas
        mouse.x = ((event.clientX - canvasBoundingRect.left) / canvasBoundingRect.width) * 2 - 1;
        mouse.y = -((event.clientY - canvasBoundingRect.top) / canvasBoundingRect.height) * 2 + 1;

        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections
        const intersects = raycaster.intersectObjects([leftButton, rightButton]); // Add your buttons here

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object === leftButton) {
                slideImages('previous')
            } else if (object === rightButton) {
                slideImages('next');
            }
        }
    }

    function onMouseMove(event) {
        // Get bounding rectangle of the canvas
        const canvasBoundingRect = renderer.domElement.getBoundingClientRect();

        // Normalize mouse coordinates relative to canvas
        mouse.x = ((event.clientX - canvasBoundingRect.left) / canvasBoundingRect.width) * 2 - 1;
        mouse.y = -((event.clientY - canvasBoundingRect.top) / canvasBoundingRect.height) * 2 + 1;
    
        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections
        const intersects = raycaster.intersectObjects([leftButton, rightButton]); // Add your buttons here

        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    // Add event listener
    window.addEventListener('click', onMouseClick);
    container.addEventListener('mousemove', onMouseMove);


    // Create the EffectComposer and Passes
    const composer = new EffectComposer(renderer);

    // Add a RenderPass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Variables for TweenJS animations
    let hoverTweenPosition;
    let leaveTweenPosition;
    let hoverTweenButtonOpacity;
    let leaveTweenButtonOpacity;
    let screen1SlideNext;
    let screen1SlidePrevious;
    let screen2Slide;
    let screen3Slide;
    let animationState = ['idle', 'idle'] // Added state variable

    function createTweens() {
        hoverTweenPosition = new Tween(camera.position)
            .to({ x: 0, y: 0, z: 5 }, 500)
            .easing(Easing.Quadratic.Out)
            .onComplete(() => {
                animationState[0] = 'idle';
            });
        
        leaveTweenPosition = new Tween(camera.position)
            .to({ x: -3, y: 2, z: 6.5 }, 500)
            .easing(Easing.Quadratic.Out)
            .onComplete(() => {
                animationState[0]  = 'idle';
            });
        
        hoverTweenButtonOpacity = new Tween({ opacity: buttonMaterial.opacity })
            .to({ opacity: allowSlidingImages ? 0.25 : 0 }, 500)
            .easing(Easing.Quadratic.InOut)
            .onUpdate((newOpacity) => {
                buttonMaterial.opacity = newOpacity.opacity;
                buttonMaterial.needsUpdate = true;
            })
            .onComplete(() => {
                animationState[0]  = 'idle';
            });
        
        leaveTweenButtonOpacity = new Tween({ opacity: buttonMaterial.opacity })
            .to({ opacity: 0 }, 500)
            .easing(Easing.Quadratic.InOut)
            .onUpdate((newOpacity) => {
                buttonMaterial.opacity = newOpacity.opacity;
                buttonMaterial.needsUpdate = true;
            })
            .onComplete(() => {
                animationState[0]  = 'idle';
            });
        
        screen1SlideNext = new Tween(screen.position)
            .to({ x: -4 }, 500)
            .easing(Easing.Quadratic.InOut)
            .onComplete(() => {
                animationState[1]  = 'idle';
            });
        
        screen1SlidePrevious = new Tween(screen.position)
            .to({ x: 4 }, 500)
            .easing(Easing.Quadratic.InOut)
            .onComplete(() => {
                animationState[1]  = 'idle';
            });

        screen2Slide = new Tween(screen2.position)
            .to({ x: 0 }, 500)
            .easing(Easing.Quadratic.InOut)
            .onComplete(() => {
                currentImageIndex = (currentImageIndex + 1) % images.length;
                loadTexture(currentImageIndex, screen, () => {
                    screen.position.x = 0
                    screen2.position.x = 4
                    screen3.position.x = -4
                });
                let nextIndex = (currentImageIndex + 1) % images.length;
                let previousIndex = (currentImageIndex - 1 + images.length) % images.length;
                loadTexture(nextIndex, screen2);
                loadTexture(previousIndex, screen3);
                console.log("loaded")
                animationState[1]  = 'idle';
            });

        screen3Slide = new Tween(screen3.position)
            .to({ x: 0 }, 500)
            .easing(Easing.Quadratic.InOut)
            .onComplete(() => {
                currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
                loadTexture(currentImageIndex, screen, () => {
                    screen.position.x = 0
                    screen2.position.x = 4
                    screen3.position.x = -4
                });
                let nextIndex = (currentImageIndex + 1) % images.length;
                let previousIndex = (currentImageIndex - 1 + images.length) % images.length;
                loadTexture(nextIndex, screen2);
                loadTexture(previousIndex, screen3);
                console.log("loaded")
                animationState[1] = 'idle';
            });
    }

    function startOpacityTween(state) {
        let currentOpacity = buttonMaterial.opacity;
        hoverTweenButtonOpacity = new Tween({ opacity: currentOpacity })
            .to({ opacity: allowSlidingImages ? 0.25 : 0 }, 500)
            .easing(Easing.Quadratic.In)
            .onUpdate((newOpacity) => {
                buttonMaterial.opacity = newOpacity.opacity;
                buttonMaterial.needsUpdate = true;
            })
            .onComplete(() => {
                animationState[0]  = 'idle';
            });
        
        leaveTweenButtonOpacity = new Tween({ opacity: currentOpacity })
            .to({ opacity: 0 }, 500)
            .easing(Easing.Quadratic.Out)
            .onUpdate((newOpacity) => {
                buttonMaterial.opacity = newOpacity.opacity;
                buttonMaterial.needsUpdate = true;
            })
            .onComplete(() => {
                animationState[0]  = 'idle';
            });
        if (state == "hovering") hoverTweenButtonOpacity.start()
        else if (state == "leaving") leaveTweenButtonOpacity.start()
    }

    createTweens();

    // Tween animations
    function onHover() {
        leaveTweenPosition.stop();
        leaveTweenButtonOpacity.stop();
        animationState[0] = 'hovering';
        hoverTweenPosition.start();
        startOpacityTween(animationState[0])
    }
      
    function onLeave() {
        hoverTweenPosition.stop();
        hoverTweenButtonOpacity.stop();
        animationState[0] = 'leaving';
        leaveTweenPosition.start();
        startOpacityTween(animationState[0])
    }

    function slideImages(direction) {
        if (animationState[1] === 'sliding') {
            return
        };
        animationState[1] = 'sliding';
        if (direction === 'next') {
            screen1SlideNext.start();
            screen2Slide.start()
        } else if (direction === 'previous') {
            screen1SlidePrevious.start();
            screen3Slide.start()
        } else {
            console.error(`Container with ID ${containerId} not found.`);
            return;
        }
    }

    container.addEventListener('mouseenter', onHover);
    container.addEventListener('mouseleave', onLeave);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        if (animationState[0] != 'idle' || animationState[1] != 'idle') {
            // console.log('rendering frames')
            if (hoverTweenPosition) hoverTweenPosition.update();
            if (leaveTweenPosition) leaveTweenPosition.update();
            if (hoverTweenButtonOpacity) hoverTweenButtonOpacity.update();
            if (leaveTweenButtonOpacity) leaveTweenButtonOpacity.update();
            if (screen1SlideNext) screen1SlideNext.update();
            if (screen1SlidePrevious) screen1SlidePrevious.update();
            if (screen2Slide) screen2Slide.update();
            if (screen3Slide) screen3Slide.update();
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

const project1Images = [
    './assets/tunebox-screenshots/tunebox1.png',
    './assets/tunebox-screenshots/tunebox2.png',
    './assets/tunebox-screenshots/tunebox3.png',
]

const project2Images = [
    './assets/connectfour-screenshots/connectfour1.png',
    './assets/connectfour-screenshots/connectfour2.png',
    './assets/connectfour-screenshots/connectfour3.png',
    './assets/connectfour-screenshots/connectfour4.png'
]

const project3Images = [
    './assets/chordtranslator.png'
]

const project4Images = [
    './assets/docwait-screenshots/docwait1.png',
    './assets/docwait-screenshots/docwait2.png',
    './assets/docwait-screenshots/docwait3.png',
    './assets/docwait-screenshots/docwait4.png',
    './assets/docwait-screenshots/docwait5.png',
    './assets/docwait-screenshots/docwait6.png',
    
]

document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM fully loaded and parsed');
    // Initialize scenes for different containers with different images
    initializeScene('threejs-background-1', project1Images, true);
    initializeScene('threejs-background-2', project2Images, true);
    initializeScene('threejs-background-3', project3Images, false);
    initializeScene('threejs-background-4', project4Images, true);
});