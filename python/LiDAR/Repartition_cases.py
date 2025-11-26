# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
import Lire_ply as ply
from scipy.spatial import cKDTree

def distance_euclidienne(x1, y1, z1, x2, y2, z2):
    return np.sqrt((x1 - x2)**2 + (y1 - y2)**2 + (z1 - z2)**2)


def repartition(df, radius = 0.15) :
    if 'carre' not in df.columns:
        df['carre'] = None
    if 'nb_pt_prox' not in df.columns:
        df['nb_pt_prox'] = 1  

    points = df[['x', 'y', 'z']].values
    tree = cKDTree(points)

    pairs = tree.query_pairs(radius)

    print("paires créées")
    c = 0
    d = 1

    for i, j in pairs:
        c +=1
        if c// 10000 == d :
            print(c)
            d+=1
        df.at[i, 'nb_pt_prox'] += 1
        df.at[j, 'nb_pt_prox'] += 1

    
    for index_i, row_i in df.iterrows():
        df.at[index_i, 'carre'] = (int(row_i['y']//0.03), int(row_i['x']//0.03))





if __name__ == "__main__" :
    table = ply.lecture_ply("test.ply")
    repartition(table)
    print(table.sort_values(by='nb_pt_prox'))


