import os
import json
import numpy as np
import matplotlib.pyplot as plt

predictions = os.listdir("predictions")
origines = [e[6:] for e in predictions]

params = {"norm_level" : [], "norm_length0" : [], "norm_length1" : [], "norm_length2" : [], "norm_lenght3" : [], "norm_children0" : [], "norm_children1" : [], "norm_children2" : [], "norm_radius0" : [], "norm_gnarliness0" : [], "norm_gnarliness1" : [], "signe_gnarliness1" : [], "norm_gnarliness2" : [], "signe_gnarliness2" : [], "norm_gnarliness3" : [], "signe_gnarliness3" : [], "norm_forceX" : [], "norm_forceY" : [], "norm_forceZ" : [], "norm_strength" : [], "norm_start1" : [], "norm_start2" : [], "norm_start3" : [], "norm_taper0" : [], "norm_taper1" : [], "norm_taper2" : [], "norm_taper3" : [], "norm_twist0" : [], "norm_twist1" : [], "norm_twist2" : [], "norm_twist3" : [], "norm_angle1" : [], "norm_angle2" : [], "norm_angle3" : []}

label = {"norm_level" : "Level", "norm_length0" : "Length 0", "norm_length1" : "Length 1", "norm_length2" : "Length 2", "norm_lenght3" : "Length 3", "norm_children0" : "Children 0", "norm_children1" : "Children 1", "norm_children2" : "Children 2", "norm_radius0" : "Radius 0", "norm_gnarliness0" : "Gnarliness 0", "norm_gnarliness1" : "Gnarliness 1", "signe_gnarliness1" : "Gnarliness Sign 1", "norm_gnarliness2" : "Gnarliness 2", "signe_gnarliness2" : "Gnarliness Sign 2", "norm_gnarliness3" : "Gnarliness 3", "signe_gnarliness3" : "Gnarliness Sign 3", "norm_forceX" : "Force X", "norm_forceY" : "Force Y", "norm_forceZ" : "Force Z", "norm_strength" : "Strength", "norm_start1" : "Start 1", "norm_start2" : "Start 2", "norm_start3" : "Start 3", "norm_taper0" : "Taper 0", "norm_taper1" : "Taper 1", "norm_taper2" : "Taper 2", "norm_taper3" : "Taper 3", "norm_twist0" : "Twist 0", "norm_twist1" : "Twist 1", "norm_twist2" : "Twist 2", "norm_twist3" : "Twist 3", "norm_angle1" : "Angle 1", "norm_angle2" : "Angle 2", "norm_angle3" : "Angle 3"}

for i in range(len(predictions)) :
    with open("Test/predictions/" + predictions[i]) as f :
        pred = json.load(f)
    with open("Test/json_origines/" + origines[i]) as f :
        orig = json.load(f)
    
    for p in params : 
        params[p].append(abs(pred[p] - orig[p])*100)
    
moy_params = {p : float(np.mean(params[p])) for p in params}
med_params = {p : float(np.median(params[p])) for p in params}

print(moy_params.keys())

ordre = params.keys()
dico_taille = {'l' : 15, '0' : 15, '1' : 15, '2' : 2, '3' : 2, 'X' : 2, 'Y' : 2, 'Z' : 2, 'h' : 2}
facteur = 20

fig, ax = plt.subplots( figsize=(15, 5))
ax.grid( zorder=0)

ax.boxplot([params[p]*100 for p in params], positions=range(len(ordre)), showmeans=True, showfliers=False, whis=[15,85])

ax.set_xticks(range(len(ordre)), labels=[label[o] for o in ordre])
ax.tick_params(axis='x', rotation=45)
plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')

ax.legend()
# ax.set_ylim(10,30)
ax.set_ylabel("Différence de prédiction (en %)")
ax.set_xlabel("Paramètres de génération")
# plt.xticks(rotation=60)
fig.tight_layout()
plt.show()

