import pandas as pd
import numpy as np
from plyfile import PlyData, PlyElement

fichier = "python/LiDAR/test.ply"

# Récupération du nombre de points
with open(fichier, 'r') as f:
    lignes = f.readlines()
    nombre = int(lignes[11][13:])

echelle = 10/28

# Création de la table
table = pd.read_csv(fichier, sep=" ", skiprows=14, skipfooter=nombre+1,names=['x', 'z', 'y', 'nx','nz','ny','s','t'], usecols=['x','y','z'], engine = 'python')
table['x'], table['y'], table['z'] = echelle * table['x'], echelle * table['y'], echelle * table['z']
# print(table)

mini = table.min()

table['x'], table['y'] = table['x'] + abs(mini["x"]), table['y'] +abs(mini["y"])

# maxi = table.max()

# nb_longueur = int(maxi['x'] // 0.03 + 1)
# nb_largeur = int(maxi['y'] // 0.03 + 1)

# table['case_x'], table['case_y'] = (table['x'] // 0.03).astype(int) , (table['y'] // 0.03).astype(int)

# image = np.zeros((nb_longueur,nb_largeur)) 

# for l in image :
#     for c in image :
#         image[l,c] = table.filter



### PRINT 
infos = f"""

longueur = {round(maxi['x'], 2)}
largeur = {round(maxi['y'], 2)}
hauteur = {round(maxi['z'], 2)}

nb_longueur = {nb_longueur}
nb_largeur = {nb_largeur}

"""
print(infos)
# print(table)