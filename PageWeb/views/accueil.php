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
            <input type="number" v-model="nb" value=<?= $nb ?> min = 0>
            <button @click="lancerGeneration">Générer</button>
            {{ nb }}
        </form>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/vue"></script>
    <script type="module" src="../assets/main.js"></script>
    <script type="module">
        import creationArbre from "../assets/main.js"

        creationArbre(15)
    </script>
</body>
</html>