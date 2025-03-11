import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextureLoader } from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Loading manager
const loadingManager = new THREE.LoadingManager();
const textureLoader = new TextureLoader(loadingManager);

loadingManager.onLoad = function () {
    // Hide loading screen when all resources are loaded
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 1000);
};

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    // Update loading progress if needed
    console.log(`Loaded ${itemsLoaded} of ${itemsTotal} files.`);
};

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Add bloom effect
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,    // strength
    0.4,    // radius
    0.5     // threshold
);
composer.addPass(bloomPass);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.zoomSpeed = 2.0;
controls.minDistance = 5;
controls.maxDistance = 100;

// Camera position
camera.position.set(0, 20, 30);
controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light for better illumination
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Stars background
createStars();

// Animation speed control
let animationSpeed = 1;

// UI Controls
const guiParams = {
    showOrbitPaths: true,
    animationSpeed: 1,
    bloomStrength: 1.2,
    resetCamera: () => {
        camera.position.set(0, 20, 30);
        camera.lookAt(0, 0, 0);
        controls.update();
    }
};

// Setup GUI
const gui = new GUI();
gui.add(guiParams, 'showOrbitPaths').name('Show Orbit Paths').onChange(value => {
    orbitLines.forEach(orbit => {
        orbit.visible = value;
    });
});
gui.add(guiParams, 'animationSpeed', 0.1, 5, 0.1).name('Animation Speed').onChange(value => {
    animationSpeed = value;
});
gui.add(guiParams, 'bloomStrength', 0, 3, 0.1).name('Glow Intensity').onChange(value => {
    bloomPass.strength = value;
});
gui.add(guiParams, 'resetCamera').name('Reset Camera');

// Planet data
const planetData = [
    {
        name: 'Mercury',
        radius: 0.4,
        distance: 4,
        rotationSpeed: 0.004,
        orbitSpeed: 0.04,
        texture: 'textures/mercury.jpg',
        tilt: 0.034,
        emissiveColor: 0x555555
    },
    {
        name: 'Venus',
        radius: 0.9,
        distance: 7,
        rotationSpeed: 0.002,
        orbitSpeed: 0.015,
        texture: 'textures/venus.jpg',
        tilt: 3.86,
        emissiveColor: 0x553311
    },
    {
        name: 'Earth',
        radius: 1,
        distance: 10,
        rotationSpeed: 0.01,
        orbitSpeed: 0.01,
        texture: 'textures/earth.jpg',
        tilt: 23.44,
        emissiveColor: 0x113355,
        hasMoon: true,
        moonData: {
            radius: 0.27,
            distance: 2,
            rotationSpeed: 0.01,
            orbitSpeed: 0.05,
            texture: 'textures/moon.jpg',
            emissiveColor: 0x222222
        }
    },
    {
        name: 'Mars',
        radius: 0.5,
        distance: 14,
        rotationSpeed: 0.008,
        orbitSpeed: 0.008,
        texture: 'textures/mars.jpg',
        tilt: 25.19,
        emissiveColor: 0x551111
    },
    {
        name: 'Jupiter',
        radius: 2.5,
        distance: 20,
        rotationSpeed: 0.04,
        orbitSpeed: 0.002,
        texture: 'textures/jupiter.jpg',
        tilt: 3.13,
        emissiveColor: 0x554433
    },
    {
        name: 'Saturn',
        radius: 2.2,
        distance: 26,
        rotationSpeed: 0.038,
        orbitSpeed: 0.0009,
        texture: 'textures/saturn.jpg',
        tilt: 26.73,
        emissiveColor: 0x665522,
        hasRings: true
    },
    {
        name: 'Uranus',
        radius: 1.8,
        distance: 32,
        rotationSpeed: 0.03,
        orbitSpeed: 0.0004,
        texture: 'textures/uranus.jpg',
        tilt: 97.77,
        emissiveColor: 0x115566
    },
    {
        name: 'Neptune',
        radius: 1.7,
        distance: 36,
        rotationSpeed: 0.032,
        orbitSpeed: 0.0001,
        texture: 'textures/neptune.jpg',
        tilt: 28.32,
        emissiveColor: 0x1133aa
    }
];

// Create sun
const sunLight = new THREE.PointLight(0xffffff, 5, 100);
scene.add(sunLight);

const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load('textures/sun.jpg'),
    emissive: 0xffff00,
    emissiveIntensity: 0.8
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Add sun glow effect
const sunGlowGeometry = new THREE.SphereGeometry(3.5, 32, 32);
const sunGlowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        viewVector: { value: camera.position }
    },
    vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormel = normalize(normalMatrix * viewVector);
            intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying float intensity;
        void main() {
            vec3 glow = vec3(1.0, 0.8, 0.0) * intensity;
            gl_FragColor = vec4(glow, 1.0);
        }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
});

const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
scene.add(sunGlow);

// Create planets
const planets = [];
const orbitLines = [];

planetData.forEach(planet => {
    const planetObj = createPlanet(planet);
    planets.push(planetObj);

    // Create orbit line
    const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.05, planet.distance + 0.05, 128);
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const orbitLine = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbitLine.rotation.x = Math.PI / 2;
    scene.add(orbitLine);
    orbitLines.push(orbitLine);
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate sun
    sun.rotation.y += 0.001 * animationSpeed;

    // Update sun glow
    sunGlowMaterial.uniforms.viewVector.value.copy(camera.position);

    // Update planets
    planets.forEach((planetObj, index) => {
        const data = planetData[index];

        // Planet rotation
        planetObj.planet.rotation.y += data.rotationSpeed * animationSpeed;

        // Planet orbit
        planetObj.orbit.rotation.y += data.orbitSpeed * animationSpeed;

        // Moon rotation and orbit (if exists)
        if (planetObj.moon) {
            planetObj.moon.rotation.y += data.moonData.rotationSpeed * animationSpeed;
            planetObj.moonOrbit.rotation.y += data.moonData.orbitSpeed * animationSpeed;
        }
    });

    controls.update();
    composer.render();
}

// Create a planet with its properties
function createPlanet(data) {
    // Create orbit container
    const orbit = new THREE.Object3D();
    scene.add(orbit);

    // Create planet
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: textureLoader.load(data.texture),
        roughness: 0.5,
        metalness: 0.1,
        emissive: data.emissiveColor,
        emissiveIntensity: 0.3
    });
    const planet = new THREE.Mesh(geometry, material);

    // Apply tilt to planet
    if (data.tilt) {
        planet.rotation.x = THREE.MathUtils.degToRad(data.tilt);
    }

    // Position planet
    planet.position.x = data.distance;
    orbit.add(planet);

    const result = { planet, orbit };

    // Add moon if planet has one
    if (data.hasMoon) {
        const moonOrbit = new THREE.Object3D();
        planet.add(moonOrbit);

        const moonGeometry = new THREE.SphereGeometry(data.moonData.radius, 32, 32);
        const moonMaterial = new THREE.MeshStandardMaterial({
            map: textureLoader.load(data.moonData.texture),
            roughness: 0.5,
            metalness: 0.1,
            emissive: data.moonData.emissiveColor,
            emissiveIntensity: 0.3
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.x = data.moonData.distance;
        moonOrbit.add(moon);

        result.moon = moon;
        result.moonOrbit = moonOrbit;
    }

    // Add rings for Saturn
    if (data.hasRings) {
        const ringGeometry = new THREE.RingGeometry(data.radius + 0.5, data.radius + 2, 64);
        const ringMaterial = new THREE.MeshStandardMaterial({
            map: textureLoader.load('textures/saturn_rings.jpg'),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            emissive: 0x222222,
            emissiveIntensity: 0.2,
            roughness: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
        result.ring = ring;
    }

    return result;
}

// Create stars background
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Add raycaster for planet hover
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredPlanet = null;
let planetLabel = document.createElement('div');
planetLabel.style.position = 'absolute';
planetLabel.style.backgroundColor = 'rgba(0,0,0,0.7)';
planetLabel.style.color = 'white';
planetLabel.style.padding = '5px 10px';
planetLabel.style.borderRadius = '5px';
planetLabel.style.fontFamily = 'Arial, sans-serif';
planetLabel.style.fontSize = '14px';
planetLabel.style.pointerEvents = 'none';
planetLabel.style.display = 'none';
document.body.appendChild(planetLabel);

// Mouse move event
window.addEventListener('mousemove', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(
        planets.map(p => p.planet)
    );

    // Reset hovered planet
    if (hoveredPlanet) {
        hoveredPlanet = null;
        planetLabel.style.display = 'none';
    }

    // Set new hovered planet
    if (intersects.length > 0) {
        const planetIndex = planets.findIndex(p => p.planet === intersects[0].object);
        if (planetIndex !== -1) {
            hoveredPlanet = planetData[planetIndex];
            planetLabel.textContent = hoveredPlanet.name;
            planetLabel.style.display = 'block';
            planetLabel.style.left = event.clientX + 10 + 'px';
            planetLabel.style.top = event.clientY + 10 + 'px';
        }
    }
});

// Add click event to focus on planets
window.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(
        planets.map(p => p.planet)
    );

    if (intersects.length > 0) {
        const planetIndex = planets.findIndex(p => p.planet === intersects[0].object);
        if (planetIndex !== -1) {
            const planetObj = planets[planetIndex];
            const planet = planetData[planetIndex];

            // Get world position of the planet
            const planetWorldPos = new THREE.Vector3();
            planetObj.planet.getWorldPosition(planetWorldPos);

            // Calculate camera position at a distance from the planet
            const distance = planet.radius * 5;
            const cameraTargetPos = new THREE.Vector3(
                planetWorldPos.x + distance,
                planetWorldPos.y + distance / 2,
                planetWorldPos.z + distance
            );

            // Animate camera movement
            const startPos = camera.position.clone();
            const endPos = cameraTargetPos;
            const duration = 1000; // ms
            const startTime = Date.now();

            function animateCamera() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease function (ease-out cubic)
                const easeProgress = 1 - Math.pow(1 - progress, 3);

                // Interpolate camera position
                camera.position.lerpVectors(startPos, endPos, easeProgress);

                // Look at the planet
                camera.lookAt(planetWorldPos);
                controls.target.copy(planetWorldPos);
                controls.update();

                if (progress < 1) {
                    requestAnimationFrame(animateCamera);
                }
            }

            animateCamera();
        }
    }
});

// Start animation
animate(); 