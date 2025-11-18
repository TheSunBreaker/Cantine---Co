import pandas as pd

# Chemin du fichier CSV d'origine
input_csv = 'menus_cantines_pretraite_v2.csv'

# Chemin du fichier CSV de sortie
output_csv = 'plats_extraits.csv'

# Lire le CSV d'origine
df = pd.read_csv(input_csv, sep=";", dtype=str,)

# Extraire la colonne "plat"
df_plats = df[['Plat']]

# Sauvegarder dans un nouveau CSV
df_plats.to_csv(output_csv, index=False, encoding="utf-8-sig")

print(f"La colonne 'plat' a été extraite et sauvegardée dans {output_csv}")
