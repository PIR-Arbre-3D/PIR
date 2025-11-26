# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
import Lire_ply as ply
from scipy.spatial import cKDTree

def distance_euclidienne(x1, y1, z1, x2, y2, z2):
    return np.sqrt((x1 - x2)**2 + (y1 - y2)**2 + (z1 - z2)**2)


def repartition(df) :
    if 'carre' not in df.columns:
        df['carre'] = None
    if 'nb_pt_prox' not in df.columns:
        df['nb_pt_prox'] = 0  

    points = df[['x', 'y', 'z']].values
    tree = cKDTree(points)

    radius = 10
    pairs = tree.query_pairs(radius)


    for i, j in pairs:
        df.at[i, 'nb_pt_prox'] += 1
        df.at[j, 'nb_pt_prox'] += 1

    
    for index_i, row_i in df.iterrows():
        df.at[index_i, 'carre'] = (int(row_i['y']//3), int(row_i['x']//3))





if __name__ == "__main__" :
    table = ply.lecture_ply("python/LiDAR/test.ply")
    repartition(table)
    print(table.sort_values(by='nb_pt_prox'))


