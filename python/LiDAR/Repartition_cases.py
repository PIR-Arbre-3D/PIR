# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle
import Lire_ply as ply

def distance_euclidienne(x1, y1, z1, x2, y2, z2):
    return np.sqrt((x1 - x2)**2 + (y1 - y2)**2 + (z1 - z2)**2)


#### 40 sec jusqu'à 10
def repartition(df) :
    if 'carre' not in df.columns:
        df['carre'] = None
    if 'nb_pt_prox' not in df.columns:
        df['nb_pt_prox'] = 0  

    for index_i, row_i in df.iterrows():
        df.at[index_i, 'carre'] = (int(row_i['y']//3), int(row_i['x']//3))
        print(index_i)
        for index_j, row_j in df.iloc[index_i+1:].iterrows():
            if distance_euclidienne(row_i['x'], row_i['y'], row_i['z'], row_j['x'], row_j['y'], row_j['z']) < 10:
                df.at[index_i, 'nb_pt_prox'] += 1
                df.at[index_j, 'nb_pt_prox'] += 1


if __name__ == "__main__" :
    table = ply.lecture_ply("python/LiDAR/test.ply")
    repartition(table)
    print(table.sort_values(by='nb_pt_prox'))


