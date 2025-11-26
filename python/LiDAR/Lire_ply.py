import pandas as pd
from plyfile import PlyData, PlyElement

fichier = "python/LiDAR/test.ply"

with open(fichier, 'r') as f:
    lignes = f.readlines()
    nombre = int(lignes[11][13:])

print(nombre)

table = pd.read_csv(fichier, sep=" ", skiprows=14, skipfooter=nombre+1,names=['x', 'y', 'z', 'nx','ny','nz','s','t'], usecols=['x','y','z'])
print(table)