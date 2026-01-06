import os

fichiers = os.listdir("Fichiers_Bruts")

fichier_2 = [e for e in fichiers if os.path.getsize(f'Fichiers_Bruts/{e}')/1000 > 10500] 

for e in fichier_2 :
    os.remove(f"Fichiers_Bruts/{e}")

listePLY = [int(e[:-4].split(sep="_")[-1]) for e in fichiers if e[-4:] == ".ply"]
listeJSON = [int(e[:-5].split(sep="_")[-2]) for e in fichiers if e[-5:] == ".json"]

maxi = max(max(listePLY), max(listeJSON))
liste_finale = [e for e in listePLY if e in listeJSON]

enleverPLY = [e for e in listePLY if e not in liste_finale]
enleverJSON = [e for e in listeJSON if e not in liste_finale]

for e in fichiers: 
    if e[-4:] == ".ply" :
        ply = e[:- len(e.split('_')[-1])]

for e in fichiers: 
    if e[-5:] == ".json" :
        json = e[:- (len(e.split('_')[-2]) + len(e.split('_')[-1]) +1)]

for e in enleverPLY : 
    os.remove(f"Fichiers_Bruts/{ply}{e}.ply")

for e in enleverJSON :
    os.remove(f"Fichiers_Bruts/{json}{e}_normalise.json")

# print(liste_finale, len(liste_finale), maxi)
# print(enleverJSON, enleverPLY, len(fichier_2))
print(f"Tu as {len(liste_finale)}, il faut regénerer {maxi-len(liste_finale)} fichiers pour en avoir {maxi}, il vaut mieux en générer {round((maxi-len(liste_finale))*1.7)}")