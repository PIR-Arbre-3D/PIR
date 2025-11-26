# -*- coding: utf-8 -*-
"""
Created on Wed Nov 26 12:58:40 2025

@author: Formation
"""


import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle

def distance_euclidienne(x1, y1, z1, x2, y2, z2):
    return np.sqrt((x1 - x2)**2 + (y1 - y2)**2 + (z1 - z2)**2)

data = {
    'x': np.random.randint(0, 101, 1000),
    'y': np.random.randint(0, 101, 1000),
    'z': [0]*1000
}


df = pd.DataFrame(data)


if 'carre' not in df.columns:
    df['carre'] = None
if 'nb_pt_prox' not in df.columns:
    df['nb_pt_prox'] = 0  

for index_i, row_i in df.iterrows():
    df.at[index_i, 'carre'] = (row_i['y']//3, row_i['x']//3)
    for index_j, row_j in df.iloc[index_i+1:].iterrows():
        if distance_euclidienne(row_i['x'], row_i['y'], row_i['z'], row_j['x'], row_j['y'], row_j['z']) < 10:
            df.at[index_i, 'nb_pt_prox'] += 1
            df.at[index_j, 'nb_pt_prox'] += 1



print(df.sort_values(by='nb_pt_prox'))


