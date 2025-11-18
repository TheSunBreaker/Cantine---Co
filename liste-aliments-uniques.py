import pandas as pd
import re

# --- CONFIG ---
input_csv = "plats_extraits.csv"              # fichier source
output_csv = "plats_uniques.csv"     # fichier final
col_plat = "Plat"                    # nom de ta colonne
# ---------------

# Chargement du CSV
df = pd.read_csv(input_csv)

# Mise en minuscules
df[col_plat] = df[col_plat].astype(str).str.lower()

# Fonction pour séparer uniquement sur "ou" en tant que mot
def split_plats(texte):
    if not isinstance(texte, str):
        return []
    parts = re.split(r'\bou\b', texte)
    return [p.strip() for p in parts if p.strip()]

# Extraire tous les plats de toutes les lignes
all_plats = []
for texte in df[col_plat]:
    all_plats.extend(split_plats(texte))

# Retirer les doublons tout en gardant l'ordre d'apparition
plats_uniques = list(dict.fromkeys(all_plats))

# Export CSV final
pd.DataFrame({"Plat_unique": plats_uniques}).to_csv(output_csv, index=False)

print("Fichier généré :", output_csv)
