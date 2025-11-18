import * as THREE from 'three';

export default class Camera {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.canvas = experience.canvas;

    // Camera parameters
    this.params = {
      fov: 75,
      near: 0.1,
      far: 500,
      // 3rd person camera offset
      distance: 12,
      height: 5,
      lookAhead: 2,
      smoothness: 0.1, // Lower = smoother, higher = more responsive
      minDistance: 8,
      maxDistance: 25
    };

    // Eased values for smooth following
    this.currentPosition = new THREE.Vector3(0, 10, -10);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);

    this.createCamera();
  }

  createCamera() {
    this.instance = new THREE.PerspectiveCamera(
      this.params.fov,
      window.innerWidth / window.innerHeight,
      this.params.near,
      this.params.far
    );

    this.instance.position.copy(this.currentPosition);
    this.scene.add(this.instance);
  }

  update(deltaTime) {
    if (!this.experience.vehicle) return;

    const vehicle = this.experience.vehicle;
    const chassisPosition = vehicle.chassisMesh.position;
    const chassisQuaternion = vehicle.chassisMesh.quaternion;

    // Calculate ideal camera position (behind and above the vehicle)
    const vehicleDirection = new THREE.Vector3(0, 0, 1);
    vehicleDirection.applyQuaternion(chassisQuaternion);

    const idealOffset = vehicleDirection.multiplyScalar(-this.params.distance);
    idealOffset.y += this.params.height;

    const idealPosition = new THREE.Vector3();
    idealPosition.copy(chassisPosition).add(idealOffset);

    // Calculate ideal look-at point (slightly ahead of the vehicle)
    const lookAheadOffset = new THREE.Vector3(0, 0, 1);
    lookAheadOffset.applyQuaternion(chassisQuaternion);
    lookAheadOffset.multiplyScalar(this.params.lookAhead);

    const idealLookAt = new THREE.Vector3();
    idealLookAt.copy(chassisPosition).add(lookAheadOffset);
    idealLookAt.y += 1; // Look slightly above the vehicle center

    // Smoothly interpolate camera position and look-at
    this.currentPosition.lerp(idealPosition, this.params.smoothness);
    this.currentLookAt.lerp(idealLookAt, this.params.smoothness);

    // Apply to camera
    this.instance.position.copy(this.currentPosition);
    this.instance.lookAt(this.currentLookAt);
  }

  zoomIn() {
    this.params.distance = Math.max(this.params.minDistance, this.params.distance - 2);
  }

  zoomOut() {
    this.params.distance = Math.min(this.params.maxDistance, this.params.distance + 2);
  }
}
