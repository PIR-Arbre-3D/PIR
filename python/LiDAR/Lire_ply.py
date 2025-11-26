import pandas as pd
import numpy as np
from plyfile import PlyData, PlyElement

fichier = "python/LiDAR/test.ply"

# Récupération du nombre de points
def lecture_ply(fichier, moyenne = 25, ecartType = 9) : 
    with open(fichier, 'r') as f:
        lignes = f.readlines()
        nombre = int(lignes[11][13:])

    ecartTypeOrigine = 9.8
    ecartTypeVoulu = 2
    moyenneOrigine = 25.5
    moyenneVoulue = 12.5

    # Création de la table
    table = pd.read_csv(fichier, sep=" ", skiprows=14, skipfooter=nombre+1,names=['x', 'z', 'y', 'nx','nz','ny','s','t'], usecols=['x','y','z'], engine = 'python')
    zMax = table.max()['z']
    
    # Passaga à la loi normale puis denormalisation en fonction de z
    echelle = (ecartTypeVoulu*((zMax-moyenneOrigine)/ecartTypeOrigine) + moyenneVoulue ) / zMax

    table['x'], table['y'], table['z'] = echelle * table['x'], echelle * table['y'], echelle * table['z']

    mini = table.min()

    table['x'], table['y'] = table['x'] + abs(mini["x"]), table['y'] +abs(mini["y"])

    maxi = table.max()
    infos = f"""
    longueur = {round(maxi['x'], 2)}
    largeur = {round(maxi['y'], 2)}
    hauteur = {round(maxi['z'], 2)}
    """
    print(infos)
    return table

if __name__ == "__main__" :
    lecture_ply(fichier)