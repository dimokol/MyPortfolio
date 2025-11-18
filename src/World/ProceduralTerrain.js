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

    // Create flat plane geometry with procedural details
    const segments = 32;
    const geometry = new THREE.PlaneGeometry(
      this.chunkSize,
      this.chunkSize,
      segments,
      segments
    );

    // Rotate to be horizontal
    geometry.rotateX(-Math.PI / 2);

    // Add subtle height variations for visual interest (not affecting physics)
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i] + chunkX * this.chunkSize;
      const z = positions[i + 2] + chunkZ * this.chunkSize;

      // Very subtle noise for visual variation only
      const noise = this.noise.noise2D(x * 0.05, z * 0.05) * 0.3;
      positions[i + 1] = noise;
    }
    geometry.computeVertexNormals();

    // Create mesh
    const mesh = new THREE.Mesh(geometry, this.groundMaterial);
    mesh.position.set(
      chunkX * this.chunkSize,
      0,
      chunkZ * this.chunkSize
    );
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Add procedural objects to this chunk (trees, rocks, portfolio items)
    const objects = this.generateChunkObjects(chunkX, chunkZ);

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

  generateChunkObjects(chunkX, chunkZ) {
    const objects = [];

    // Deterministic random based on chunk position
    const seed = chunkX * 73856093 ^ chunkZ * 19349663;
    const random = () => {
      const x = Math.sin(seed + objects.length * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    // Generate decorative objects
    const objectCount = Math.floor(random() * 5) + 2;

    for (let i = 0; i < objectCount; i++) {
      const x = (random() - 0.5) * this.chunkSize * 0.8;
      const z = (random() - 0.5) * this.chunkSize * 0.8;

      const worldX = chunkX * this.chunkSize + x;
      const worldZ = chunkZ * this.chunkSize + z;

      // Create stylized object (crystal/pillar)
      const height = random() * 3 + 2;
      const geometry = new THREE.ConeGeometry(0.5, height, 6);

      const hue = random();
      const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.8,
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.3,
        flatShading: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(worldX, height / 2, worldZ);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Add a point light for glow effect
      const light = new THREE.PointLight(color, 0.5, 10);
      light.position.set(worldX, height, worldZ);
      this.scene.add(light);

      objects.push({ mesh, light });
    }

    return objects;
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
