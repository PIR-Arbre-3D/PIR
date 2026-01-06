# -*- coding: utf-8 -*-
"""
Created on Wed Dec 10 11:48:16 2025

@author: Formation
"""


import matplotlib.pyplot as plt
from random import random
import numpy as np
import tifffile



'''
def recup_vois(mat, x, y):
    l_r = []
    for i in range(-15, 16):
        for j in range(-15, 16):
            if i == 0 and j == 0:
                continue
            if 0 <= x + i < len(mat) and 0 <= y + j < len(mat):
                l_r.append(mat[x + i][y + j])
    return np.array(l_r, dtype='float32')
'''
    
# def recup_maxima_2(counts):
#     l_r = []
#     maxe = counts[0]
#     for i in range(1, len(counts)-1):
#         if maxe > counts[i]:
#             l_r.append(i-1)
#             maxe = counts[i]
#     if nb < counts[i]:
#         l_r.append(len(counts)-1)
#     return l_r

def recup_maxima(counts):
    l_r = []
    for i in range(1, len(counts) - 1):
        if counts[i] > counts[i - 1] and counts[i] > counts[i + 1]:
            l_r.append(i)
    return l_r


def mediane(val_max):
    trier=np.sort(val_max)
    
    if len(val_max) % 2 == 1:
        med = trier[(len(val_max)+1)//2 - 1]
    else:
        med = trier[len(val_max)//2 - 1]
    return med
    

def affichage(etude, bins, counts, peaks, t_bin, choix):
    if choix:
        # Affichage de l'histogramme et des pics détectés
        plt.hist(etude, bins=t_bin, edgecolor='black')
        
        # Affichage des maxima
        #plt.plot(bins[peaks], counts[peaks], "gx", label="Maxima")
        
        plt.title("Histogramme avec détection des maxima")
        plt.xlabel("Valeurs")
        plt.ylabel("Fréquence")
        plt.legend()
        plt.show()

def recup_vois(mat, x, y):
    l_r = []
    for i in range(1, 151):
        for j in range(1, 151):
            if i+j<16:
                if x+i<len(mat) and y+j<len(mat):
                    l_r.append(mat[x+i][y+j])
                if x-i>=0 and y+j<len(mat):
                    l_r.append(mat[x-i][y+j])
                if x+i<len(mat) and y-j>=0:
                    l_r.append(mat[x+i][y-j])
                if x-i<len(mat) and y-j>=0:
                    l_r.append(mat[x-i][y-j])

    return np.array(l_r, dtype='float32')
                

def construct_Echos(chemin_ini, chemin_out):

    taille = 20
    data = tifffile.imread(chemin_ini)


    dico_vois = {}
    dico_z = {}
    l_finale = []



    for x in range(0, len(data), 300):
        for y in range(0, len(data), 300):
            mat = recup_vois(data, x, y)
            if np.all(mat == 2000.0):
                pass
            else:
                mat_filtered = mat[mat != 2000.0]
                if len(mat_filtered)>10:
                    dico_vois[(x, y)] = mat_filtered
            
    t_bin = 15


    c = 0
    for clef in dico_vois:
        c+=1
            
        etude = dico_vois[clef]
        dico_z[clef] = []
        

        counts, bins = np.histogram(etude, bins=t_bin)
        indices = np.digitize(etude, bins) -1
        peaks = recup_maxima(counts)

        values_in_bins = [etude[indices == i] for i in peaks]
        # if c%10000 == 0:
        #     affichage(etude, bins, counts, peaks, t_bin, True)
        

        for val_max in values_in_bins:
            dico_z[clef].append(mediane(val_max))
            l_finale.append((clef[0], clef[1], mediane(val_max)))
            


    for k in range(6):
        matrice = np.ones((len(data), len(data)), dtype='f')*2000
        for i in range(len(data)):
            for j in range(len(data)):
                if (i, j) in dico_z:
                    if len(dico_z[(i, j)])>=k+1 and data[i,j] != 2000:
                        # temp.append(dico_z[(i, j)][k] * 255)
                        matrice[i, j] = dico_z[(i, j)][k]
        #tifffile.imwrite(f'C:\__DepthMap\Echos\image_reconstruite_{k}.tiff', matrice)
        tifffile.imwrite(chemin_out + f'image_reconstruite_{k}.tiff', matrice)
        
        # plt.imshow(matrice, cmap='gray')
        # plt.title("Masque binaire")
        # plt.show()
            
        