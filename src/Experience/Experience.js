import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import Camera from '../Camera/Camera.js';
import Controls from '../Controls/Controls.js';
import Vehicle from '../Vehicle/Vehicle.js';
import ProceduralTerrain from '../World/ProceduralTerrain.js';
import NightSky from '../Environment/NightSky.js';
import InteractiveObjects from '../World/InteractiveObjects.js';

export default class Experience {
  constructor(canvas) {
    // Singleton
    if (Experience.instance) {
      return Experience.instance;
    }
    Experience.instance = this;

    // Setup
    this.canvas = canvas;
    this.debug = false; // Set to true to enable physics debugger

    // Initialize
    this.setupRenderer();
    this.setupScene();
    this.setupPhysics();
    this.setupCamera();
    this.setupControls();
    this.setupWorld();
    this.setupVehicle();
    this.setupLights();

    // Start animation loop
    this.clock = new THREE.Clock();
    this.animate();

    // Handle window resize
    window.addEventListener('resize', () => this.onResize());
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000814);
    this.scene.fog = new THREE.FogExp2(0x000814, 0.015);
  }

  setupPhysics() {
    this.physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -15, 0), // Slightly stronger than earth gravity for arcade feel
    });

    // Physics materials
    this.groundMaterial = new CANNON.Material('ground');
    this.wheelMaterial = new CANNON.Material('wheel');

    // Contact material (friction between wheel and ground)
    const wheelGroundContact = new CANNON.ContactMaterial(
      this.wheelMaterial,
      this.groundMaterial,
      {
        friction: 0.3,
        restitution: 0.0,
        contactEquationStiffness: 1000
      }
    );
    this.physicsWorld.addContactMaterial(wheelGroundContact);

    // Debugger
    if (this.debug) {
      this.cannonDebugger = new CannonDebugger(this.scene, this.physicsWorld);
    }
  }

  setupCamera() {
    this.camera = new Camera(this);
  }

  setupControls() {
    this.controls = new Controls(this);
  }

  setupWorld() {
    // Procedural terrain
    this.terrain = new ProceduralTerrain(this);

    // Night sky with stars
    this.nightSky = new NightSky(this);

    // Interactive objects (portfolio items)
    this.interactiveObjects = new InteractiveObjects(this);
  }

  setupVehicle() {
    this.vehicle = new Vehicle(this);
  }

  setupLights() {
    // Ambient light for overall scene illumination
    const ambientLight = new THREE.AmbientLight(0x4a5f8f, 0.3);
    this.scene.add(ambientLight);

    // Moonlight (directional light)
    const moonLight = new THREE.DirectionalLight(0x6b7fb5, 0.5);
    moonLight.position.set(50, 100, 50);
    moonLight.castShadow = true;
    moonLight.shadow.camera.left = -50;
    moonLight.shadow.camera.right = 50;
    moonLight.shadow.camera.top = 50;
    moonLight.shadow.camera.bottom = -50;
    moonLight.shadow.camera.near = 0.1;
    moonLight.shadow.camera.far = 200;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    this.scene.add(moonLight);
  }

  update() {
    const deltaTime = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Update physics
    this.physicsWorld.fixedStep();

    // Update vehicle
    if (this.vehicle) {
      this.vehicle.update(deltaTime);
    }

    // Update camera
    if (this.camera) {
      this.camera.update(deltaTime);
    }

    // Update terrain (chunk loading/unloading)
    if (this.terrain) {
      this.terrain.update(this.vehicle.chassisMesh.position);
    }

    // Update night sky
    if (this.nightSky) {
      this.nightSky.update(elapsedTime);
    }

    // Update interactive objects
    if (this.interactiveObjects) {
      this.interactiveObjects.update(deltaTime);
    }

    // Update debugger
    if (this.debug && this.cannonDebugger) {
      this.cannonDebugger.update();
    }
  }

  animate() {
    window.requestAnimationFrame(() => this.animate());

    this.update();
    this.renderer.render(this.scene, this.camera.instance);
  }

  onResize() {
    // Update camera
    this.camera.instance.aspect = window.innerWidth / window.innerHeight;
    this.camera.instance.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  destroy() {
    window.removeEventListener('resize', () => this.onResize());
    this.controls.destroy();
    this.renderer.dispose();
  }
}
