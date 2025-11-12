import * as THREE from 'three';
import * as EZTree from '@dgreenheck/ez-tree';
import { PLYExporter } from 'three/addons/exporters/PLYExporter.js';
const exporter = new PLYExporter();

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



function getMaxZCoordinates(arbre) {
  let maxZ = 0; // On commence avec la plus petite valeur possible
  arbre.traverse((child) => {
    if (child.isMesh) {
      const geometry = child.geometry;
      if (geometry.isBufferGeometry) {
        const position = geometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
          const z = position.getZ(i);
          maxZ = Math.max(maxZ, z); // Met à jour la valeur maximale
        }
      }
    }
  });
  return maxZ;
}

function genererHistogrammeImage(zValues, filename = 'histogramme_z') {
  if (!zValues || zValues.length === 0) {
    console.warn("Aucune coordonnée Z fournie.");
    return;
  }

  // === Paramètres de l'histogramme ===
  const numBins = 30; // nombre de barres
  const minZ = Math.min(...zValues);
  const maxZ = Math.max(...zValues);
  const binSize = (maxZ - minZ) / numBins;
  const bins = new Array(numBins).fill(0);

  // === Remplissage des bins ===
  zValues.forEach((z) => {
    let idx = Math.floor((z - minZ) / binSize);
    if (idx >= numBins) idx = numBins - 1;
    bins[idx]++;
  });

  // === Création du canvas ===
  const canvas = document.createElement('canvas');
  const width = 800, height = 400;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // === Fond blanc ===
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);

  // === Dessin de l'histogramme ===
  const barWidth = width / numBins;
  const maxCount = Math.max(...bins);

  bins.forEach((count, i) => {
    const barHeight = (count / maxCount) * (height - 50);
    const x = i * barWidth;
    const y = height - barHeight;

    // Dégradé du vert (faible) au rouge (fort)
    const ratio = count / maxCount;
    const color = `hsl(${120 - ratio * 120}, 70%, 50%)`; // vert→rouge
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth - 2, barHeight);
  });

  // === Axes ===
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, height - 10);
  ctx.lineTo(width - 10, height - 10);
  ctx.stroke();

  // === Légende ===
  ctx.fillStyle = '#000';
  ctx.font = '16px sans-serif';
  ctx.fillText('Distribution des hauteurs Z', 20, 30);

  // === Export PNG ===
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename + '.png';
  link.click();
}




function genererHistogrammeImage2(zValues, filename = 'histogramme_z') {
  if (!zValues || zValues.length === 0) {
    console.warn("Aucune coordonnée Z fournie.");
    return;
  }

  // === Paramètres de l'histogramme ===
  const numBins = 30;
  const minZ = Math.min(...zValues);
  const maxZ = Math.max(...zValues);
  const binSize = (maxZ - minZ) / numBins;
  const bins = new Array(numBins).fill(0);

  // === Remplissage des bins ===
  zValues.forEach((z) => {
    let idx = Math.floor((z - minZ) / binSize);
    if (idx >= numBins) idx = numBins - 1;
    bins[idx]++;
  });

  // === Création du canvas ===
  const canvas = document.createElement('canvas');
  const width = 900, height = 500;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // === Marges ===
  const margin = { left: 60, right: 30, top: 40, bottom: 60 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // === Fond blanc ===
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);

  // === Dessin des barres ===
  const barWidth = plotWidth / numBins;
  const maxCount = Math.max(...bins);

  bins.forEach((count, i) => {
    const barHeight = (count / maxCount) * plotHeight;
    const x = margin.left + i * barWidth;
    const y = height - margin.bottom - barHeight;

    const ratio = count / maxCount;
    const color = `hsl(${120 - ratio * 120}, 70%, 50%)`; // vert→rouge
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth - 2, barHeight);
  });

  // === Axes ===
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Axe X
  ctx.moveTo(margin.left, height - margin.bottom);
  ctx.lineTo(width - margin.right, height - margin.bottom);
  // Axe Y
  ctx.moveTo(margin.left, height - margin.bottom);
  ctx.lineTo(margin.left, margin.top);
  ctx.stroke();

  ctx.fillStyle = '#000';
  ctx.font = '14px sans-serif';

  // === Graduation Y (nombre d’occurrences) ===
  const numYTicks = 5;
  for (let i = 0; i <= numYTicks; i++) {
    const value = Math.round((i / numYTicks) * maxCount);
    const y = height - margin.bottom - (i / numYTicks) * plotHeight;

    ctx.fillText(value.toString(), margin.left - 40, y + 5);

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();
  }

  // === Graduation X (valeurs Z) ===
  const numXTicks = 6;
  ctx.textAlign = 'center';
  for (let i = 0; i <= numXTicks; i++) {
    const zValue = minZ + (i / numXTicks) * (maxZ - minZ);
    const x = margin.left + (i / numXTicks) * plotWidth;
    ctx.fillText(zValue.toFixed(2), x, height - margin.bottom + 20);
  }

  // === Titres ===
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000';
  ctx.font = '18px sans-serif';
  ctx.fillText('Distribution des hauteurs Z', margin.left, margin.top - 10);

  ctx.save();
  ctx.translate(20, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.font = '16px sans-serif';
  ctx.fillText('Nombre de points', 0, 0);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.font = '16px sans-serif';
  ctx.fillText('Valeurs Z', margin.left + plotWidth / 2, height - 20);

  // === Export PNG ===
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename + '.png';
  link.click();
}





function generationJSON() {
  let _level = Math.floor(Math.random()*2) + 2;
  let _prop_length0 = Math.random();
  let norm_length0 = _prop_length0;
  let _length0 = norm_length0*(65 - 35) + 35;
  let norm_length1 = Math.random(); 
  let _length1 = norm_length1*(30 - 15) + 15;
  let norm_length2 = Math.random()
  let _length2 = norm_length2*(10 - 5) + 5;
  let norm_lenght3 = Math.random();
  let _length3 = norm_lenght3*(10 - 4) + 4;
  let norm_children0 = Math.random();
  let _children0 = norm_children0*10 + 4 + 6*_prop_length0;
  let norm_children1 = Math.random();
  let _children1 = norm_children1*(7 - 2) + 2;
  let norm_children2 = Math.random();
  let _children2 = norm_children2*(5 - 0) + 0;
  let norm_radius0 = Math.random()**0.5;   ///alpha de 0.5;
  let _radius0 = norm_radius0*1.7 + 0.8 + 1.2*_prop_length0;
  let _radius1 = 0.63;
  let _radius2 = 0.76;
  let _radius3 = 0.7;
  let norm_gnarliness0 = Math.random();
  let _gnarliness0 = norm_gnarliness0*(0.08 + 0.08) - 0.08;
  let norm_gnarliness1 = Math.random();
  let _gnarliness1 = norm_gnarliness1 * (0.5 - 0.2) * (Math.floor(Math.random()*2)*2 - 1);    
  let norm_gnarliness2 = Math.random();
  let _gnarliness2 = norm_gnarliness2 * (0.5 - 0.15) * (Math.floor(Math.random()*2)*2 - 1);
  let norm_gnarliness3 = Math.random();
  let _gnarliness3 = norm_gnarliness3 * (0.5 - 0.05) * (Math.floor(Math.random()*2)*2 - 1);
  let norm_forceX = Math.random();
  let _forceX = norm_forceX*2 - 1;
  let norm_forceY = Math.random();
  let _forceY = norm_forceY*2 - 1;
  let norm_forceZ = Math.random();
  let _forceZ = norm_forceZ*2 - 1;
  let norm_strength = Math.random()**1.5;   ///alpha de 1.5
  let _strength = norm_strength*0.11 - 0.08; ///non lineaire
  let _section0 = 12;
  let _section1 = 8;
  let _section2 = 6;
  let _section3 = 4;
  let _segment0 = 12;
  let _segment1 = 6;
  let _segment2 = 4;
  let _segment3 = 3;
  let norm_start1 = Math.random();
  let _start1 = norm_start1*(0.5 - 0.2) + 0.2;
  let norm_start2 = Math.random();
  let _start2 = norm_start2*(0.5 - 0.2) + 0.2;
  let norm_start3 = Math.random();
  let _start3 = norm_start3*(0.5 - 0.2) + 0.2;
  let norm_taper0 = Math.random();
  let _taper0 = norm_taper0*(0.75 - 0.5) + 0.5;
  let norm_taper1 = Math.random();
  let _taper1 = norm_taper1*(0.75 - 0.5) + 0.5;
  let norm_taper2 = Math.random();
  let _taper2 = norm_taper2*(0.75 - 0.5) + 0.5;
  let norm_taper3 = Math.random();
  let _taper3 = norm_taper3*(0.75 - 0);
  let norm_twist0 = Math.random();
  let _twist0 = norm_twist0*(0.2 + 0.2) - 0.2;
  let norm_twist1 = Math.random();
  let _twist1 = norm_twist1*(0.75 + 0.2) - 0.2;
  let norm_twist2 = Math.random();
  let _twist2 = norm_twist2*(0.75 + 0.2) - 0.2;
  let norm_twist3 = Math.random();
  let _twist3 = norm_twist3*(0.75 + 0.2) - 0.2;
  let norm_angle1 = Math.random();
  let _angle1 = norm_angle1*(65 - 40) + 40;
  let norm_angle2 = Math.random();
  let _angle2 = norm_angle2*(50 - 35) + 35;
  let norm_angle3 = Math.random();
  let _angle3 = norm_angle3*(65 - 35) + 35;







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
      "billboard": "double",
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

let l_hist = [];

export default function creationArbres (nb) {
    // console.log('textures chargées');
    for (let index = 0; index < nb; index++) {
      let arbre = generationJSON();
      tree.loadFromJson(arbre);
      tree.generate();
      scene.add(tree);
      l_hist.push(exporterArbre(tree, index, arbre)); 
      console.log('[' + '|'.repeat(Math.floor((index + 1) / nb * 100)) + ' '.repeat(100 - Math.floor((index + 1) / nb * 100)) + ']  ' + (index+1) + '/' + nb);
      if (l_hist.length > nb - 1) {
        console.log(nb);
        console.log(l_hist.length);
        genererHistogrammeImage2(l_hist);
      };
    }
}


function exporterArbre(arbre, i, json) {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();
  let hh = String(today.getHours()).padStart(2, '0');
  let min = String(today.getMinutes()).padStart(2, '0');
  let date = yyyy + '_' + mm + '_' + dd + '__' + hh + '_' + min + '_';

  // Récupérer les coordonnées Z maximales
  let maxZ = getMaxZCoordinates(arbre);

  // ############## OBJ ############## 
  // let x = exporterOBJ.parse(tree)
  // console.log(x)
  // const blobOBJ = new Blob([x], { type: 'application/octet-stream' });
  // const urlOBJ = window.URL.createObjectURL(blobOBJ);
  // const linkOBJ = document.getElementById('downloadLink');
  // linkOBJ.href = urlOBJ;
  // linkOBJ.download = date + 'tree_' + i + '.obj';
  // linkOBJ.click();

  // ############## PLY ##############
  exporter.parse(
    arbre,
    (ply) => {
      const blob = new Blob([ply], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.getElementById('downloadLink');
      link.href = url;
      link.download = date + 'tree_' + i + '.ply';
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
  linkPNG.download = date + 'tree_' + i + '.png';
  linkPNG.click();


  return maxZ;
};





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








