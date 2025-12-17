<!DOCTYPE html>
<html>
<head>
    <title>Téléchargement d'arbres</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
    <meta charset="utf-8">
</head>


<body>
    <a id="downloadLink" style="display: none"></a>
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.165.0/build/three.module.js",
                "@dgreenheck/ez-tree": "/node_modules/@dgreenheck/ez-tree/build/ez-tree.es.js",
                "three/addons/": "https://unpkg.com/three@0.165.0/examples/jsm/"
            }
        }
    </script>
    
    


    <div id="app">
        <form @submit.prevent>
            <input type="number" v-model="nb" value=1 min = 0 :readonly="bloque">
            <input type="checkbox" v-model="ply" checked :disabled="bloque">PLY
            <input type="checkbox" v-model="png" :disabled="bloque">PNG
            <input type="checkbox" v-model="JSON_file" :disabled="bloque">JSON
            <input type="checkbox" v-model="JSON_norm" checked :disabled="bloque">JSON Normalisé
            <br>
            <button @click="lancerGeneration" :disabled="bloque">Générer</button>
            <button @click="lancerHistogramme" :disabled="bloque">Histogramme</button>
        </form>

        Progression : 
        <progress :max="nb" :value="index"></progress>   {{index}}
    </div>

    <script src="https://cdn.jsdelivr.net/npm/vue"></script>
    <script type="module" src="../assets/main.js"></script>
</body>
</html>