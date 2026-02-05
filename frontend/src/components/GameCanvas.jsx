import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { solarSystemPlanets } from '../gameData';

const GameCanvas = ({ gameState, setGameState, currentPlanetIndex, onPackageCollect, robotLevel, meteorShower, ufoEvent, setUfoEvent, cosmicStorm }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const planetRef = useRef(null);
    const packagesRef = useRef([]);
    const starsRef = useRef(null);
    const cameraRef = useRef(null);
    const meteorsRef = useRef([]);
    const shakeRef = useRef({ intensity: 0, decay: 0 });
    const ufoRef = useRef(null);
    const cameraAnimationRef = useRef({ isAnimating: false, stages: [], currentStage: 0, stageStartTime: 0 });
    const moonsRef = useRef([]);
    const rendererRef = useRef(null);
    const planetIndexRef = useRef(currentPlanetIndex);

    useEffect(() => {
        planetIndexRef.current = currentPlanetIndex;
    }, [currentPlanetIndex]);

    /* Autonomous collection logic for drone-assisted gathering */
    useEffect(() => {
        if (robotLevel <= 0) return;
        const interval = setInterval(() => {
            const count = Math.min(packagesRef.current.length, robotLevel);
            for (let i = 0; i < count; i++) {
                const pkg = packagesRef.current[i];
                if (pkg && !pkg.userData.beingCollected) {
                    pkg.userData.beingCollected = true;
                    pkg.scale.set(0, 0, 0);
                    sceneRef.current.remove(pkg);
                    packagesRef.current = packagesRef.current.filter(p => p !== pkg);
                    if (onPackageCollect) onPackageCollect(pkg.userData);
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [robotLevel, onPackageCollect]);

    useEffect(() => {
        /* Scene Initialization */
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 1, 5);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        rendererRef.current = renderer;

        if (mountRef.current) {
            mountRef.current.innerHTML = '';
            mountRef.current.appendChild(renderer.domElement);
        }

        // Handle window resize - responsive canvas
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        /* Lighting Architecture */
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        /* Primary Stellar Illumination */
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
        sunLight.position.set(10, 2, 5);
        scene.add(sunLight);

        /* Reactive Rim and Accent Lighting */
        const rimLight = new THREE.PointLight(0x00d4ff, 1.2, 50);
        rimLight.position.set(-10, -5, -5);
        scene.add(rimLight);

        const accentLight = new THREE.PointLight(0x00d4ff, 1.0, 20);
        accentLight.position.set(-5, 0, 5);
        scene.add(accentLight);

        // Stars
        const starGeo = new THREE.BufferGeometry();
        const starCount = 1000;
        const posArray = new Float32Array(starCount * 3);
        const colorsArray = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 50;
            posArray[i + 1] = (Math.random() - 0.5) * 50;
            posArray[i + 2] = (Math.random() - 0.5) * 50; // Deep space

            const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.8);
            colorsArray[i] = color.r;
            colorsArray[i + 1] = color.g;
            colorsArray[i + 2] = color.b;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
        const starMat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);
        starsRef.current = stars;

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);

            /* Celestial Motion - Halved Speed */
            if (planetRef.current) {
                planetRef.current.rotation.y += 0.001;
            }

            /* Orbital Satellite Mechanics */
            moonsRef.current.forEach(moon => {
                moon.angle += moon.speed;
                moon.mesh.position.x = Math.cos(moon.angle) * moon.distance;
                moon.mesh.position.z = Math.sin(moon.angle) * moon.distance;
                moon.mesh.rotation.y += 0.005;
            });

            if (starsRef.current) {
                starsRef.current.rotation.y -= 0.0001;
            }

            /* Dynamic Camera Shake */
            if (shakeRef.current.intensity > 0.01) {
                camera.position.x += (Math.random() - 0.5) * shakeRef.current.intensity;
                camera.position.y += (Math.random() - 0.5) * shakeRef.current.intensity;
                camera.position.z += (Math.random() - 0.5) * shakeRef.current.intensity;
                shakeRef.current.intensity *= shakeRef.current.decay;
            }

            // Camera Animation
            if (cameraAnimationRef.current.isAnimating) {
                const stage = cameraAnimationRef.current.stages[cameraAnimationRef.current.currentStage];
                if (stage) {
                    const elapsed = performance.now() - cameraAnimationRef.current.stageStartTime;
                    const t = Math.min(elapsed / stage.duration, 1);
                    const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
                    camera.position.lerpVectors(cameraAnimationRef.current.currentStage === 0 ? camera.position.clone() : cameraAnimationRef.current.stages[cameraAnimationRef.current.currentStage - 1].position, stage.position, easedT);

                    if (t >= 1) {
                        cameraAnimationRef.current.currentStage++;
                        cameraAnimationRef.current.stageStartTime = performance.now();
                        if (cameraAnimationRef.current.currentStage >= cameraAnimationRef.current.stages.length) {
                            cameraAnimationRef.current.isAnimating = false;
                        }
                    }
                }
            }

            camera.lookAt(0, 0, 0);

            // Animate Meteors
            meteorsRef.current.forEach(meteor => {
                meteor.position.add(meteor.userData.velocity);
                meteor.rotation.x += meteor.userData.rotationSpeed.x;
                meteor.rotation.y += meteor.userData.rotationSpeed.y;
                meteor.rotation.z += meteor.userData.rotationSpeed.z;

                // Update trail
                if (meteor.userData.trail) {
                    meteor.userData.trail.position.lerp(meteor.position.clone().add(new THREE.Vector3(0, 0.3, 0)), 0.1);
                    meteor.userData.trail.material.opacity *= 0.95; // Fade out
                }

                // Remove if below ground
                if (meteor.position.y < -3) {
                    // Create impact flash
                    const flash = new THREE.Mesh(
                        new THREE.SphereGeometry(0.2, 8, 8),
                        new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 1 })
                    );
                    flash.position.copy(meteor.position);
                    flash.position.y = -2.5;
                    scene.add(flash);

                    // Animate flash
                    let flashOpacity = 1;
                    const flashInterval = setInterval(() => {
                        flashOpacity -= 0.1;
                        flash.material.opacity = flashOpacity;
                        flash.scale.multiplyScalar(1.1);
                        if (flashOpacity <= 0) {
                            scene.remove(flash);
                            clearInterval(flashInterval);
                        }
                    }, 50);

                    scene.remove(meteor);
                    if (meteor.userData.trail) scene.remove(meteor.userData.trail);
                }
            });
            meteorsRef.current = meteorsRef.current.filter(m => m.position.y >= -3);

            // Animate UFO
            if (ufoRef.current) {
                const ufo = ufoRef.current;
                const time = Date.now() * 0.001; // seconds

                if (ufo.userData.phase === 'approach') {
                    // Move towards planet
                    ufo.position.lerp(new THREE.Vector3(5, 5, 0), 0.01);  // Reduced from 0.02
                    ufo.rotation.y += 0.02;
                    if (ufo.position.distanceTo(new THREE.Vector3(5, 5, 0)) < 0.5) {
                        ufo.userData.phase = 'circle';
                        ufo.userData.startTime = time;
                    }
                } else if (ufo.userData.phase === 'circle') {
                    // Circle around planet
                    ufo.userData.angle += ufo.userData.speed;
                    ufo.position.x = Math.cos(ufo.userData.angle) * 6;
                    ufo.position.z = Math.sin(ufo.userData.angle) * 6;
                    ufo.position.y = 5 + Math.sin(time * 2) * 0.5; // Bob up and down
                    ufo.rotation.y += 0.05;

                    // Check for steal after 2 seconds of circling
                    if (time - ufo.userData.startTime > 2 && !ufo.userData.stoleChecked) {
                        ufo.userData.stoleChecked = true;
                        if (packagesRef.current.length > 0) {
                            // Steal all packages
                            packagesRef.current.forEach(pkg => {
                                // Create beam effect
                                const beam = new THREE.Mesh(
                                    new THREE.CylinderGeometry(0.05, 0.05, pkg.position.distanceTo(ufo.position), 8),
                                    new THREE.MeshBasicMaterial({ color: 0x00FFFF, transparent: true, opacity: 0.8, emissive: 0x004444 })
                                );
                                beam.position.copy(pkg.position.clone().add(ufo.position).multiplyScalar(0.5));
                                beam.lookAt(ufo.position);
                                scene.add(beam);

                                // Animate package flying to UFO
                                let flyProgress = 0;
                                const flyInterval = setInterval(() => {
                                    flyProgress += 0.05;
                                    pkg.position.lerp(ufo.position, flyProgress);
                                    pkg.scale.multiplyScalar(0.95);
                                    if (flyProgress >= 1) {
                                        clearInterval(flyInterval);
                                        scene.remove(pkg);
                                        scene.remove(beam);
                                    }
                                }, 50);
                            });
                            packagesRef.current = [];
                            setUfoEvent(prev => ({ ...prev, stolePackages: true }));
                        }
                    }

                    // After 6 seconds, depart
                    if (time - ufo.userData.startTime > 6) {
                        ufo.userData.phase = 'depart';
                    }
                } else if (ufo.userData.phase === 'depart') {
                    // Fly away
                    ufo.position.lerp(new THREE.Vector3(-15, 10, 0), 0.015);  // Reduced from 0.03
                    ufo.rotation.y += 0.02;
                    if (ufo.position.x < -10) {
                        // End event
                        setUfoEvent(prev => ({ ...prev, active: false }));
                    }
                }
            }
            packagesRef.current.forEach(pkg => {
                if (pkg.userData.beingCollected) {
                    // Fly to planet center
                    pkg.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
                    pkg.scale.multiplyScalar(0.9);

                    if (pkg.scale.x < 0.1) { // If package is very small, remove it
                        scene.remove(pkg);
                        packagesRef.current = packagesRef.current.filter(p => p !== pkg);
                        if (onPackageCollect) onPackageCollect(pkg.userData);
                    }
                } else {
                    // Orbit
                    pkg.userData.angle += pkg.userData.speed;
                    pkg.position.x = Math.cos(pkg.userData.angle) * pkg.userData.radius;
                    pkg.position.z = Math.sin(pkg.userData.angle) * pkg.userData.radius;
                    pkg.position.y = pkg.userData.yOffset + Math.sin(Date.now() * 0.001 + pkg.userData.angle) * 0.2;

                    // Rotate
                    pkg.rotation.x += pkg.userData.rotSpeed.x;
                    pkg.rotation.y += pkg.userData.rotSpeed.y;

                    // Internal core spin
                    const core = pkg.getObjectByName('core');
                    if (core) core.rotation.z += 0.1;
                }
            });

            // Animate Drones
            if (scene.userData.drones) {
                scene.userData.drones.forEach((drone, i) => {
                    drone.userData.angle += drone.userData.speed;
                    drone.position.x = Math.cos(drone.userData.angle) * drone.userData.distance;
                    drone.position.z = Math.sin(drone.userData.angle) * drone.userData.distance;
                    drone.position.y = Math.sin(drone.userData.angle * 2) * 0.2;
                    drone.lookAt(0, 0, 0);
                });
            }

            renderer.render(scene, camera);
        };
        animate();

        // Drone Management
        if (!scene.userData.drones) scene.userData.drones = [];

        // Sync drones with robotLevel
        const currentDrones = scene.userData.drones.length;
        // Limit max visual drones to avoid clutter, e.g., 10
        const targetDrones = Math.min(robotLevel, 10);

        if (currentDrones < targetDrones) {
            for (let i = currentDrones; i < targetDrones; i++) {
                const droneGroup = new THREE.Group();

                // Simple Drone Geometry
                const body = new THREE.Mesh(
                    new THREE.BoxGeometry(0.1, 0.05, 0.1),
                    new THREE.MeshBasicMaterial({ color: 0x00D4FF })
                );
                droneGroup.add(body);

                // Wings
                const wing = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.3, 0.05),
                    new THREE.MeshBasicMaterial({ color: 0x00D4FF, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
                );
                wing.rotation.x = Math.PI / 2;
                droneGroup.add(wing);

                droneGroup.userData = {
                    angle: (i / targetDrones) * Math.PI * 2,
                    distance: 2.5 + Math.random() * 1.0 + (solarSystemPlanets[planetIndexRef.current].scale || 1.0),
                    speed: 0.01 + Math.random() * 0.01
                };

                scene.add(droneGroup);
                scene.userData.drones.push(droneGroup);
            }
        }


        // Helper to create a detailed 3D package
        // Helper to create a detailed 3D package (Quantum Hex-Pod)
        const createRealisticPackageMesh = (color) => {
            const group = new THREE.Group();

            // 1. Glowing Core (Energy Sphere)
            const coreGeo = new THREE.IcosahedronGeometry(0.12, 1);
            const coreMat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 3,
                transparent: true,
                opacity: 0.9
            });
            const core = new THREE.Mesh(coreGeo, coreMat);
            core.name = 'core';
            group.add(core);

            // 2. Structural Frame (Tech Shell)
            const frameGeo = new THREE.IcosahedronGeometry(0.2, 0);
            const frameMat = new THREE.MeshStandardMaterial({
                color: 0x666666,
                metalness: 1,
                roughness: 0.2,
                wireframe: true
            });
            const frame = new THREE.Mesh(frameGeo, frameMat);
            group.add(frame);

            // 3. Side Wings / Panels
            const wingGeo = new THREE.BoxGeometry(0.25, 0.05, 0.01);
            const wingMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
            for (let i = 0; i < 3; i++) {
                const wing = new THREE.Mesh(wingGeo, wingMat);
                wing.rotation.y = (i / 3) * Math.PI * 2;
                group.add(wing);
            }

            return group;
        };

        // Expose helper functions globally
        window.collectAllPackages = () => {
            const currentPackages = [...packagesRef.current];
            currentPackages.forEach((pkg, index) => {
                setTimeout(() => {
                    if (pkg.userData && !pkg.userData.beingCollected) {
                        pkg.userData.beingCollected = true;
                    }
                }, index * 100);
            });
            return currentPackages.length;
        };

        window.spawnPackage = (forceRare = false) => {
            const planetData = solarSystemPlanets[planetIndexRef.current];

            // Package Types
            const types = [
                { color: 0x8B4513, value: 10, rarity: 'common' }, // Mineral
                { color: 0x228B22, value: 15, rarity: 'common' }, // Bio
                { color: 0x1E90FF, value: 20, rarity: 'common' }, // Atmos
                { color: 0xFFD700, value: 50, rarity: 'rare' },   // Gold
                { color: 0x9400D3, value: 80, rarity: 'rare' },   // Artifact
                { color: 0xFF1493, value: 200, rarity: 'legendary' }, // Quantum
                { color: 0x00FFFF, value: 500, rarity: 'legendary' }  // Dark Matter
            ];

            let type;
            if (forceRare) {
                type = types.filter(t => t.rarity === 'legendary')[Math.floor(Math.random() * 2)];
            } else {
                const rand = Math.random();
                if (rand < 0.05) type = types.filter(t => t.rarity === 'legendary')[Math.floor(Math.random() * 2)];
                else if (rand < 0.2) type = types.filter(t => t.rarity === 'rare')[Math.floor(Math.random() * 2)];
                else type = types.filter(t => t.rarity === 'common')[Math.floor(Math.random() * 3)];
            }

            const pkg = createRealisticPackageMesh(type.color);

            // Dynamic radius based on planet scale to avoid spawning inside
            const planetVisualScale = 1.5 * (planetData.scale || 1.0);
            const angle = Math.random() * Math.PI * 2;
            const radius = planetVisualScale + 0.8 + (Math.random() * 0.6);
            const yOffset = (Math.random() - 0.5) * planetVisualScale;
            pkg.position.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius);

            // Animation data
            pkg.userData = {
                type: 'package',
                value: type.value,
                isRare: type.rarity !== 'common',
                angle: angle,
                radius: radius,
                yOffset: yOffset,
                speed: 0.002 + Math.random() * 0.003, // Reduced speed
                rotSpeed: { x: Math.random() * 0.02, y: Math.random() * 0.02 }
            };

            scene.add(pkg);
            packagesRef.current.push(pkg);

            // Spawn animation
            pkg.scale.set(0, 0, 0);
            let s = 0;
            const spawnInt = setInterval(() => {
                s += 0.1;
                pkg.scale.set(s, s, s);
                if (s >= 1) clearInterval(spawnInt);
            }, 30);

            // Auto-remove
            setTimeout(() => {
                if (packagesRef.current.includes(pkg)) {
                    scene.remove(pkg);
                    packagesRef.current = packagesRef.current.filter(p => p !== pkg);
                }
            }, 15000);
        };

        // Click Handler
        const handleClick = (event) => {
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            // Use recursive check (true) to find children meshes inside package groups
            const intersects = raycaster.intersectObjects(packagesRef.current, true);
            if (intersects.length > 0) {
                // Find the top-level package group from the intersected child
                let packageObj = intersects[0].object;
                while (packageObj.parent && !packagesRef.current.includes(packageObj)) {
                    packageObj = packageObj.parent;
                }

                if (packagesRef.current.includes(packageObj)) {
                    // Visual feedback
                    packageObj.scale.set(1.5, 1.5, 1.5);
                    setTimeout(() => {
                        scene.remove(packageObj);
                        packagesRef.current = packagesRef.current.filter(p => p !== packageObj);
                        if (onPackageCollect) onPackageCollect(packageObj.userData);
                    }, 100);
                }
            }
        };
        renderer.domElement.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            renderer.domElement.removeEventListener('click', handleClick);
            if (mountRef.current) mountRef.current.innerHTML = '';
            delete window.spawnPackage;
            delete window.collectAllPackages;
            renderer.dispose();
        };
    }, []);

    // Meteor Shower Effect
    useEffect(() => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;

        if (meteorShower.active) {
            // Start camera shake
            shakeRef.current = { intensity: 0.5, decay: 0.95 };

            // Create meteors
            const meteorCount = 50;
            const meteors = [];

            for (let i = 0; i < meteorCount; i++) {
                const size = 0.02 + Math.random() * 0.08; // Random size 0.02 to 0.1
                const meteor = new THREE.Mesh(
                    new THREE.SphereGeometry(size, 8, 8),
                    new THREE.MeshStandardMaterial({
                        color: new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 1, 0.5 + Math.random() * 0.3), // Orange to red hues
                        emissive: 0x441100,
                        emissiveIntensity: 0.5
                    })
                );

                // Random start position above
                meteor.position.set(
                    (Math.random() - 0.5) * 25,
                    12 + Math.random() * 8,
                    (Math.random() - 0.5) * 25
                );

                // Random velocity towards planet
                const speed = 0.15 + Math.random() * 0.1;
                meteor.userData = {
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.05,
                        -speed,
                        (Math.random() - 0.5) * 0.05
                    ),
                    rotationSpeed: {
                        x: (Math.random() - 0.5) * 0.2,
                        y: (Math.random() - 0.5) * 0.2,
                        z: (Math.random() - 0.5) * 0.2
                    }
                };

                // Add trail
                const trail = new THREE.Mesh(
                    new THREE.SphereGeometry(size * 0.5, 6, 6),
                    new THREE.MeshBasicMaterial({
                        color: 0xFF6600,
                        transparent: true,
                        opacity: 0.3
                    })
                );
                trail.position.copy(meteor.position);
                trail.position.y += 0.2; // Slightly behind
                meteor.userData.trail = trail;
                scene.add(trail);

                scene.add(meteor);
                meteors.push(meteor);
            }

            meteorsRef.current = meteors;

            return () => {
                meteors.forEach(meteor => {
                    scene.remove(meteor);
                    if (meteor.userData.trail) scene.remove(meteor.userData.trail);
                });
                meteorsRef.current = [];
            };
        } else {
            // Clean up
            meteorsRef.current.forEach(meteor => {
                scene.remove(meteor);
                if (meteor.userData.trail) scene.remove(meteor.userData.trail);
            });
            meteorsRef.current = [];
        }
    }, [meteorShower.active]);

    // UFO Event
    useEffect(() => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;

        if (ufoEvent.active) {
            // Create UFO
            const ufoGroup = new THREE.Group();

            // Main body (saucer)
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16),
                new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.8, roughness: 0.2 })
            );
            ufoGroup.add(body);

            // Dome
            const dome = new THREE.Mesh(
                new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
                new THREE.MeshStandardMaterial({ color: 0x00FFFF, transparent: true, opacity: 0.7, emissive: 0x002222 })
            );
            dome.position.y = 0.2;
            ufoGroup.add(dome);

            // Lights
            for (let i = 0; i < 8; i++) {
                const light = new THREE.Mesh(
                    new THREE.SphereGeometry(0.05, 8, 8),
                    new THREE.MeshBasicMaterial({ color: 0x00FF00, emissive: 0x00FF00 })
                );
                const angle = (i / 8) * Math.PI * 2;
                light.position.set(Math.cos(angle) * 0.7, 0, Math.sin(angle) * 0.7);
                ufoGroup.add(light);
            }

            // Start position
            ufoGroup.position.set(15, 8, 0);
            ufoGroup.userData = {
                phase: 'approach', // approach, circle, steal, depart
                angle: 0,
                speed: 0.02  // Reduced from 0.05
            };

            scene.add(ufoGroup);
            ufoRef.current = ufoGroup;

            // Check for packages at start
            const hasPackages = packagesRef.current.length > 0;

            return () => {
                if (ufoRef.current) {
                    scene.remove(ufoRef.current);
                    ufoRef.current = null;
                }
            };
        } else {
            if (ufoRef.current) {
                scene.remove(ufoRef.current);
                ufoRef.current = null;
            }
        }
    }, [ufoEvent.active]);

    // Cosmic Storm Effect
    useEffect(() => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;

        if (cosmicStorm.active) {
            // Add lightning flashes
            const lightningInterval = setInterval(() => {
                if (Math.random() < 0.3) { // 30% chance per second
                    // Create lightning flash
                    const flash = new THREE.AmbientLight(0xffffff, 2);
                    scene.add(flash);
                    setTimeout(() => scene.remove(flash), 100);
                }
            }, 1000);

            return () => clearInterval(lightningInterval);
        }
    }, [cosmicStorm.active]);

    // Update Planet when index changes
    useEffect(() => {
        if (!sceneRef.current) return;

        if (planetRef.current) {
            sceneRef.current.remove(planetRef.current);
        }

        const data = solarSystemPlanets[currentPlanetIndex];
        // Use realistic scale multiplier or keep standard 1.5 with relative scale
        const visualScale = 1.5 * (data.scale || 1.0);
        const geometry = new THREE.SphereGeometry(visualScale, 64, 64);

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous'); // Vital for external textures

        // Load texture or fallback
        let texture = null;
        let normalMap = null;

        if (data.texture) {
            texture = loader.load(data.texture,
                (tex) => {
                    console.log(`Texture loaded for ${data.name}`);
                    tex.needsUpdate = true;
                },
                undefined,
                (err) => console.error(`Error loading texture for ${data.name}`, err)
            );
        }

        if (data.normalMap) {
            normalMap = loader.load(data.normalMap);
        }

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(1.0, 1.0),
            color: texture ? 0xffffff : data.color,
            roughness: 0.7,
            metalness: 0.2, // Lower metalness helps textures pop under area lights
            emissive: texture ? 0x222222 : data.color, // Subtle bake-in glow
            emissiveIntensity: 1.5
        });

        const planet = new THREE.Mesh(geometry, material);
        planet.name = 'planet';

        // Rings for Saturn-like planets
        if (data.hasRings) {
            // Create alpha map for outer rings
            const createRingAlpha = (innerOpacity, outerOpacity) => {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');

                const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
                gradient.addColorStop(0, `rgba(255,255,255,${innerOpacity})`);
                gradient.addColorStop(0.3, `rgba(255,255,255,${outerOpacity})`);
                gradient.addColorStop(0.7, `rgba(255,255,255,${outerOpacity})`);
                gradient.addColorStop(1, `rgba(255,255,255,${innerOpacity})`);

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 512, 512);

                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
                return texture;
            };

            // Ring C (inner, faint)
            const ringCGeo = new THREE.RingGeometry(visualScale * 1.2, visualScale * 1.5, 64);
            const ringCMat = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            });
            const ringC = new THREE.Mesh(ringCGeo, ringCMat);
            ringC.rotation.x = Math.PI / 2;
            planet.add(ringC);

            // Ring B (main, bright)
            const ringBGeo = new THREE.RingGeometry(visualScale * 1.5, visualScale * 2.0, 128);
            const ringBMat = new THREE.MeshStandardMaterial({
                color: 0xF5F5DC,
                alphaMap: createRingAlpha(0.1, 0.9),
                transparent: true,
                side: THREE.DoubleSide,
                opacity: 0.8
            });
            const ringB = new THREE.Mesh(ringBGeo, ringBMat);
            ringB.rotation.x = Math.PI / 2;
            planet.add(ringB);

            // Ring A (outer, with Cassini division)
            const ringAGeo = new THREE.RingGeometry(visualScale * 2.0, visualScale * 2.5, 128);
            const ringAMat = new THREE.MeshStandardMaterial({
                color: 0xE6E6FA,
                alphaMap: createRingAlpha(0.2, 0.7),
                transparent: true,
                side: THREE.DoubleSide,
                opacity: 0.6
            });
            const ringA = new THREE.Mesh(ringAGeo, ringAMat);
            ringA.rotation.x = Math.PI / 2;
            planet.add(ringA);
        }

        // Add atmospheric glow for all planets
        const atmosphereGeo = new THREE.SphereGeometry(visualScale * 1.05, 64, 64);
        const atmosphereMat = new THREE.MeshStandardMaterial({
            color: data.atmosphereColor || 0x4da6ff,
            transparent: true,
            opacity: 0.3,
            emissive: data.atmosphereColor || 0x4da6ff,
            emissiveIntensity: 0.8,
            side: THREE.BackSide // Render from inside
        });
        const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
        atmosphere.name = 'atmosphere';
        planet.add(atmosphere);

        sceneRef.current.add(planet);
        planetRef.current = planet;

        // Moons
        moonsRef.current.forEach(moon => {
            sceneRef.current.remove(moon.mesh);
        });
        moonsRef.current = [];

        if (data.moons) {
            data.moons.forEach((moonData, index) => {
                const moonGeo = new THREE.SphereGeometry(moonData.size, 32, 32);
                const moonMat = new THREE.MeshStandardMaterial({ color: moonData.color });
                if (moonData.texture) {
                    const moonTexture = loader.load(moonData.texture);
                    moonMat.map = moonTexture;
                }
                const moonMesh = new THREE.Mesh(moonGeo, moonMat);
                moonMesh.position.set(moonData.distance, 0, 0);
                sceneRef.current.add(moonMesh);
                moonsRef.current.push({
                    mesh: moonMesh,
                    distance: moonData.distance,
                    angle: (index / data.moons.length) * Math.PI * 2,
                    speed: 0.005 + Math.random() * 0.0025 /* Halved orbital speed */
                });
            });
        }

        // Dynamic Camera Distance
        if (cameraRef.current) {
            const targetZ = data.cameraDistance || 15;
            const targetY = visualScale * 1.5;
            const farZ = 50; // Distance for "flying away"

            if (!cameraAnimationRef.current.isAnimating) {
                const startPos = cameraRef.current.position.clone();
                cameraAnimationRef.current.stages = [
                    { position: new THREE.Vector3(0, startPos.y, farZ), duration: 1000 }, // Fly back
                    { position: new THREE.Vector3(0, targetY, farZ), duration: 1000 }, // Move to new Y
                    { position: new THREE.Vector3(0, targetY, targetZ), duration: 1000 }  // Approach planet
                ];
                cameraAnimationRef.current.currentStage = 0;
                cameraAnimationRef.current.stageStartTime = performance.now();
                cameraAnimationRef.current.isAnimating = true;
            }
        }
        // Update existing drones distance to clear new planet
        if (sceneRef.current.userData.drones) {
            sceneRef.current.userData.drones.forEach(drone => {
                drone.userData.distance = 2.5 + Math.random() * 1.0 + (data.scale || 1.0);
            });
        }

    }, [currentPlanetIndex]);

    return <div ref={mountRef} className="game-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />;
};

export default GameCanvas;
