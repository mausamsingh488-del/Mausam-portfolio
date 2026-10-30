/**
 * Three.js 3D Bubble & Cartoon Solid Patterns Universe
 * Features:
 * - Buoyant floating bubble spheres with cartoon specular highlights
 * - 3D cartoon donuts (torus), stars, capsules in user color palette
 * - Interactive cursor repulsion with spring physics
 * - Click-to-spawn bouncing mini-bubbles and shockwaves
 * - High performance with auto-pause on scroll
 */

class Bubble3DWorld {
  constructor(canvasId = 'three-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.bubbles = [];
    this.miniBubbles = [];
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0, rayPos: new THREE.Vector3(0, 0, 0) };
    this.raycaster = new THREE.Raycaster();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.isVisible = true;
    this.clock = new THREE.Clock();

    // Palette requested by user
    this.palette = [
      0xFF2D95, // Hot Bubblegum Pink
      0x6F3DFF, // Electric Cartoon Violet
      0x007BA7, // Cerulean Cyan Blue
      0xBFE9FF, // Soft Sky Bubble Blue
      0xEAAA00, // Warm Marigold Yellow
      0x3A0F34, // Deep Plum
      0xE6E0F0, // Lavender Mist
      0xF3E6D7, // Warm Cream
      0x6F4E37  // Warm Clay
    ];

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded yet');
      return;
    }

    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera setup
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 16);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. Lighting
    this.setupLighting();

    // 5. Spawn floating 3D bubble universe
    this.createBubbleObjects();

    // 6. Event listeners
    this.setupEvents();

    // 7. Start render loop
    this.animate();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.4);
    mainLight.position.set(8, 12, 10);
    this.scene.add(mainLight);

    const pinkRim = new THREE.PointLight(0xFF2D95, 2.2, 30);
    pinkRim.position.set(-10, -5, 5);
    this.scene.add(pinkRim);

    const cyanRim = new THREE.PointLight(0x007BA7, 2.0, 30);
    cyanRim.position.set(10, 8, -2);
    this.scene.add(cyanRim);

    const purpleBottom = new THREE.PointLight(0x6F3DFF, 1.8, 30);
    purpleBottom.position.set(0, -12, 4);
    this.scene.add(purpleBottom);
  }

  // Create cartoon bubble material with high shine and cartoon glossy highlight
  createBubbleMaterial(colorHex, opacity = 0.88) {
    return new THREE.MeshPhysicalMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.08,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.45,
      transparent: true,
      opacity: opacity,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      ior: 1.4
    });
  }

  createBubbleObjects() {
    // 1. Primary Hero Bubbles (Interactive, big, bouncy)
    const bubbleConfigs = [
      { radius: 2.2, pos: [4.2, 1.2, 0], color: 0xFF2D95, speed: 0.8, type: 'sphere' },
      { radius: 1.8, pos: [-4.5, 2.2, -1], color: 0x6F3DFF, speed: 1.1, type: 'sphere' },
      { radius: 1.5, pos: [-3.8, -2.4, 1], color: 0x007BA7, speed: 0.9, type: 'sphere' },
      { radius: 1.3, pos: [4.8, -2.8, -0.5], color: 0xEAAA00, speed: 1.2, type: 'sphere' },
      { radius: 1.0, pos: [0.8, 3.8, -2], color: 0xBFE9FF, speed: 1.0, type: 'sphere' },
      { radius: 0.9, pos: [-1.2, -3.9, -1], color: 0xE6E0F0, speed: 1.3, type: 'sphere' },

      // Cartoon Donut (Torus) shapes
      { radius: 1.2, tube: 0.45, pos: [5.8, -0.2, -3], color: 0xFF2D95, speed: 0.7, type: 'torus' },
      { radius: 1.0, tube: 0.38, pos: [-5.6, -0.5, -2], color: 0xEAAA00, speed: 0.85, type: 'torus' },
      { radius: 0.8, tube: 0.32, pos: [2.5, 4.2, -4], color: 0x6F3DFF, speed: 0.9, type: 'torus' },

      // Bouncy Pill / Capsule shapes
      { radius: 0.6, length: 1.2, pos: [-2.5, 3.6, -3], color: 0x007BA7, speed: 1.1, type: 'capsule' },
      { radius: 0.5, length: 1.0, pos: [3.2, -4.2, -3], color: 0xFF2D95, speed: 1.0, type: 'capsule' }
    ];

    bubbleConfigs.forEach((cfg, idx) => {
      let geom;
      if (cfg.type === 'torus') {
        geom = new THREE.TorusGeometry(cfg.radius, cfg.tube, 24, 48);
      } else if (cfg.type === 'capsule') {
        geom = new THREE.CylinderGeometry(cfg.radius, cfg.radius, cfg.length, 24);
      } else {
        geom = new THREE.SphereGeometry(cfg.radius, 40, 40);
      }

      const mat = this.createBubbleMaterial(cfg.color);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(...cfg.pos);

      // Add cute cartoon highlight spot to spheres for that glossy anime/bubblegum look
      if (cfg.type === 'sphere') {
        const spotGeom = new THREE.SphereGeometry(cfg.radius * 0.22, 16, 16);
        const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
        const spotMesh = new THREE.Mesh(spotGeom, spotMat);
        spotMesh.position.set(cfg.radius * 0.5, cfg.radius * 0.55, cfg.radius * 0.58);
        mesh.add(spotMesh);

        // Second tiny secondary highlight
        const spot2Geom = new THREE.SphereGeometry(cfg.radius * 0.1, 12, 12);
        const spot2Mesh = new THREE.Mesh(spot2Geom, spotMat);
        spot2Mesh.position.set(cfg.radius * 0.68, cfg.radius * 0.32, cfg.radius * 0.55);
        mesh.add(spot2Mesh);
      }

      this.scene.add(mesh);

      this.bubbles.push({
        mesh: mesh,
        basePos: new THREE.Vector3(...cfg.pos),
        currentPos: new THREE.Vector3(...cfg.pos),
        velocity: new THREE.Vector3(0, 0, 0),
        radius: cfg.radius,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.015
        },
        speed: cfg.speed,
        phase: idx * 0.8
      });
    });

    // 2. Ambient background tiny star / sparkle bubbles
    const bgSphereGeom = new THREE.SphereGeometry(0.2, 16, 16);
    for (let i = 0; i < 28; i++) {
      const color = this.palette[i % this.palette.length];
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.3
      });
      const mini = new THREE.Mesh(bgSphereGeom, mat);
      const x = (Math.random() - 0.5) * 24;
      const y = (Math.random() - 0.5) * 16;
      const z = -2 - Math.random() * 8;
      const scale = 0.4 + Math.random() * 0.9;
      mini.scale.set(scale, scale, scale);
      mini.position.set(x, y, z);
      this.scene.add(mini);

      this.bubbles.push({
        mesh: mini,
        basePos: new THREE.Vector3(x, y, z),
        currentPos: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, 0, 0),
        radius: 0.2 * scale,
        rotSpeed: { x: 0.01, y: 0.01, z: 0 },
        speed: 0.5 + Math.random() * 0.8,
        phase: Math.random() * 10,
        isAmbient: true
      });
    }
  }

  setupEvents() {
    // Window resize
    window.addEventListener('resize', () => this.onResize());

    // Mouse movement
    window.addEventListener('pointermove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.targetY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    // Canvas click - spawn pop burst & ripple!
    this.canvas.addEventListener('pointerdown', (e) => {
      this.triggerClickBurst(e);
      if (window.sounds) {
        window.sounds.pop(480 + Math.random() * 200);
      }
    });

    // Intersection observer to pause rendering when canvas is out of view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(this.canvas);
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  triggerClickBurst(e) {
    const rect = this.canvas.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const intersectPoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.plane, intersectPoint);

    // Spawn 10 popping mini bubble sparks
    const burstCount = 12;
    for (let i = 0; i < burstCount; i++) {
      const geom = new THREE.SphereGeometry(0.12 + Math.random() * 0.14, 12, 12);
      const color = this.palette[Math.floor(Math.random() * this.palette.length)];
      const mat = new THREE.MeshBasicMaterial({ color: color });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(intersectPoint);
      this.scene.add(mesh);

      const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 3.5;
      this.miniBubbles.push({
        mesh: mesh,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 1.2,
        vz: (Math.random() - 0.5) * speed * 0.5,
        life: 1.0,
        decay: 1.8 + Math.random() * 0.8
      });
    }

    // Give nearby big bubbles a bouncy impulse
    this.bubbles.forEach(b => {
      const dist = b.currentPos.distanceTo(intersectPoint);
      if (dist < 5.0) {
        const force = (5.0 - dist) * 0.8;
        const dir = b.currentPos.clone().sub(intersectPoint).normalize();
        b.velocity.add(dir.multiplyScalar(force));
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.isVisible) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    // Raycast mouse to world plane (z = 0)
    this.raycaster.setFromCamera(new THREE.Vector2(this.mouse.x, this.mouse.y), this.camera);
    this.raycaster.ray.intersectPlane(this.plane, this.mouse.rayPos);

    // Camera subtle parallax
    this.camera.position.x = this.mouse.x * 0.8;
    this.camera.position.y = this.mouse.y * 0.6;
    this.camera.lookAt(0, 0, 0);

    // Update bubbles
    this.bubbles.forEach(b => {
      // 1. Natural buoyant floating
      const floatY = Math.sin(time * b.speed + b.phase) * 0.45;
      const floatX = Math.cos(time * b.speed * 0.7 + b.phase) * 0.35;

      const targetPos = b.basePos.clone().add(new THREE.Vector3(floatX, floatY, 0));

      // 2. Mouse repulsion (squishy bubble evasion)
      const distToMouse = b.currentPos.distanceTo(this.mouse.rayPos);
      const repulsionRadius = b.radius + 3.0;

      if (distToMouse < repulsionRadius && !b.isAmbient) {
        const repulsionStrength = (1 - distToMouse / repulsionRadius) * 2.8;
        const pushDir = b.currentPos.clone().sub(this.mouse.rayPos).normalize();
        b.velocity.add(pushDir.multiplyScalar(repulsionStrength * delta * 5));
      }

      // 3. Spring back to base position
      const springForce = targetPos.sub(b.currentPos).multiplyScalar(2.2);
      b.velocity.add(springForce.multiplyScalar(delta));

      // Damping
      b.velocity.multiplyScalar(0.92);

      // Integrate
      b.currentPos.add(b.velocity.clone().multiplyScalar(delta * 4));
      b.mesh.position.copy(b.currentPos);

      // Rotations
      b.mesh.rotation.x += b.rotSpeed.x;
      b.mesh.rotation.y += b.rotSpeed.y;
      b.mesh.rotation.z += b.rotSpeed.z;

      // Squishy scaling on velocity (stretch & squash)
      if (!b.isAmbient) {
        const speed = b.velocity.length();
        const stretch = 1 + Math.min(speed * 0.12, 0.25);
        const squash = 1 / Math.sqrt(stretch);
        b.mesh.scale.set(squash, stretch, squash);
      }
    });

    // Update mini popping bubbles
    for (let i = this.miniBubbles.length - 1; i >= 0; i--) {
      const mb = this.miniBubbles[i];
      mb.life -= mb.decay * delta;
      if (mb.life <= 0) {
        this.scene.remove(mb.mesh);
        mb.mesh.geometry.dispose();
        mb.mesh.material.dispose();
        this.miniBubbles.splice(i, 1);
        continue;
      }
      mb.mesh.position.x += mb.vx * delta;
      mb.mesh.position.y += mb.vy * delta;
      mb.mesh.position.z += mb.vz * delta;
      mb.vy -= 4.0 * delta; // gravity
      const s = mb.life;
      mb.mesh.scale.set(s, s, s);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Auto-initialize when DOM and Three.js are ready
window.addEventListener('DOMContentLoaded', () => {
  if (typeof THREE !== 'undefined') {
    window.bubbleWorld = new Bubble3DWorld('three-canvas');
  }
});
