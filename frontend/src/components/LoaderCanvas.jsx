import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const LoaderCanvas = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
        camera.position.set(0, 50, 100);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(600, 600);
        renderer.setPixelRatio(window.devicePixelRatio);

        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        // Clock for smooth animations
        const clock = new THREE.Clock();

        // Star field background
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const starPositions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            starPositions[i] = (Math.random() - 0.5) * 500;
            starPositions[i + 1] = (Math.random() - 0.5) * 500;
            starPositions[i + 2] = (Math.random() - 0.5) * 500;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Sun
        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xfdb813,
            emissive: 0xfdb813,
            emissiveIntensity: 1
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sun);

        // Sun light
        const sunLight = new THREE.PointLight(0xffffff, 5, 500); // More intense
        sun.add(sunLight);

        // Planets data with real orbital periods (simplified)
        const planetsData = [
            { name: 'Mercury', radius: 2, distance: 15, color: 0x8c7853, speed: 4.74, size: 1.5 },
            { name: 'Venus', radius: 3.5, distance: 22, color: 0xffc649, speed: 3.50, size: 2 },
            { name: 'Earth', radius: 4, distance: 30, color: 0x4169e1, speed: 2.98, size: 2.2 },
            { name: 'Mars', radius: 3, distance: 38, color: 0xcd5c5c, speed: 2.41, size: 1.8 },
            { name: 'Jupiter', radius: 8, distance: 52, color: 0xdaa520, speed: 1.31, size: 4 },
            { name: 'Saturn', radius: 7, distance: 68, color: 0xf4a460, speed: 0.97, size: 3.5 },
        ];

        const planets = [];

        planetsData.forEach(data => {
            // Orbit path
            const orbitGeometry = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 128);
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.1
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            scene.add(orbit);

            // Planet
            const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
            const planetMaterial = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.7,
                metalness: 0.3
            });
            const planet = new THREE.Mesh(planetGeometry, planetMaterial);

            // Orbit group
            const orbitGroup = new THREE.Group();
            orbitGroup.add(planet);
            planet.position.x = data.distance;
            scene.add(orbitGroup);

            // Saturn rings
            if (data.name === 'Saturn') {
                const ringGeometry = new THREE.RingGeometry(data.size * 1.5, data.size * 2.5, 64);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0xc9b181,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.7
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2;
                planet.add(ring);
            }

            planets.push({
                mesh: planet,
                orbitGroup: orbitGroup,
                speed: data.speed,
                distance: data.distance
            });
        });

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        // Comet
        const cometGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const cometMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const comet = new THREE.Mesh(cometGeometry, cometMaterial);

        // Comet tail
        const tailGeometry = new THREE.ConeGeometry(0.3, 8, 8);
        const tailMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.rotation.x = Math.PI / 2;
        tail.position.z = -4;
        comet.add(tail);

        const cometOrbit = new THREE.Group();
        cometOrbit.add(comet);
        comet.position.x = 80;
        scene.add(cometOrbit);

        // Animation
        const animate = () => {
            requestAnimationFrame(animate);

            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            // Rotate sun
            sun.rotation.y += delta * 0.1;

            // Rotate planets
            planets.forEach(planet => {
                planet.orbitGroup.rotation.y += delta * planet.speed * 0.01;
                planet.mesh.rotation.y += delta * 0.5;
            });

            // Comet orbit
            cometOrbit.rotation.y += delta * 0.5;
            cometOrbit.rotation.x = Math.sin(elapsed * 0.3) * 0.3;

            // Slowly rotate camera
            camera.position.x = Math.sin(elapsed * 0.1) * 100;
            camera.position.z = Math.cos(elapsed * 0.1) * 100;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            // Cleanup
            renderer.dispose();
            starGeometry.dispose();
            starMaterial.dispose();
            if (mountRef.current) {
                mountRef.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="loader-3d-canvas"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        />
    );
};

export default LoaderCanvas;
