<!DOCTYPE html>
<html>
<head>
    <title>Téléchargement d'arbres</title>
    <link rel="stylesheet" href="../assets/style.css">
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

        <input type="number" v-model="nb" min="0">

        <div class="options">
            <label>
                <input type="checkbox" v-model="ply">
                PLY
            </label>

            <label>
                <input type="checkbox" v-model="png">
                PNG
            </label>

            <label>
                <input type="checkbox" v-model="JSON_file">
                JSON
            </label>

            <label>
                <input type="checkbox" v-model="JSON_norm">
                JSON Normalisé
            </label>
        </div>

        <div class="actions">
            <button class="primary" @click="lancerGeneration">Générer</button>
        </div>

        <div class="actions secondary">
            <button @click="lancerHistogramme">Histogramme</button>
            <input type="file" id="folderInput" webkitdirectory multiple>
            <button @click="lancerExport">Exporter JSON</button>

        </div>

    </form>
</div>


    <script src="https://cdn.jsdelivr.net/npm/vue"></script>
    <script type="module" src="../assets/main.js"></script>
</body>
</html>