# ============================================================
# POINTNET REGRESSION - SCRIPT COMPLET (COPIER-COLLER)
# ============================================================

import os
import json
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader

# ============================================================
# 1. DATASET : CHARGEMENT DES FICHIERS
# ============================================================

def fix_number_of_points(points, max, target_n=512):
    """
    points : tensor (N, 3)
    retourne : tensor (target_n, 3)
    """
    n = points.shape[0]
    if n>max:
        max = n
    # print(n)
    if n == target_n:
        return points

    elif n > target_n:
        # Sous-échantillonnage aléatoire
        idx = torch.randperm(n)[:target_n]
        return points[idx]

    else:
        # Sur-échantillonnage (répétition)
        idx = torch.randint(0, n, (target_n,))
        return points[idx]


class PointCloudDatasetTrain(Dataset):
    max = 0
    def __init__(self, cloud_dir, param_dir):
        """
        cloud_dir : dossier contenant les fichiers .txt des nuages
        param_dir : dossier contenant les fichiers .json des paramètres
        """
        self.cloud_dir = cloud_dir
        self.param_dir = param_dir

        # Liste des fichiers de nuages
        self.files = sorted([
            f for f in os.listdir(cloud_dir)
            if f.endswith(".txt")
        ])

    def __len__(self):
        return len(self.files)

    def __getitem__(self, idx):
        # --- 1) Charger le nuage de points (.txt) ---
        cloud_file = self.files[idx]
        cloud_path = os.path.join(self.cloud_dir, cloud_file)

        # FORMAT ATTENDU :
        # x y z
        # x y z
        # ...
        points = np.loadtxt(cloud_path)          # (N, 3)
        points = torch.tensor(points, dtype=torch.float32)
        points = fix_number_of_points(points, PointCloudDatasetTrain.max, 500)

        # --- 2) Charger les paramètres (.json) ---
        # On suppose même nom de fichier
        param_file = cloud_file.replace(".txt", ".json")
        param_path = os.path.join(self.param_dir, param_file)

        # FORMAT ATTENDU :
        # { "parameters": [p1, p2, ..., pk] }
        with open(param_path, "r") as f:
            data = json.load(f)

        l = []
        for el in data:
            l.append(data[el])

        

        params = torch.tensor(
            l,
            dtype=torch.float32
        )

        # ----------------------------------------------------
        return points, params
    
class PointCloudDatasetTest(Dataset):
    max = 0
    def __init__(self, cloud_dir):
        """
        cloud_dir : dossier contenant les fichiers .txt des nuages
        """
        self.cloud_dir = cloud_dir

        # Liste des fichiers de nuages
        self.files = sorted([
            f for f in os.listdir(cloud_dir)
            if f.endswith(".txt")
        ])

    def __len__(self):
        return len(self.files)

    def __getitem__(self, idx):

        # --- 1) Charger le nuage de points (.txt) ---
        cloud_file = self.files[idx]
        cloud_path = os.path.join(self.cloud_dir, cloud_file)

        # FORMAT ATTENDU :
        # x y z
        # x y z
        # ...
        points = np.loadtxt(cloud_path)          # (N, 3)
        points = torch.tensor(points, dtype=torch.float32)
        points = fix_number_of_points(points, PointCloudDatasetTest.max, 500)

        # ----------------------------------------------------
        return points


# ============================================================
# 2. MODÈLE POINTNET (INCHANGÉ DANS 90 % DES CAS)
# ============================================================

class PointNetRegressor(nn.Module):
    def __init__(self, k):
        super().__init__()

        # MLP partagé sur chaque point
        self.fc1 = nn.Linear(3, 64)     # 3 = (x,y,z)
        self.fc2 = nn.Linear(64, 128)
        self.fc3 = nn.Linear(128, 128)

        # MLP global
        self.fc4 = nn.Linear(128, 64)
        self.fc5 = nn.Linear(64, k)     # k = nombre de paramètres

    def forward(self, x):
        # x : (batch, N, 3)

        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = F.relu(self.fc3(x))

        # Pooling (permutation invariant)
        x = torch.max(x, dim=1)[0]      # (batch, 128)

        x = F.relu(self.fc4(x))
        x = self.fc5(x)                 # (batch, k)

        return x


# ============================================================
# 3. ENTRAÎNEMENT
# ============================================================

def train(dataset):

    dataloader = DataLoader(
        dataset,
        batch_size=4,
        shuffle=True
    )

    # Taille du vecteur de paramètres
    k = len(dataset[0][1])

    model = PointNetRegressor(k)

    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.MSELoss()

    epochs = 200

    for epoch in range(epochs):
        total_loss = 0.0

        for points, params in dataloader:
            optimizer.zero_grad()
            preds = model(points)
            loss = criterion(preds, params)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        if epoch % 20 == 0:
            print(f"Epoch {epoch:03d} | Loss = {total_loss:.6f}")

    return model, dataset


# ============================================================
# 4. TEST SIMPLE
# ============================================================

def test(model, dataset):
    print("\n====== TEST ======\n")
    model.eval()

    with torch.no_grad():
        for i in range(len(dataset)):
            points, true_params = dataset[i]
            pred_params = model(points.unsqueeze(0)).squeeze(0)

            print(f"Nuage {i}")
            print("Vrais paramètres :", true_params.numpy())
            print("Prédits          :", pred_params.numpy())
            print()
            for j in range(34):
                print(f"ecart{j} : ", true_params.numpy()[j] - pred_params.numpy()[j])
            print("-" * 80)




def test2(model, dataset, output_folder="Test/predictions"):
    l_moy = []
    print("\n====== TEST ======\n")
    model.eval()

    # Crée le dossier s'il n'existe pas
    Path(output_folder).mkdir(parents=True, exist_ok=True)

    with torch.no_grad():
        for i in range(len(dataset)):
            points, true_params = dataset[i]
            pred_params = model(points.unsqueeze(0)).squeeze(0)

            # Conversion en numpy
            true_np = true_params.numpy()
            pred_np = pred_params.numpy()

            print(f"Nuage {i}")
            print("Vrais paramètres :", true_np)
            print("Prédits          :", pred_np)
            print()
            somme = 0
            for j in range(len(true_np)):
                somme += abs(true_np[j] - pred_np[j])
                print(f"ecart{j} : ", true_np[j] - pred_np[j])
            
            print('moy : ', somme)
            l_moy.append(somme)
            print("-" * 80)

            # Créer un dictionnaire avec les noms des paramètres
            param_names = [
                "norm_level","norm_length0","norm_length1","norm_length2","norm_lenght3",
                "norm_children0","norm_children1","norm_children2","norm_radius0",
                "norm_gnarliness0","norm_gnarliness1","signe_gnarliness1",
                "norm_gnarliness2","signe_gnarliness2","norm_gnarliness3","signe_gnarliness3",
                "norm_forceX","norm_forceY","norm_forceZ","norm_strength",
                "norm_start1","norm_start2","norm_start3",
                "norm_taper0","norm_taper1","norm_taper2","norm_taper3",
                "norm_twist0","norm_twist1","norm_twist2","norm_twist3",
                "norm_angle1","norm_angle2","norm_angle3"
            ]

            json_dict = {name: float(value) for name, value in zip(param_names, pred_np)}

            # Crée un fichier JSON pour ce nuage
            output_path = Path(output_folder) / f"nuage_{dataset.files[i][:-4]}.json"
            with open(output_path, "w") as f:
                json.dump(json_dict, f, indent=4)

            print(f"Fichier JSON créé : {output_path}")
        print(l_moy)


def load_and_predict(weights_path):
    # 1. Initialiser le modèle (doit avoir le même k que l'entraînement, ici 34)
    k = 34 
    model = PointNetRegressor(k)
    
    # 2. Charger les poids sauvegardés
    model.load_state_dict(torch.load(weights_path))
    model.eval() # Mode prédiction
    print(f"Modèle chargé depuis {weights_path}")

    return model


    
    

# ============================================================
# 5. MAIN
# ============================================================

if __name__ == "__main__":
    # '''  # Commenter lors de l'entrainement
    dataset = PointCloudDatasetTrain(
        cloud_dir="./Train/text/",   # <-- dossier des .txt
        param_dir="./Train/json/"    # <-- dossier des .json
    )
    # 1. Entraîner
    model, dataset = train(dataset)
    
    # 2. Sauvegarder les poids
    torch.save(model.state_dict(), "pointnet_arbre.pth")
    print("Succès : Modèle sauvegardé sous 'pointnet_arbre.pth'")

    '''
    
    model = load_and_predict(weights_path="pointnet_arbre.pth")
    
    new_dataset = PointCloudDatasetTest(
        cloud_dir="./Test/txt/",   # <-- dossier des .txt
    )
    

    # 3. Tester 
    test2(model, new_dataset)
    '''  # Commenter lors de l'apprentissage