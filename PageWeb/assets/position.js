/*
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';


// Initialisation de la scène
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('model-container').appendChild(renderer.domElement);

// Ajouter une lumière ambiante
const light = new THREE.AmbientLight(0x404040, 5); // Lumière ambiante
scene.add(light);

// Charger le modèle GLB
const loader = new THREE.GLTFLoader();
loader.load('./arbre/2025_11_05__12_23_tree_0.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Calculer et afficher les informations du modèle
    model.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry;
            const vertices = geometry.attributes.position.array;

            // Calculer le centre de la géométrie
            const boundingBox = new THREE.Box3().setFromObject(child);
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);

            // Calculer le barycentre (moyenne des coordonnées des sommets)
            let sumX = 0, sumY = 0, sumZ = 0;
            let numVertices = vertices.length / 3; // Trois coordonnées par sommet

            for (let i = 0; i < vertices.length; i += 3) {
                sumX += vertices[i];
                sumY += vertices[i + 1];
                sumZ += vertices[i + 2];
            }

            const barycenter = new THREE.Vector3(
                sumX / numVertices,
                sumY / numVertices,
                sumZ / numVertices
            );

            // Afficher les informations dans l'interface
            document.getElementById('model-name').textContent = `Nom du modèle : ${child.name}`;
            document.getElementById('center').textContent = `Centre : (${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})`;
            document.getElementById('barycenter').textContent = `Barycentre : (${barycenter.x.toFixed(2)}, ${barycenter.y.toFixed(2)}, ${barycenter.z.toFixed(2)})`;
        }
    });

    // Positionner la caméra
    camera.position.z = 5;

    // Fonction d'animation
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}, undefined, (error) => {
    console.error('Erreur de chargement du modèle GLB :', error);
});

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

















    // Fonction d'exportation avec GLTFExporter
const exportButton = document.getElementById('export-button');

exportButton.addEventListener('click', () => {
    const exporter = new GLTFExporter(); // GLTFExporter n'est pas un constructeur, il faut l'utiliser de cette manière
    ///const exporter = new GLTFExporter();
    

    const options = {
        binary: true, // Exporter en binaire .glb
    };

    // Exportation de la scène (ajoute tes objets comme la sphère ici)
    exporter.parse(scene, function (result) {
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        // Créer un lien de téléchargement et le simuler
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modified_model.glb'; // Nom du fichier exporté
        a.click();

        // Libérer l'URL après le téléchargement
        URL.revokeObjectURL(url);
    }, options);
});


*/


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('model-container').appendChild(renderer.domElement);

// Ajouter une lumière ambiante
const light = new THREE.AmbientLight(0x404040, 5); // Lumière ambiante
scene.add(light);

// Charger le modèle GLB
const loader = new THREE.GLTFLoader();
loader.load('./arbre/2025_11_05__13_20_tree_0.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Variables pour calculer le barycentre des points Y == 0
    let sumX = 0, sumY = 0, sumZ = 0;
    let count = 0;

    // Parcourir la géométrie du modèle
    model.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry;
            const vertices = geometry.attributes.position.array;

            // Parcourir les sommets de la géométrie pour calculer le barycentre des points Y == 0
            for (let i = 0; i < vertices.length; i += 3) {
                const x = vertices[i];
                const y = vertices[i + 1];
                const z = vertices[i + 2];

                // Si l'altitude (coordonnée Y) est proche de 0 (dans une petite tolérance)
                if (Math.abs(y) < 0.01) {
                    sumX += x;
                    sumY += y;
                    sumZ += z;
                    count++;
                }
            }
        }
    });

    // Calculer le barycentre si des points ont été trouvés
    if (count > 0) {
        const barycenter = new THREE.Vector3(
            sumX / count,
            sumY / count,
            sumZ / count
        );

        // Afficher le barycentre dans la console
        console.log('Barycentre des points avec Y proche de 0:', barycenter);
        document.getElementById('barycenter').textContent = `Barycentre : (${barycenter.x.toFixed(2)}, ${barycenter.y.toFixed(2)}, ${barycenter.z.toFixed(2)})`;

        // Ajouter une sphère rouge au barycentre pour le visualiser
        const barycenterSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8), // Sphère de rayon 0.1
            new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Matériau rouge
        );
        barycenterSphere.position.set(barycenter.x, barycenter.y, barycenter.z);
        scene.add(barycenterSphere);
    } else {
        console.log('Aucun point trouvé à une altitude proche de 0.');
    }

    // Positionner la caméra
    camera.position.z = 10;
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // S'assurer que la caméra regarde le centre du modèle

    // Fonction d'animation
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();









           
}, undefined, (error) => {
    console.error('Erreur de chargement du modèle GLB :', error);
});

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
