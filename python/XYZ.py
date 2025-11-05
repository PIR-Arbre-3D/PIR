import matplotlib.pyplot as plt
import numpy as np
import random as rd

def somme (liste) :
    total = 0 
    for e in liste :
        total += e
    return total

def barycentre(liste) :
    x = liste[:,0]
    y = liste[:,1]
    z = liste[:,2]

    nb = len(liste)
    return [somme(x) / nb, somme(y) / nb, somme(z) / nb]

with open("python\Lille_11.xyz", "r") as f :
    points = np.array([list(map(float, line.rstrip('\n').split(' '))) for line in f])

nb_points = len(points)
fig = plt.figure()
ax = fig.add_subplot(projection='3d')

x = somme(points[:,0]) / nb_points
y = somme(points[:,1]) / nb_points
z_min = min(points[:,2]) 
print(z_min)

points = np.array([[p[0] - x, p[1] - y, p[2] - z_min] for p in points])

delta = 0.1

base = np.array([p for p in points if p[2] < z_min + delta])
hors_base = np.array([p for p in points if p[2] < z_min + 1])

delta = 0 
# print(base)
# while delta == 0 :
#     np.random.shuffle(base)
#     print(base)
#     ##centre du cercle circonscrit
#     M1 = np.array([ [base[0,0], base[0,1], 1],
#                     [base[1,0], base[1,1], 1],
#                     [base[2,0], base[2,1], 1]])
#     delta = np.linalg.det(M1)

# M2 = np.array([ [base[0,0]**2 + base[0,1]**2, base[0,1], 1],
#                 [base[1,0]**2 + base[1,1]**2, base[1,1], 1],
#                 [base[2,0]**2 + base[2,1]**2, base[2,1], 1]])

# M3 = np.array([ [base[0,0]**2 + base[0,1]**2, base[0,0], 1],
#                 [base[1,0]**2 + base[1,1]**2, base[1,0], 1],
#                 [base[2,0]**2 + base[2,1]**2, base[2,0], 1]])

# x0 = 1/(2*delta) * np.linalg.det(M2)
# y0 = -1/(2*delta) * np.linalg.det(M3)

K1 = base[0,0] **2 + base[0,1]**2
K2 = base[1,0] **2 + base[2,1]**2
K3 = base[2,0] **2 + base[2,1]**2

D = 2/(base[0,0]*(base[1,1] - base[2,1] + base[1,0]*(base[2,1] - base[0,1]) + base[2,0]*(base[0,1] - base[1,1])))

x0 = (K1*(base[1,1] - base[2,1]) + K2*(base[2,1] - base[0,1]) + K3*(base[0,1] - base[1,1])) / D
y0 = (K1*(base[2,0] - base[1,0]) + K2*(base[0,0] - base[2,0]) + K3*(base[1,0] - base[0,0])) / D


print(delta, x0, y0)
ax.scatter(base[:,0], base[:,1], base[:,2], s=0.1)
ax.scatter(hors_base[:,0], hors_base[:,1], hors_base[:,2], s=0.1)



b = barycentre(base)
ax.scatter(x0, y0, 0)
# plt.plot(points)
plt.show()