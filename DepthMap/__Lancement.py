import os
import shutil
import get_Z

dirC = "C:/__DepthMap/"
dirInputInit = "./Input/"
dirOutputInit = "./Output/"

dirInputMD = dirC + "InputMD/"
dirOutputMD = dirC + "OutputMD/"

dirEchos = dirC + "Echos/"

dirInputD3 = dirC + "InputD3/"
dirOutputD3 = dirC + "OutputD3/"

print("\n####### Création de C:/__DepthMap #######\n\n")
# os.makedirs(r'C:\__DepthMap\InputMD')
# os.mkdir(r'C:\__DepthMap\OutputMD')
# os.mkdir(r'C:\__DepthMap\InputD3')
# os.mkdir(r'C:\__DepthMap\OutputD3')
# os.mkdir(r'C:\__DepthMap\Echos')

fichiers = os.listdir(dirInputInit) 
print("dir_input_ini", os.listdir(dirInputInit))

for e in fichiers :
    print(f"######## {e} ########")
    print("Déplacement")
    # Place le fichier ply en le renommant dans le dossier InputMD 
    shutil.move(dirInputInit + e, dirInputMD + "modele.ply")
    print("inputMD", os.listdir(dirInputMD))

    print("Lancement de MeshDepth :")
    # MeshDepth sort le resultat dans le dossier OutputMD
    os.system(r"MeshDepth.exe")

    print("Lancement simulation LiDAR :")
    # Code de Tom, lis le fichier dans OutputMD puis place tous les multi echos dans Echos
    get_Z.construct_Echos(dirOutputMD + 'modele_actual_depthmap.tiff', dirEchos)

    #with open(dirOutputInit + e[:-4] + "_point_cloud.txt", 'a') as pointCloud :
    with open(dirOutputInit + e[:-4] + "_normalise.txt", 'a') as pointCloud :
        # Prépare a ecrire dans le fichier global regroupant tous les multi echos 
        for echo in os.listdir(dirEchos) :
            shutil.move(dirEchos + echo, dirInputD3 + "modele_actual_depthmap.tiff")
            print("Lancement de Depth3D")
            os.system(r"Depth3D.exe")
            # Genere un echos
            with open(dirOutputD3 + 'modele_point_cloud.txt', 'r') as partialPointCloud :
                for l in partialPointCloud.readlines() :
                    pointCloud.write(l)
            os.remove(dirOutputD3 + 'modele_point_cloud.txt')
            os.remove(dirInputD3 + 'modele_actual_depthmap.tiff')

    # wait = input('pause')
    print("Redéplacement\n")
    shutil.move(dirInputMD + "modele.ply", dirInputInit + e)
    # shutil.move(dirOutputMD + "modele_actual_depthmap.tiff", dirOutputInit + e[:-4] + "_actual_depthmap.tiff")
    # shutil.move(dirOutputMD + "modele_color_image.png", dirOutputInit + e[:-4] + "_color_image.png")
    # shutil.move(dirOutputMD + "modele_normalised_depthmap.tiff", dirOutputInit + e[:-4] + "_normalised_depthmap.tiff")
    # shutil.move(dirOutputMD + "modele_actual_depthmap.txt", dirOutputInit + e[:-4] + "_point_cloud.txt")



print("\n####### Suppression de C:/__DepthMap #######\n")
# os.remove(dirOutputMD + "modele_color_image.png")
# os.remove(dirOutputMD + "modele_normalised_depthmap.tiff")
# os.remove(dirOutputMD + "modele_actual_depthmap.tiff")
# os.remove(dirOutputMD + "log.txt")
# os.rmdir(dirInputMD)
# os.rmdir(dirOutputMD)
# os.rmdir(dirEchos)
# os.rmdir(dirInputD3)
# os.rmdir(dirOutputD3)
# os.rmdir(dirC)