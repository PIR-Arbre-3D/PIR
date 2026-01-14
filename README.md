# PIR : Reconstruction 3D d’arbres à partir de LiDAR aérien pour les jumeaux numériques.

Ce dépôt GitHub permet :
- [PIR : Reconstruction 3D d’arbres à partir de LiDAR aérien pour les jumeaux numériques.](#pir--reconstruction-3d-darbres-à-partir-de-lidar-aérien-pour-les-jumeaux-numériques)
    - [Génération d'arbres](#génération-darbres)
    - [Vérification de la validité des arbres générés](#vérification-de-la-validité-des-arbres-générés)
    - [Simulation de LiDAR aérien](#simulation-de-lidar-aérien)
    - [Entrainement et utilisation réseau neuronal](#entrainement-et-utilisation-réseau-neuronal)
    - [Autres fichiers](#autres-fichiers)

### Génération d'arbres

Pour réaliser la génération d'arbre, il est nécéssaire d'utiliser un serveur local (MAMP) ou distant. La racine du site web est `.\PageWeb\`. Les fonctions permettant de créer l'arbre sont basés sur le travail de Dan Greenheck ([EZ-Tree](https://www.eztree.dev/)).

### Vérification de la validité des arbres générés

La génération d'arbre peut avoir quelques soucis lors de génération d'un nombre important d'arbres. En effet, le navigateur web à tendance à bloquer le téléchargement d'arbre : ainsi la plupart du temps, près de 40% des arbres sont générés mais non téléchargé, ou partiellement (uniquement ply, ou json, ou json norm). De plus, la simulation de LiDAR limite l'import de fichiers ply de plus de 11Mo.

Ainsi nous avons mis au point un code `Test_fichiers.py` filtrant les arbres n'ayant pas toutes leurs données ou ceux étant trop lourds pour la suite. Pour ce faire, il suffit de placer les arbres générés (ply et json) dans le dossier `.\Fichiers_Propres` et de lancer le code précédent

### Simulation de LiDAR aérien

Pour simuler le LiDAR aérien, nous utilisons le code de Darshan VENKATRAYAPPA se trouvant dans `.\DepthMap\`.
Processus :
1. Placer les fichiers .ply dans le dossier `.\DepthMap\Input\`
2. Lancer le fichier `.\DepthMap\__Lancement.py`, explication du processus de ce fichier :
   1. Création un répertoire `C:\__DepthMap` à la racine de votre disque C: et d'autres sous répertoires utiles pour la suite
   2. Lancement de `.\DepthMap\MeshDepth.exe`
   3. Lancement de la simulation multi-echo `.\DepthMap\get_Z.py`
   4. Lancement de `.\DepthMap\Depth3D.exe` sur chaque carte de profondeur du multi-echo
   5. Fusion des nuages de points résultant
   6. Suppression du répertoire `C:\__DepthMap`
3. Le nuage de point final est présent dans `.\DepthMap\Output\`

Pour information, la création du répertoire à la racine du disque C: permet d'avoir un chemin absolu dans le fichier C++ permettant de fonctionner sur toutes les machines.

### Entrainement et utilisation réseau neuronal

Pour entrainer le réseau neuronal PointNet, il suffit de placer les fichiers txt (en sortie de la simulation de LiDAR) dans `.\ReseauNeuronal\Train\txt\` et les json de paramétrage normalisés dans `.\ReseauNeuronal\Train\json`, puis le code `.\ReseauNeuronal\train_and_load.py` s'occupera de lancer l'entrainement (en commentant la bonne partie dans le main). Pour l'utilisation, il suffit de placer les fichiers txt dans `.\ReseauNeuronal\Test\txt\` et de commenter l'autre partie du main. Les résultats seront dans `.\ReseauNeuronal\Test\predictions`

### Autres fichiers 
`stats.py` permet de réaliser un boxplot sur les résultats du réseau neuronal, entre les paramètres prédits et les parametres originaux (à placer dans `.\RéseauNeuronal\Test\json_origines`)