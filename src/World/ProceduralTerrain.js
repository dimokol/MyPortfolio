import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import SimplexNoise from '../Utils/SimplexNoise.js';

export default class ProceduralTerrain {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.physicsWorld = experience.physicsWorld;

    // Terrain parameters
    this.chunkSize = 50; // Size of each terrain chunk
    this.renderDistance = 3; // Number of chunks in each direction
    this.chunks = new Map(); // Store active chunks

    // Noise for procedural details
    this.noise = new SimplexNoise();

    // Materials
    this.createMaterials();

    // Create initial chunks
    this.updateChunks(new THREE.Vector3(0, 0, 0));
  }

  createMaterials() {
    // Vibrant stylized ground material with grid pattern
    this.groundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0x0a1128) }, // Deep blue
        uColor2: { value: new THREE.Color(0x1e3a5f) }, // Medium blue
        uGridColor: { value: new THREE.Color(0x00ffff) }, // Cyan grid
        uGridWidth: { value: 0.05 },
        uChunkSize: { value: this.chunkSize }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uGridColor;
        uniform float uGridWidth;
        uniform float uChunkSize;

        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          // Hexagonal grid pattern
          vec2 pos = vPosition.xz;
          vec2 grid = abs(fract(pos - 0.5) - 0.5) / fwidth(pos);
          float line = min(grid.x, grid.y);

          // Mix base colors
          vec3 color = mix(uColor1, uColor2, vUv.y);

          // Add grid lines
          float gridMask = 1.0 - min(line, 1.0);
          color = mix(color, uGridColor, gridMask * 0.3);

          // Add subtle glow effect
          float glow = smoothstep(1.0, 0.0, line);
          color += uGridColor * glow * 0.1;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
  }

  createChunk(chunkX, chunkZ) {
    const key = `${chunkX}_${chunkZ}`;

    // Don't create if already exists
    if (this.chunks.has(key)) {
      return;
    }

    // Create flat plane geometry - simplified for performance
    const segments = 8;
    const geometry = new THREE.PlaneGeometry(
      this.chunkSize,
      this.chunkSize,
      segments,
      segments
    );

    // Rotate to be horizontal
    geometry.rotateX(-Math.PI / 2);

    // Create mesh
    const mesh = new THREE.Mesh(geometry, this.groundMaterial);
    mesh.position.set(
      chunkX * this.chunkSize,
      0,
      chunkZ * this.chunkSize
    );
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Simplified - no procedural objects for better performance
    const objects = [];

    // Physics - flat plane (no height variation)
    const physicsShape = new CANNON.Box(
      new CANNON.Vec3(this.chunkSize / 2, 0.1, this.chunkSize / 2)
    );
    const physicsBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: physicsShape,
      material: this.experience.groundMaterial
    });
    physicsBody.position.set(
      chunkX * this.chunkSize,
      -0.1,
      chunkZ * this.chunkSize
    );
    this.physicsWorld.addBody(physicsBody);

    // Store chunk data
    this.chunks.set(key, {
      mesh,
      physicsBody,
      objects,
      chunkX,
      chunkZ
    });
  }


  removeChunk(chunkX, chunkZ) {
    const key = `${chunkX}_${chunkZ}`;
    const chunk = this.chunks.get(key);

    if (!chunk) return;

    // Remove mesh
    this.scene.remove(chunk.mesh);
    chunk.mesh.geometry.dispose();

    // Remove physics
    this.physicsWorld.removeBody(chunk.physicsBody);

    // Remove objects
    chunk.objects.forEach(obj => {
      this.scene.remove(obj.mesh);
      obj.mesh.geometry.dispose();
      obj.mesh.material.dispose();
      if (obj.light) {
        this.scene.remove(obj.light);
      }
    });

    this.chunks.delete(key);
  }

  update(vehiclePosition) {
    // Calculate current chunk
    const currentChunkX = Math.floor(vehiclePosition.x / this.chunkSize);
    const currentChunkZ = Math.floor(vehiclePosition.z / this.chunkSize);

    // Create chunks around vehicle
    const activeChunks = new Set();
    for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
      for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
        const chunkX = currentChunkX + x;
        const chunkZ = currentChunkZ + z;
        const key = `${chunkX}_${chunkZ}`;

        activeChunks.add(key);
        this.createChunk(chunkX, chunkZ);
      }
    }

    // Remove chunks that are too far
    for (const [key, chunk] of this.chunks) {
      if (!activeChunks.has(key)) {
        this.removeChunk(chunk.chunkX, chunk.chunkZ);
      }
    }
  }

  updateChunks(position) {
    this.update(position);
  }
}
