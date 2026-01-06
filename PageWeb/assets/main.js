import * as THREE from 'three';
import * as EZTree from '@dgreenheck/ez-tree';
import { PLYExporter } from './PLYExporter.js';
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

  // === Parametres de la loi ===
  let somme = 0;
  zValues.forEach(valeur => {
    somme += valeur
  });
  let moyenne = somme / zValues.length;
  somme = 0;
  zValues.forEach(valeur => {
    somme += (moyenne - valeur)**2
  });
  let ecart_type = (somme / zValues.length)**0.5;

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
  ctx.fillText('Distribution des hauteurs Z. (µ = ' + moyenne.toFixed(2) + " s = " + ecart_type.toFixed(2) +")" , margin.left, margin.top - 10);

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

function genererJSONNormalise() {
  return {
    "norm_level" : Math.random(),
    "norm_length0" : Math.random(),
    "norm_length1" : Math.random(), 
    "norm_length2" : Math.random(),
    "norm_lenght3" : Math.random(),
    "norm_children0" : Math.random(),
    "norm_children1" : Math.random(),
    "norm_children2" : Math.random(),
    "norm_radius0" : Math.random(),
    "norm_gnarliness0" : Math.random(),
    "norm_gnarliness1" : Math.random(),
    "signe_gnarliness1" : Math.random(),
    "norm_gnarliness2" : Math.random(),
    "signe_gnarliness2" : Math.random(),
    "norm_gnarliness3" : Math.random(),
    "signe_gnarliness3" : Math.random(),
    "norm_forceX" : Math.random(),
    "norm_forceY" : Math.random(),
    "norm_forceZ" : Math.random(),
    "norm_strength" : Math.random(),
    "norm_start1" : Math.random(),
    "norm_start2" : Math.random(),
    "norm_start3" : Math.random(),
    "norm_taper0" : Math.random(),
    "norm_taper1" : Math.random(),
    "norm_taper2" : Math.random(),
    "norm_taper3" : Math.random(),
    "norm_twist0" : Math.random(),
    "norm_twist1" : Math.random(),
    "norm_twist2" : Math.random(),
    "norm_twist3" : Math.random(),
    "norm_angle1" : Math.random(),
    "norm_angle2" : Math.random(),
    "norm_angle3" : Math.random()
  };
};


function genererJSONFinal(JSON_normalise) {
  if (!JSON_normalise || Object.keys(JSON_normalise).length === 0) {
    JSON_normalise = genererJSONNormalise();
  }

  const _level = Math.floor(JSON_normalise["norm_level"]*2) + 2;
  const _length0 = JSON_normalise["norm_length0"]*(65 - 35) + 35;
  const _length1 = JSON_normalise["norm_length1"]*(30 - 15) + 15;
  const _length2 = JSON_normalise["norm_length2"]*(10 - 5) + 5;
  const _length3 = JSON_normalise["norm_lenght3"]*(10 - 4) + 4;
  const _children0 = JSON_normalise["norm_children0"]*10 + 4 + 6*JSON_normalise["norm_length0"];
  const _children1 = JSON_normalise["norm_children1"]*(7 - 2) + 2;
  const _children2 = JSON_normalise["norm_children2"]*(5 - 0) + 0;
  const _radius0 = Math.sqrt(JSON_normalise["norm_radius0"])*1.7 + 0.8 + 1.2*JSON_normalise["norm_length0"];
  const _radius1 = 0.63;
  const _radius2 = 0.76;
  const _radius3 = 0.7;
  const _gnarliness0 = JSON_normalise["norm_gnarliness0"]*(0.08 + 0.08) - 0.08;
  const _gnarliness1 = JSON_normalise["norm_gnarliness1"] * (0.5 - 0.20) * (Math.floor(JSON_normalise["signe_gnarliness1"]*2)*2 - 1);    
  const _gnarliness2 = JSON_normalise["norm_gnarliness2"] * (0.5 - 0.15) * (Math.floor(JSON_normalise["signe_gnarliness2"]*2)*2 - 1);
  const _gnarliness3 = JSON_normalise["norm_gnarliness3"] * (0.5 - 0.05) * (Math.floor(JSON_normalise["signe_gnarliness3"]*2)*2 - 1);
  const _forceX = JSON_normalise["norm_forceX"]*2 - 1;
  const _forceY = JSON_normalise["norm_forceY"]*2 - 1;
  const _forceZ = JSON_normalise["norm_forceZ"]*2 - 1;
  const _strength = Math.pow(JSON_normalise["norm_strength"], 1.5)*0.11 - 0.08;
  const _section0 = 12, _section1 = 8, _section2 = 6, _section3 = 4;
  const _segment0 = 12, _segment1 = 6, _segment2 = 4, _segment3 = 3;
  const _start1 = JSON_normalise["norm_start1"]*(0.5 - 0.2) + 0.2;
  const _start2 = JSON_normalise["norm_start2"]*(0.5 - 0.2) + 0.2;
  const _start3 = JSON_normalise["norm_start3"]*(0.5 - 0.2) + 0.2;
  const _taper0 = JSON_normalise["norm_taper0"]*(0.75 - 0.5) + 0.5;
  const _taper1 = JSON_normalise["norm_taper1"]*(0.75 - 0.5) + 0.5;
  const _taper2 = JSON_normalise["norm_taper2"]*(0.75 - 0.5) + 0.5;
  const _taper3 = JSON_normalise["norm_taper3"]*(0.75 - 0);
  const _twist0 = JSON_normalise["norm_twist0"]*(0.2 + 0.2) - 0.2;
  const _twist1 = JSON_normalise["norm_twist1"]*(0.75 + 0.2) - 0.2;
  const _twist2 = JSON_normalise["norm_twist2"]*(0.75 + 0.2) - 0.2;
  const _twist3 = JSON_normalise["norm_twist3"]*(0.75 + 0.2) - 0.2;
  const _angle1 = JSON_normalise["norm_angle1"]*(65 - 40) + 40;
  const _angle2 = JSON_normalise["norm_angle2"]*(50 - 35) + 35;
  const _angle3 = JSON_normalise["norm_angle3"]*(65 - 35) + 35;

  // Création du modèle final
  const modele = {
    "seed": 36330,
    "type": "deciduous",
    "bark": { "type":"oak", "tint":13552830, "flatShading":false, "textured":true, "textureScale":{"x":0.5,"y":5} },
    "branch": {
      "levels": _level,
      "angle": {"1": _angle1, "2": _angle2, "3": _angle3},
      "children": {"0": _children0,"1": _children1,"2": _children2},
      "force": { "direction":{"x":_forceX,"y":_forceY,"z":_forceZ}, "strength": _strength },
      "gnarliness": {"0":_gnarliness0,"1":_gnarliness1,"2":_gnarliness2,"3":_gnarliness3},
      "length": {"0":_length0,"1":_length1,"2":_length2,"3":_length3},
      "radius": {"0":_radius0,"1":_radius1,"2":_radius2,"3":_radius3},
      "sections": {"0":_section0,"1":_section1,"2":_section2,"3":_section3},
      "segments": {"0":_segment0,"1":_segment1,"2":_segment2,"3":_segment3},
      "start": {"1":_start1,"2":_start2,"3":_start3},
      "taper": {"0":_taper0,"1":_taper1,"2":_taper2,"3":_taper3},
      "twist": {"0":_twist0,"1":_twist1,"2":_twist2,"3":_twist3}
    },
    "leaves": {"type":"ash","billboard":"double","angle":55,"count":16,"start":0,"size":1,"sizeVariance":0.72,"tint":16777215,"alphaTest":0.5}
  };

  return {"modele": modele, "JSON_normalise": JSON_normalise};
};




function generationJSON(JSON_normalise = {}) {
  if (JSON.stringify(JSON_normalise) === '{}') {
    console.log("Génération du JSON normalisé")
    JSON_normalise = {
      "norm_level" : Math.random(),
      "norm_length0" : Math.random(),
      "norm_length1" : Math.random(), 
      "norm_length2" : Math.random(),
      "norm_lenght3" : Math.random(),
      "norm_children0" : Math.random(),
      "norm_children1" : Math.random(),
      "norm_children2" : Math.random(),
      "norm_radius0" : Math.random(),
      "norm_gnarliness0" : Math.random(),
      "norm_gnarliness1" : Math.random(),
      "signe_gnarliness1" : Math.random(),
      "norm_gnarliness2" : Math.random(),
      "signe_gnarliness2" : Math.random(),
      "norm_gnarliness3" : Math.random(),
      "signe_gnarliness3" : Math.random(),
      "norm_forceX" : Math.random(),
      "norm_forceY" : Math.random(),
      "norm_forceZ" : Math.random(),
      "norm_strength" : Math.random(),
      "norm_start1" : Math.random(),
      "norm_start2" : Math.random() ,
      "norm_start3" : Math.random(),
      "norm_taper0" : Math.random(),
      "norm_taper1" : Math.random(),
      "norm_taper2" : Math.random(),
      "norm_taper3" : Math.random(),
      "norm_twist0" : Math.random(),
      "norm_twist1" : Math.random(),
      "norm_twist2" : Math.random(),
      "norm_twist3" : Math.random(),
      "norm_angle1" : Math.random(),
      "norm_angle2" : Math.random(),
      "norm_angle3" : Math.random(),
    };

  }
  let _level = Math.floor(JSON_normalise["norm_level"]*2) + 2;
  let _length0 = JSON_normalise["norm_length0"]*(65 - 35) + 35;
  let _length1 = JSON_normalise["norm_length1"]*(30 - 15) + 15;
  let _length2 = JSON_normalise["norm_length2"]*(10 - 5) + 5;
  let _length3 = JSON_normalise["norm_lenght3"]*(10 - 4) + 4;
  let _children0 = JSON_normalise["norm_children0"]*10 + 4 + 6*JSON_normalise["norm_length0"];
  let _children1 = JSON_normalise["norm_children1"]*(7 - 2) + 2;
  let _children2 = JSON_normalise["norm_children2"]*(5 - 0) + 0;
  let _radius0 = (JSON_normalise["norm_radius0"]**0.5)*1.7 + 0.8 + 1.2*JSON_normalise["norm_length0"];
  let _radius1 = 0.63;
  let _radius2 = 0.76;
  let _radius3 = 0.7;
  let _gnarliness0 = JSON_normalise["norm_gnarliness0"]*(0.08 + 0.08) - 0.08;
  let _gnarliness1 = JSON_normalise["norm_gnarliness1"] * (0.5 - 0.20) * (Math.floor(JSON_normalise["signe_gnarliness1"]*2)*2 - 1);    
  let _gnarliness2 = JSON_normalise["norm_gnarliness2"] * (0.5 - 0.15) * (Math.floor(JSON_normalise["signe_gnarliness2"]*2)*2 - 1);
  let _gnarliness3 = JSON_normalise["norm_gnarliness3"] * (0.5 - 0.05) * (Math.floor(JSON_normalise["signe_gnarlinees3"]*2)*2 - 1);
  let _forceX = JSON_normalise["norm_forceX"]*2 - 1;
  let _forceY = JSON_normalise["norm_forceY"]*2 - 1;
  let _forceZ = JSON_normalise["norm_forceZ"]*2 - 1;
  let _strength = (JSON_normalise["norm_strength"]**1.5)*0.11 - 0.08; ///non lineaire
  let _section0 = 12;
  let _section1 = 8;
  let _section2 = 6;
  let _section3 = 4;
  let _segment0 = 12;
  let _segment1 = 6;
  let _segment2 = 4;
  let _segment3 = 3;
  let _start1 = JSON_normalise["norm_start1"]*(0.5 - 0.2) + 0.2;
  let _start2 = JSON_normalise["norm_start2"]*(0.5 - 0.2) + 0.2;
  let _start3 = JSON_normalise["norm_start3"]*(0.5 - 0.2) + 0.2;
  let _taper0 = JSON_normalise["norm_taper0"]*(0.75 - 0.5) + 0.5;
  let _taper1 = JSON_normalise["norm_taper1"]*(0.75 - 0.5) + 0.5;
  let _taper2 = JSON_normalise["norm_taper2"]*(0.75 - 0.5) + 0.5;
  let _taper3 = JSON_normalise["norm_taper3"]*(0.75 - 0);
  let _twist0 = JSON_normalise["norm_twist0"]*(0.2 + 0.2) - 0.2;
  let _twist1 = JSON_normalise["norm_twist1"]*(0.75 + 0.2) - 0.2;
  let _twist2 = JSON_normalise["norm_twist2"]*(0.75 + 0.2) - 0.2;
  let _twist3 = JSON_normalise["norm_twist3"]*(0.75 + 0.2) - 0.2;
  let _angle1 = JSON_normalise["norm_angle1"]*(65 - 40) + 40;
  let _angle2 = JSON_normalise["norm_angle2"]*(50 - 35) + 35;
  let _angle3 = JSON_normalise["norm_angle3"]*(65 - 35) + 35;


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
  // console.log(modele)
  return {"modele" : modele, "JSON_normalise" : JSON_normalise}
};

let l_hist = [];

async function creationArbres (index, date, param) {
// console.log('textures chargées');
  let resultat = generationJSON();
  let arbre = resultat["modele"];
  let arbre_normalise = resultat["JSON_normalise"];
  tree.loadFromJson(arbre);
  tree.generate();
  scene.add(tree);
  return await exporterArbre(tree, index, arbre, arbre_normalise, date, param); 
};

export function creationHistogramme (nb) {
  let l_hist = [];
  for (let index = 0; index < nb; index++) {
    let arbre = generationJSON();
    tree.loadFromJson(arbre);
    tree.generate();
    scene.add(tree);
    l_hist.push(getMaxZCoordinates(tree)); 
    console.log('[' + '|'.repeat(Math.floor((index + 1) / nb * 100)) + ' '.repeat(100 - Math.floor((index + 1) / nb * 100)) + ']  ' + (index+1) + '/' + nb);
  };
  
  console.log(nb);
  console.log(l_hist.length);
  genererHistogrammeImage2(l_hist);
};



async function exporterArbre(arbre, i, json, json_normalise, date, param) {

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
  const exportPromise = new Promise((resolve,reject)=> {
    if (param["ply"]) {
      exporter.parse(
        arbre,
        (ply) => {
          const blob = new Blob([ply], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const link = document.getElementById('downloadLink');
          link.href = url;
          link.download = date + 'tree_' + i + '.ply';
          link.click();
          resolve();
        },
        (err) => {
          console.error(err);
          reject(err);
        },
        { binary: true }
      );
    } else {
      resolve();
    }
  });

  await exportPromise;
  

  // ############## JSON ##############
  if (param["JSON"]) {
    const blobJSON = new Blob([JSON.stringify(json)], { type: 'text/plain' });
    const urlJSON = window.URL.createObjectURL(blobJSON);
    const linkJSON = document.getElementById('downloadLink');
    linkJSON.href = urlJSON;
    linkJSON.download = date + 'tree_' + i + '.json';
    linkJSON.click();
  };

  // ############## JSON  Normalisé ###########
  if (param["JSON_n"]) {
      const blobJSON_norm = new Blob([JSON.stringify(json_normalise)], { type: 'text/plain' });
    const urlJSON_norm = window.URL.createObjectURL(blobJSON_norm);
    const linkJSON_norm = document.getElementById('downloadLink');
    linkJSON_norm.href = urlJSON_norm;
    linkJSON_norm.download = date + 'tree_' + i + '_normalise.json';
    linkJSON_norm.click();
  };

  // ############## PNG ##############
  if (param["png"]) {
    renderer.render(scene, camera);
    const linkPNG = document.getElementById('downloadLink');
    linkPNG.href = renderer.domElement.toDataURL('image/png');
    linkPNG.download = date + 'tree_' + i + '.png';
    linkPNG.click();
  };

  return maxZ;
};

function generationDossier() {
  const input = document.getElementById("folderInput");
  if (!input.files.length) {
    alert("Veuillez sélectionner un dossier contenant des fichiers JSON.");
    return;
  }

  const files = Array.from(input.files).filter(f => f.name.endsWith(".json"));

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Lire et parser le JSON
        let jsonData = JSON.parse(e.target.result);

        // Appeler  fonction de dénormalisation
        let arbre = genererJSONFinal(jsonData)["modele"];
        let newTree = new EZTree.Tree();
        let newScene = new THREE.Scene();
        newTree.loadFromJson(arbre);
        newTree.generate();
        newScene.add(newTree);

        console.log('arbre', arbre)

        // Appeler  fonction d'export
        exporterArbre(newTree, '', arbre, jsonData, file.name.replace(/\.json$/i, ""), {
        "ply" : true,
        "png" : false,
        "JSON" : false,
        "JSON_n" : false
      });

      } catch (err) {
        console.error("Erreur JSON dans le fichier :", file.name, err);
      }
    };
    reader.readAsText(file);
  });
};





// ###################################################
// ################## Vue JS #########################
// ###################################################

let vue = Vue.createApp({
  data() {
    return {
      nb: 1,
      ply:true,
      png:false,
      JSON_file:false,
      JSON_norm:true,
      bloque:false,
      index:0
    };
  },
  computed: {
  },
  methods: {
    async lancerGeneration(){
      this.bloque = true;
      let param = {
        "ply" : this.ply,
        "png" : this.png,
        "JSON" : this.JSON_file,
        "JSON_n" : this.JSON_norm
      };
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0');
      let yyyy = today.getFullYear();
      let hh = String(today.getHours()).padStart(2, '0');
      let min = String(today.getMinutes()).padStart(2, '0');
      let date = yyyy + '_' + mm + '_' + dd + '__' + hh + '_' + min + '_';
      for (let index = 1; index < this.nb +1; index++) {
        this.index = index;
        await creationArbres(index, date, param);
        //console.log('[' + '|'.repeat(Math.floor((index + 1) / this.nb * 100)) + ' '.repeat(100 - Math.floor((index + 1) / this.nb * 100)) + ']  ' + (index+1) + '/' + this.nb);

      }
      this.bloque = false;
      this.index = 0;
    },
    lancerHistogramme(){
      creationHistogramme(this.nb);
    },
    lancerExport(){
      generationDossier("D:/Tom/predictions/");
    }
  },
}).mount('#app');



