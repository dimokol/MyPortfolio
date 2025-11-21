import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export default class Vehicle {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.physicsWorld = experience.physicsWorld;
    this.controls = experience.controls;

    // Vehicle parameters - simplified for better performance
    this.params = {
      chassisWidth: 2.4,
      chassisHeight: 1.0,
      chassisLength: 4.5,
      mass: 5,
      wheelRadius: 0.5,
      wheelWidth: 0.4,
      maxSteerVal: Math.PI / 8,
      maxForce: 50
    };

    this.createChassis();
    this.createWheels();
    this.createHeadlights();
    this.setupVehicle();
  }

  createChassis() {
    // Physics body
    const chassisShape = new CANNON.Box(
      new CANNON.Vec3(
        this.params.chassisWidth / 2,
        this.params.chassisHeight / 2,
        this.params.chassisLength / 2
      )
    );

    this.chassisBody = new CANNON.Body({
      mass: this.params.mass,
      position: new CANNON.Vec3(0, 4, 0),
      shape: chassisShape
    });
    this.chassisBody.linearDamping = 0.3; // Slight air resistance for better control

    // Visual mesh - Stylized car
    const chassisGeometry = new THREE.BoxGeometry(
      this.params.chassisWidth,
      this.params.chassisHeight,
      this.params.chassisLength
    );

    // Create a vibrant gradient material
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xff1144,
      emissiveIntensity: 0.3,
      flatShading: true // Low-poly stylized look
    });

    this.chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);
    this.chassisMesh.castShadow = true;
    this.chassisMesh.receiveShadow = true;
    this.scene.add(this.chassisMesh);

    // Add a cabin/roof
    const cabinGeometry = new THREE.BoxGeometry(
      this.params.chassisWidth * 0.8,
      this.params.chassisHeight * 0.7,
      this.params.chassisLength * 0.5
    );
    const cabinMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      metalness: 0.9,
      roughness: 0.1,
      flatShading: true
    });
    this.cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    this.cabin.position.y = this.params.chassisHeight * 0.7;
    this.cabin.position.z = -0.3;
    this.cabin.castShadow = true;
    this.chassisMesh.add(this.cabin);

    // Add accent stripes
    const stripeGeometry = new THREE.BoxGeometry(
      this.params.chassisWidth * 0.15,
      this.params.chassisHeight * 0.05,
      this.params.chassisLength
    );
    const stripeMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      metalness: 1.0,
      roughness: 0.0,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      flatShading: true
    });

    const stripe1 = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe1.position.set(this.params.chassisWidth * 0.35, 0, 0);
    this.chassisMesh.add(stripe1);

    const stripe2 = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe2.position.set(-this.params.chassisWidth * 0.35, 0, 0);
    this.chassisMesh.add(stripe2);
  }

  createWheels() {
    this.wheelMeshes = [];
    this.wheelBodies = [];

    const wheelGeometry = new THREE.CylinderGeometry(
      this.params.wheelRadius,
      this.params.wheelRadius,
      this.params.wheelWidth,
      16
    );
    wheelGeometry.rotateZ(Math.PI / 2);

    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.5,
      roughness: 0.7,
      flatShading: true
    });

    // Create 4 wheels (front-left, front-right, rear-left, rear-right)
    for (let i = 0; i < 4; i++) {
      const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelMesh.castShadow = true;
      this.scene.add(wheelMesh);
      this.wheelMeshes.push(wheelMesh);

      // Add wheel rims (glowing accent)
      const rimGeometry = new THREE.CylinderGeometry(
        this.params.wheelRadius * 0.5,
        this.params.wheelRadius * 0.5,
        this.params.wheelWidth * 1.1,
        6
      );
      rimGeometry.rotateZ(Math.PI / 2);
      const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
        metalness: 1.0,
        roughness: 0.0,
        emissive: 0xff00ff,
        emissiveIntensity: 0.6,
        flatShading: true
      });
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      wheelMesh.add(rim);
    }
  }

  setupVehicle() {
    // Create RigidVehicle (simpler and works better)
    this.vehicle = new CANNON.RigidVehicle({
      chassisBody: this.chassisBody
    });

    const mass = 1;
    const axisWidth = 5;
    const wheelShape = new CANNON.Sphere(this.params.wheelRadius);
    const wheelMaterial = this.experience.wheelMaterial;
    const down = new CANNON.Vec3(0, -1, 0);
    const wheelAxis = new CANNON.Vec3(1, 0, 0); // X-axis for proper wheel rotation

    // Wheel bodies
    this.wheelBodies = [];

    // Front-left wheel (index 0)
    const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial });
    wheelBody1.addShape(wheelShape);
    wheelBody1.angularDamping = 0.4;
    this.vehicle.addWheel({
      body: wheelBody1,
      position: new CANNON.Vec3(-2, 0, axisWidth / 2),
      axis: wheelAxis,
      direction: down
    });
    this.wheelBodies.push(wheelBody1);

    // Front-right wheel (index 1)
    const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial });
    wheelBody2.addShape(wheelShape);
    wheelBody2.angularDamping = 0.4;
    this.vehicle.addWheel({
      body: wheelBody2,
      position: new CANNON.Vec3(-2, 0, -axisWidth / 2),
      axis: wheelAxis,
      direction: down
    });
    this.wheelBodies.push(wheelBody2);

    // Rear-left wheel (index 2)
    const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial });
    wheelBody3.addShape(wheelShape);
    wheelBody3.angularDamping = 0.4;
    this.vehicle.addWheel({
      body: wheelBody3,
      position: new CANNON.Vec3(2, 0, axisWidth / 2),
      axis: wheelAxis,
      direction: down
    });
    this.wheelBodies.push(wheelBody3);

    // Rear-right wheel (index 3)
    const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial });
    wheelBody4.addShape(wheelShape);
    wheelBody4.angularDamping = 0.4;
    this.vehicle.addWheel({
      body: wheelBody4,
      position: new CANNON.Vec3(2, 0, -axisWidth / 2),
      axis: wheelAxis,
      direction: down
    });
    this.wheelBodies.push(wheelBody4);

    this.vehicle.addToWorld(this.physicsWorld);
  }

  createHeadlights() {
    this.headlights = [];

    // Left headlight
    const leftHeadlight = new THREE.SpotLight(0xffeeaa, 2, 50, Math.PI / 6, 0.5, 2);
    leftHeadlight.position.set(-0.8, 0.2, this.params.chassisLength / 2 + 0.1);
    leftHeadlight.target.position.set(-0.8, -1, this.params.chassisLength / 2 + 10);
    leftHeadlight.castShadow = true;
    leftHeadlight.shadow.mapSize.width = 1024;
    leftHeadlight.shadow.mapSize.height = 1024;
    leftHeadlight.shadow.camera.near = 0.1;
    leftHeadlight.shadow.camera.far = 50;
    this.chassisMesh.add(leftHeadlight);
    this.chassisMesh.add(leftHeadlight.target);
    this.headlights.push(leftHeadlight);

    // Right headlight
    const rightHeadlight = new THREE.SpotLight(0xffeeaa, 2, 50, Math.PI / 6, 0.5, 2);
    rightHeadlight.position.set(0.8, 0.2, this.params.chassisLength / 2 + 0.1);
    rightHeadlight.target.position.set(0.8, -1, this.params.chassisLength / 2 + 10);
    rightHeadlight.castShadow = true;
    rightHeadlight.shadow.mapSize.width = 1024;
    rightHeadlight.shadow.mapSize.height = 1024;
    rightHeadlight.shadow.camera.near = 0.1;
    rightHeadlight.shadow.camera.far = 50;
    this.chassisMesh.add(rightHeadlight);
    this.chassisMesh.add(rightHeadlight.target);
    this.headlights.push(rightHeadlight);

    // Headlight lens geometry (visual only)
    const lensGeometry = new THREE.CircleGeometry(0.3, 16);
    const lensMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffee,
      emissive: 0xffffaa,
      emissiveIntensity: 1.0,
      side: THREE.DoubleSide
    });

    const leftLens = new THREE.Mesh(lensGeometry, lensMaterial);
    leftLens.position.set(-0.8, 0.2, this.params.chassisLength / 2 + 0.05);
    this.chassisMesh.add(leftLens);

    const rightLens = new THREE.Mesh(lensGeometry, lensMaterial);
    rightLens.position.set(0.8, 0.2, this.params.chassisLength / 2 + 0.05);
    this.chassisMesh.add(rightLens);
  }

  update(deltaTime) {
    // Apply forces based on controls
    const input = this.controls.input;

    // Acceleration/Braking
    if (input.forward) {
      this.vehicle.setWheelForce(this.params.maxForce, 2);
      this.vehicle.setWheelForce(this.params.maxForce, 3);
    } else if (input.backward) {
      this.vehicle.setWheelForce(-this.params.maxForce / 2, 2);
      this.vehicle.setWheelForce(-this.params.maxForce / 2, 3);
    } else {
      this.vehicle.setWheelForce(0, 2);
      this.vehicle.setWheelForce(0, 3);
    }

    // Steering
    if (input.left) {
      this.vehicle.setSteeringValue(this.params.maxSteerVal, 0);
      this.vehicle.setSteeringValue(this.params.maxSteerVal, 1);
    } else if (input.right) {
      this.vehicle.setSteeringValue(-this.params.maxSteerVal, 0);
      this.vehicle.setSteeringValue(-this.params.maxSteerVal, 1);
    } else {
      this.vehicle.setSteeringValue(0, 0);
      this.vehicle.setSteeringValue(0, 1);
    }

    // Update visual meshes to match physics
    this.chassisMesh.position.copy(this.chassisBody.position);
    this.chassisMesh.quaternion.copy(this.chassisBody.quaternion);

    // Update wheel meshes
    for (let i = 0; i < this.wheelBodies.length; i++) {
      this.wheelMeshes[i].position.copy(this.wheelBodies[i].position);
      this.wheelMeshes[i].quaternion.copy(this.wheelBodies[i].quaternion);
    }

    // Auto-flip if upside down
    const up = new CANNON.Vec3(0, 1, 0);
    const chassisUp = new CANNON.Vec3(0, 1, 0);
    this.chassisBody.quaternion.vmult(chassisUp, chassisUp);

    if (chassisUp.dot(up) < -0.5) {
      // Car is upside down, flip it
      const currentPos = this.chassisBody.position;
      this.chassisBody.position.set(currentPos.x, currentPos.y + 3, currentPos.z);
      this.chassisBody.quaternion.setFromEuler(0, 0, 0);
      this.chassisBody.velocity.set(0, 0, 0);
      this.chassisBody.angularVelocity.set(0, 0, 0);
    }
  }

  getPosition() {
    return this.chassisBody.position;
  }

  getVelocity() {
    return this.chassisBody.velocity;
  }
}
