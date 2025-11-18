import * as THREE from 'three';

export default class NightSky {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;

    // Star parameters
    this.starCount = 5000;
    this.shootingStars = [];
    this.shootingStarInterval = 5000; // ms between shooting stars
    this.lastShootingStar = 0;

    this.createStarfield();
    this.createMoon();
    this.createShootingStarSystem();
  }

  createStarfield() {
    // Create star geometry
    const starGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    // Generate stars in a sphere around the scene
    for (let i = 0; i < this.starCount; i++) {
      // Random position on sphere
      const radius = 300;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(radius * Math.cos(phi)); // Only above horizon
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions.push(x, y, z);

      // Star colors (white to blue-white)
      const temp = Math.random();
      const color = new THREE.Color();
      if (temp < 0.3) {
        color.setHex(0xaaccff); // Blue-white
      } else if (temp < 0.6) {
        color.setHex(0xffffff); // White
      } else {
        color.setHex(0xffffee); // Warm white
      }

      colors.push(color.r, color.g, color.b);

      // Random sizes
      const size = Math.random() * 2 + 0.5;
      sizes.push(size);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Star material with shader
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;

        attribute float size;
        attribute vec3 color;

        varying vec3 vColor;

        void main() {
          vColor = color;

          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;

          gl_Position = projectedPosition;

          // Twinkling effect
          float twinkle = sin(uTime * 2.0 + position.x * 100.0) * 0.3 + 0.7;
          gl_PointSize = size * twinkle * uPixelRatio;
          gl_PointSize *= (1.0 / -viewPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Circular star shape
          float distanceToCenter = length(gl_PointCoord - vec2(0.5));
          float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);

          // Add star glow
          float glow = 1.0 - smoothstep(0.0, 0.8, distanceToCenter);

          vec3 color = vColor * (strength + glow * 0.3);
          gl_FragColor = vec4(color, strength);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);
  }

  createMoon() {
    const moonGeometry = new THREE.SphereGeometry(8, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffee,
      emissive: 0xffffdd,
      emissiveIntensity: 0.8,
      roughness: 0.9,
      metalness: 0.0
    });

    this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
    this.moon.position.set(100, 150, -100);
    this.scene.add(this.moon);

    // Moon glow
    const glowGeometry = new THREE.SphereGeometry(12, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0xffffee) }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const moonGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    moonGlow.position.copy(this.moon.position);
    this.scene.add(moonGlow);
  }

  createShootingStarSystem() {
    // Shooting star geometry (trail)
    this.shootingStarGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(2 * 3); // Start and end point
    this.shootingStarGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.shootingStarMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      linewidth: 2
    });
  }

  createShootingStar() {
    // Random start position in the sky
    const startX = (Math.random() - 0.5) * 400;
    const startY = Math.random() * 100 + 150;
    const startZ = (Math.random() - 0.5) * 400;

    // Direction (downward and sideways)
    const dirX = (Math.random() - 0.5) * 2;
    const dirY = -Math.random() * 2 - 1;
    const dirZ = (Math.random() - 0.5) * 2;

    const length = 20;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      startX, startY, startZ,
      startX + dirX * length, startY + dirY * length, startZ + dirZ * length
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      linewidth: 3
    });

    const shootingStar = new THREE.Line(geometry, material);
    this.scene.add(shootingStar);

    const shootingStarData = {
      mesh: shootingStar,
      velocity: new THREE.Vector3(dirX * 2, dirY * 2, dirZ * 2),
      life: 1.0, // Fade over time
      positions: positions
    };

    this.shootingStars.push(shootingStarData);
  }

  update(elapsedTime) {
    // Update star twinkle
    if (this.starField) {
      this.starField.material.uniforms.uTime.value = elapsedTime;
    }

    // Create shooting stars periodically
    if (elapsedTime - this.lastShootingStar > this.shootingStarInterval / 1000) {
      this.createShootingStar();
      this.lastShootingStar = elapsedTime;
      // Random interval
      this.shootingStarInterval = Math.random() * 8000 + 3000;
    }

    // Update shooting stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];

      // Move
      const positions = star.positions;
      for (let j = 0; j < positions.length; j += 3) {
        positions[j] += star.velocity.x;
        positions[j + 1] += star.velocity.y;
        positions[j + 2] += star.velocity.z;
      }
      star.mesh.geometry.attributes.position.needsUpdate = true;

      // Fade
      star.life -= 0.02;
      star.mesh.material.opacity = star.life;

      // Remove if faded
      if (star.life <= 0) {
        this.scene.remove(star.mesh);
        star.mesh.geometry.dispose();
        star.mesh.material.dispose();
        this.shootingStars.splice(i, 1);
      }
    }

    // Slowly rotate moon
    if (this.moon) {
      this.moon.rotation.y = elapsedTime * 0.05;
    }
  }
}
