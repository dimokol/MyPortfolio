import { useEffect } from 'react';

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import SceneInit from './lib/SceneInit';

function App() {
  useEffect(() => {
    const test = new SceneInit('myThreeJsCanvas');
    test.initialize();
    test.animate();

    const axesHelper = new THREE.AxesHelper(8);
    test.scene.add(axesHelper);

    // const boxGeometry = new THREE.BoxGeometry(16, 16, 16);
    // const boxMaterial = new THREE.MeshNormalMaterial();
    // const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    // test.scene.add(boxMesh);

    const physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });

    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    physicsWorld.addBody(groundBody);

    const radius = 1;
    const sphereBody = new CANNON.Body({
      mass: 5,
      shape: new CANNON.Sphere(radius),
    });
    sphereBody.position.set(0, 7, 0);
    physicsWorld.addBody(sphereBody);
    
    const shpereGeometry = new THREE.SphereGeometry(radius);
    const shpereMaterial = new THREE.MeshNormalMaterial();
    const shpereMesh = new THREE.Mesh(shpereGeometry, shpereMaterial);
    test.scene.add(shpereMesh);

    const boxBody = new CANNON.Body({
      mass: 5,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
    });
    boxBody.position.set(1, 10, 0);
    physicsWorld.addBody(boxBody);

    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshNormalMaterial();
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    test.scene.add(boxMesh);
    
    const cannonDebugger = new CannonDebugger(test.scene, physicsWorld, {
      // color: 0xff0000,
    });
    
    const animate = () => {
      physicsWorld.fixedStep();
      cannonDebugger.update();
      shpereMesh.position.copy(sphereBody.position);
      shpereMesh.quaternion.copy(sphereBody.quaternion);
      boxMesh.position.copy(boxBody.position);
      boxMesh.quaternion.copy(boxBody.quaternion);
      window.requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <>
      <canvas id="myThreeJsCanvas" />
    </>
  );
}

export default App
