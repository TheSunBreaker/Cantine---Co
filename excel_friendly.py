import pandas as pd
import csv

# === PARAMÈTRES ===
input_file = "menus_cantines_pretraite_v2_prix.csv"
output_file = "menus_cantines_pretraite_v2_prix_excel_fiendly_norm.csv"

df = pd.read_csv(input_file, sep=";", dtype=str,  encoding="utf-8")


# Remplacer tous les retours à la ligne dans toutes les cellules par un espace
df = df.map(lambda x: x.replace('\n', ' ').replace('\r', ' ') if isinstance(x, str) else x)


# On réécrit le CSV avec :
# - séparateur ','
# - guillemets autour de toutes les cellules (quoting=csv.QUOTE_ALL)
# - encodage utf-8-sig pour Excel
df.to_csv(
    output_file,
    index=False,
    sep=",",
    encoding="utf-8-sig",
    quoting=csv.QUOTE_ALL
)
print(f"✅ Prétraitement terminé.\n→ Fichier créé : {output_file}")
