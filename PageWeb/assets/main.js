import * as THREE from 'three';
import * as EZTree from '@dgreenheck/ez-tree';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
const exporter = new GLTFExporter();
// import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
// const exporterOBJ = new OBJExporter();


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1920 / 1080, 0.1, 1000);
camera.position.z = 100; 
camera.position.y = 60;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(1920, 1080);
const ambientLight = new THREE.AmbientLight(0x404040, 20); // Lumière ambiante douce
scene.add(ambientLight);

const tree = new EZTree.Tree();

function generationJSON() {
  let _level = Math.floor(Math.random()*2) + 2;
  let _prop_length0 = Math.random()
  let _length0 = _prop_length0*(65 - 35) + 35;
  let _length1 = Math.random()*(30 - 15) + 15;
  let _length2 = Math.random()*(10 - 5) + 5;
  let _length3 = Math.random()*(10 - 4) + 4;
  let _children0 = Math.random()*10 + 4 + 6*_prop_length0;
  let _children1 = Math.random()*(7 - 2) + 2;
  let _children2 = Math.random()*(5 - 0) + 0;
  let _radius0 = Math.random()*1.7 + 0.8 + 1.2*_prop_length0;
  let _radius1 = 0.63;
  let _radius2 = 0.76;
  let _radius3 = 0.7;
  let _gnarliness0 = Math.random()*(0.08 + 0.08) - 0.08;
  let _gnarliness1 = Math.random() * (0.5 - 0.2) * (Math.floor(Math.random()*2)*2 - 1);    ///pour les debiles de MP c'est 1 ou -1 ie Tom
  let _gnarliness2 = Math.random() * (0.5 - 0.15) * (Math.floor(Math.random()*2)*2 - 1);
  let _gnarliness3 = Math.random() * (0.5 - 0.05) * (Math.floor(Math.random()*2)*2 - 1);
  let _forceX = Math.random()*2 - 1;
  let _forceY = Math.random()*2 - 1;
  let _forceZ = Math.random()*2 - 1;
  let _strength = Math.random()*0.11 -0.08;
  let _section0 = 12;
  let _section1 = 8;
  let _section2 = 6;
  let _section3 = 4;
  let _segment0 = 12;
  let _segment1 = 6;
  let _segment2 = 4;
  let _segment3 = 3;
  let _start1 = Math.random()*(0.5 - 0.2) + 0.2;
  let _start2 = Math.random()*(0.5 - 0.2) + 0.2;
  let _start3 = Math.random()*(0.5 - 0.2) + 0.2;
  let _taper0 = Math.random()*(0.75 - 0.5) + 0.5;
  let _taper1 = Math.random()*(0.75 - 0.5) + 0.5;
  let _taper2 = Math.random()*(0.75 - 0.5) + 0.5;
  let _taper3 = Math.random()*(0.75 - 0);
  let _twist0 = Math.random()*(0.2 + 0.2) - 0.2;
  let _twist1 = Math.random()*(0.75 + 0.2) - 0.2;
  let _twist2 = Math.random()*(0.75 + 0.2) - 0.2;
  let _twist3 = Math.random()*(0.75 + 0.2) - 0.2;
  let _angle1 = Math.random()*(65 - 40) + 40;
  let _angle2 = Math.random()*(50 - 35) + 35;
  let _angle3 = Math.random()*(65 - 35) + 35;







  let modele = {
    "seed": 36330,
    "type": "deciduous",
    "bark": {
      "type": "oak",
      "tint": 13552830,
      "flatShading": false,
      "textured": true,
      "textureScale": {
        "x": 0.5,
        "y": 5
      }
    },
    "branch": {
      "levels": _level,   ///entre 0 et 3 inclus
      "angle": {
        "1": _angle1,
        "2": _angle2,
        "3": _angle3
      },
      "children": { ///de 0 à 100 correspond au nombre d'enfants par generation 0, 1 ou 2
        "0": _children0,
        "1": _children1,
        "2": _children2
      },
      "force": {
        "direction": {  ///direction d'attraction   de -1 à 1
          "x": _forceX,
          "y": _forceY,
          "z": _forceZ
        },
        "strength": _strength  /// force d'attraction de -0.1 à 0.1
      },
      "gnarliness": {
        "0": _gnarliness0,
        "1": _gnarliness1,
        "2": _gnarliness2,
        "3": _gnarliness3
      },
      "length": {
        "0": _length0,
        "1": _length1,   
        "2": _length2,
        "3": _length3
      },
      "radius": {
        "0": _radius0,
        "1": _radius1,
        "2": _radius2,
        "3": _radius3
      },
      "sections": {
        "0": _section0,
        "1": _section1,
        "2": _section2,
        "3": _section3
      },
      "segments": {
        "0": _segment0,
        "1": _segment1,
        "2": _segment2,
        "3": _segment3
      },
      "start": {
        "1": _start1,
        "2": _start2,
        "3": _start3
      },
      "taper": {
        "0": _taper0,
        "1": _taper1,
        "2": _taper2,
        "3": _taper3
      },
      "twist": {
        "0": _twist0,
        "1": _twist1,
        "2": _twist2,
        "3": _twist3
      }
    },
    "leaves": {
      "type": "ash",
      "billboard": "single",
      "angle": 55,
      "count": 16,
      "start": 0,
      "size": 1,
      "sizeVariance": 0.72,
      "tint": 16777215,
      "alphaTest": 0.5
    }
  };
  return modele
};

export default function creationArbres (nb) {
    console.log('textures chargées');
    for (let index = 0; index < nb; index++) {
      let arbre = generationJSON();
      tree.loadFromJson(arbre);
      tree.generate();
      scene.add(tree);
      exporterArbre(tree, index, arbre); 
      console.log('[' + '|'.repeat(Math.floor((index+1)/nb*100)) + ' '.repeat(100 - Math.floor((index+1)/nb*100)) + ']  ' + (index+1) + '/' + nb);
    }
}


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


// ###################################################
// ################## Vue JS #########################
// ###################################################

let vue = Vue.createApp({
  data() {
    return {
      nb: 1,
    };
  },
  computed: {
  },
  methods: {
    lancerGeneration(){
      creationArbres(this.nb);
    }
  },
}).mount('#app');