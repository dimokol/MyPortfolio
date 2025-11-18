import * as THREE from 'three';

export default class InteractiveObjects {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;

    this.objects = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.createPortfolioObjects();
    this.setupInteraction();
  }

  createPortfolioObjects() {
    // Create portfolio showcase items scattered in the world
    const portfolioItems = [
      {
        title: 'Project 1',
        position: new THREE.Vector3(20, 3, 20),
        color: 0xff00ff,
        type: 'cube'
      },
      {
        title: 'Project 2',
        position: new THREE.Vector3(-25, 3, 15),
        color: 0x00ffff,
        type: 'sphere'
      },
      {
        title: 'Project 3',
        position: new THREE.Vector3(15, 4, -30),
        color: 0xffff00,
        type: 'torus'
      },
      {
        title: 'About Me',
        position: new THREE.Vector3(-20, 3, -25),
        color: 0xff6600,
        type: 'octahedron'
      },
      {
        title: 'Contact',
        position: new THREE.Vector3(30, 3, -15),
        color: 0x00ff88,
        type: 'dodecahedron'
      }
    ];

    portfolioItems.forEach(item => {
      const object = this.createInteractiveObject(item);
      this.objects.push(object);
    });
  }

  createInteractiveObject(data) {
    // Create geometry based on type
    let geometry;
    const size = 3;

    switch (data.type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(size, size, size);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(size / 2, 16, 16);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(size / 2, size / 6, 16, 32);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(size / 2);
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(size / 2);
        break;
      default:
        geometry = new THREE.BoxGeometry(size, size, size);
    }

    // Stylized material with glow
    const material = new THREE.MeshStandardMaterial({
      color: data.color,
      metalness: 0.7,
      roughness: 0.3,
      emissive: data.color,
      emissiveIntensity: 0.4,
      flatShading: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(data.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Create base platform
    const platformGeometry = new THREE.CylinderGeometry(size, size * 1.2, 0.5, 6);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      metalness: 0.8,
      roughness: 0.2,
      flatShading: true
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(data.position.x, 0.25, data.position.z);
    platform.castShadow = true;
    platform.receiveShadow = true;
    this.scene.add(platform);

    // Add rotating ring around object
    const ringGeometry = new THREE.TorusGeometry(size, 0.1, 8, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: data.color,
      metalness: 1.0,
      roughness: 0.0,
      emissive: data.color,
      emissiveIntensity: 0.8
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    mesh.add(ring);

    // Add point light
    const light = new THREE.PointLight(data.color, 2, 20);
    light.position.copy(data.position);
    light.position.y += size;
    this.scene.add(light);

    // Add text label (using canvas texture)
    const label = this.createTextLabel(data.title);
    label.position.set(data.position.x, data.position.y + size + 2, data.position.z);
    this.scene.add(label);

    return {
      mesh,
      platform,
      ring,
      light,
      label,
      data,
      baseY: data.position.y,
      rotation: Math.random() * Math.PI * 2,
      isHovered: false
    };
  }

  createTextLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    // Draw text
    context.fillStyle = '#ffffff';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 256, 64);

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(8, 2, 1);

    return sprite;
  }

  setupInteraction() {
    // Mouse move for hover detection
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Click handler
    window.addEventListener('click', () => {
      this.handleClick();
    });
  }

  handleClick() {
    this.raycaster.setFromCamera(this.mouse, this.experience.camera.instance);

    const meshes = this.objects.map(obj => obj.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const clickedObject = this.objects.find(obj => obj.mesh === intersects[0].object);
      if (clickedObject) {
        this.onObjectClick(clickedObject);
      }
    }
  }

  onObjectClick(object) {
    console.log('Clicked:', object.data.title);

    // Animate object
    const originalScale = object.mesh.scale.clone();
    object.mesh.scale.multiplyScalar(1.3);

    setTimeout(() => {
      object.mesh.scale.copy(originalScale);
    }, 200);

    // You can add UI panel showing project details here
    // For now, just log the interaction
    alert(`Portfolio Item: ${object.data.title}\n\nClick OK to close`);
  }

  update(deltaTime) {
    // Update hover detection
    this.raycaster.setFromCamera(this.mouse, this.experience.camera.instance);
    const meshes = this.objects.map(obj => obj.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    // Reset all hover states
    this.objects.forEach(obj => {
      obj.isHovered = false;
    });

    // Set hovered object
    if (intersects.length > 0) {
      const hoveredObject = this.objects.find(obj => obj.mesh === intersects[0].object);
      if (hoveredObject) {
        hoveredObject.isHovered = true;
      }
    }

    // Animate all objects
    this.objects.forEach((obj, index) => {
      // Floating animation
      const time = Date.now() * 0.001;
      obj.mesh.position.y = obj.baseY + Math.sin(time + index) * 0.5;

      // Rotation
      obj.rotation += deltaTime * 0.5;
      obj.mesh.rotation.y = obj.rotation;

      // Ring rotation
      if (obj.ring) {
        obj.ring.rotation.z += deltaTime * 2;
      }

      // Hover effect
      if (obj.isHovered) {
        obj.mesh.material.emissiveIntensity = 0.8;
        obj.light.intensity = 3;
        obj.label.material.opacity = 1;
        document.body.style.cursor = 'pointer';
      } else {
        obj.mesh.material.emissiveIntensity = 0.4;
        obj.light.intensity = 2;
        obj.label.material.opacity = 0.7;
      }
    });

    // Reset cursor if no objects hovered
    if (intersects.length === 0) {
      document.body.style.cursor = 'default';
    }
  }
}
