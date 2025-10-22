import * as THREE from 'three';
import * as EZTree from '@dgreenheck/ez-tree';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
const exporter = new GLTFExporter();
// import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
// const exporterOBJ = new OBJExporter();

const loadingManager = THREE.DefaultLoadingManager;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1920 / 1080, 0.1, 1000);
camera.position.z = 100; 
camera.position.y = 60;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(1920, 1080);
const ambientLight = new THREE.AmbientLight(0x404040, 20); // Lumière ambiante douce
scene.add(ambientLight);

const tree = new EZTree.Tree();

let modele = {
  "seed": 35729,
  "type": "deciduous",
  "bark": {
    "type": "oak",
    "tint": 16774097,
    "flatShading": false,
    "textured": true,
    "textureScale": {
      "x": 1,
      "y": 10
    }
  },
  "branch": {
    "levels": 3,
    "angle": {
      "1": 54,
      "2": 58,
      "3": 32
    },
    "children": {
      "0": 6,
      "1": 4,
      "2": 3
    },
    "force": {
      "direction": {
        "x": 0,
        "y": 1,
        "z": 0
      },
      "strength": -0.01
    },
    "gnarliness": {
      "0": 0,
      "1": -0.1,
      "2": -0.15,
      "3": 0.09
    },
    "length": {
      "0": 37.24,
      "1": 11.08,
      "2": 12.39,
      "3": 7.16
    },
    "radius": {
      "0": 1.41,
      "1": 0.9,
      "2": 0.69,
      "3": 1.19
    },
    "sections": {
      "0": 8,
      "1": 6,
      "2": 3,
      "3": 1
    },
    "segments": {
      "0": 7,
      "1": 5,
      "2": 3,
      "3": 3
    },
    "start": {
      "1": 0.49,
      "2": 0.06,
      "3": 0.12
    },
    "taper": {
      "0": 0.73,
      "1": 0.42,
      "2": 0.69,
      "3": 0.75
    },
    "twist": {
      "0": -0.23,
      "1": 0.42,
      "2": 0,
      "3": 0
    }
  },
  "leaves": {
    "type": "oak",
    "billboard": "double",
    "angle": 42,
    "count": 18,
    "start": 0.16,
    "size": 2.5,
    "sizeVariance": 0.7,
    "tint": 14013901,
    "alphaTest": 0.5
  }
}
;

loadingManager.onLoad = function () {
    console.log('textures chargées');
    creationArbres(3);
};

function creationArbres (nb) {
    for (let index = 0; index < nb; index++) {
        tree.loadFromJson(modele);
        tree.generate();
        scene.add(tree);
        exporterArbre(tree, index, modele); 
        console.log('[' + '|'.repeat(Math.floor((index+1)/nb*100)) + ' '.repeat(100 - Math.floor((index+1)/nb*100)) + ']  ' + (index+1) + '/' + nb);
    }
};


function exporterArbre (arbre, i, json) {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();
    let hh = String(today.getHours()).padStart(2,'0');
    let min = String(today.getMinutes()).padStart(2,'0');
    let date = yyyy + '_' + mm + '_' + dd + '__' + hh + '_' + min + '_';

    // ############## OBJ ############## 
    // let x = exporterOBJ.parse(tree)
    // console.log(x)
    // const blobOBJ = new Blob([x], { type: 'application/octet-stream' });
    // const urlOBJ = window.URL.createObjectURL(blobOBJ);
    // const linkOBJ = document.getElementById('downloadLink');
    // linkOBJ.href = urlOBJ;
    // linkOBJ.download = date + 'tree_' + i + '.obj';
    // linkOBJ.click();
    
    // ############## GLB ##############
    exporter.parse(
        arbre,
        (glb) => {
            const blob = new Blob([glb], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const link = document.getElementById('downloadLink');
            link.href = url;
            link.download = date + 'tree_' + i + '.glb';
            link.click();
        },
        (err) => {
            console.error(err);
        },
        { binary: true }
    );

    // ############## JSON ##############
    const blobJSON = new Blob([JSON.stringify(json)], { type: 'text/plain' });
    const urlJSON = window.URL.createObjectURL(blobJSON);
    const linkJSON = document.getElementById('downloadLink');
    linkJSON.href = urlJSON;
    linkJSON.download = date + 'tree_' + i + '.json';
    linkJSON.click();


    // ############## PNG ##############
    renderer.render(scene, camera);

    const linkPNG = document.getElementById('downloadLink');
    linkPNG.href = renderer.domElement.toDataURL('image/png');
    linkPNG.download = date + 'tree_' + i +'.png';
    linkPNG.click();
}

