import pandas as pd

# === PARAMÈTRES ===
input_file = "menus-cantines.csv"
output_file = "menus_cantines_pretraite_v2.csv"

# === FONCTION POUR EXTRAIRE LES LABELS ===
def detect_labels(code):
    if pd.isna(code):
        return {"bio": False, "dur": False, "loc": False, "vege": False}
    
    code = code.upper().replace(" ", "")
    labels = code.split("/")

    return {
        "bio": any(l in ["BIO", "AB"] for l in labels),
        "dur": any(l in ["DUR", "BBC"] for l in labels),
        "loc": any(l == "LOC" for l in labels),
        "vege": any(l in ["VEGE", "SVP"] for l in labels)
    }

# === CHARGEMENT ===
df = pd.read_csv(input_file, sep=";", dtype=str,  encoding="utf-8")

# --- FILTRER LES JOURS INUTILES OU MUETS EN TERMES D'INFORMATIONS DE DONNEES --- sachant que les mots utilisés ne sont pas toujours tous écrits de la même façon, ou que la précision d'établissement fermé ou ne servant pas de menu pour un jour donné n'est pas toujours faite avec les mêmes chaînes de caractères exactement? ou aux endroits prévus à cet effet... 
df = df[~df["Commentaire jour"].str.upper().str.contains("FERIE|FERME|FERIÉ|FÉRIÉ|FERMÉ|PANIER", na=False)]
df = df[~df["Entrée"].str.upper().str.contains("FERIE|FERME|FERIÉ|FÉRIÉ|FERMÉ|PANIER|VACANCES", na=False)]
df = df[~df["Code_entrée"].str.upper().str.contains("FERIE|FERME|FERIÉ|FÉRIÉ|FERMÉ|PANIER", na=False)]



# Conversion date + tri
df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

# Supprimer les lignes où la date est manquante ou invalide
df = df.dropna(subset=["Date"])

df = df.sort_values("Date")

# On garde 1 ligne sur 3 (toujours la première)
df = df.iloc[::3].reset_index(drop=True)

# Colonnes d'intérêt
meal_components = [
    ("Code_entrée", "Entrée"),
    ("Code_plat", "Plat"),
    ("Code_légumes", "Légumes"),
    ("Code_laitage", "Laitage"),
    ("Code_dessert", "Dessert"),
    ("Code_gouter", "Gouter"),
    ("Code_gouter_02", "Gouter_02")
]

# === IDENTIFICATION VEGE (au niveau du JOUR, depuis le PLAT uniquement) ===
df["is_vege_day"] = df["Code_plat"].apply(lambda c: detect_labels(c)["vege"])

# === AJOUT DES LABELS PAR COMPOSANT DU REPAS ===
for code_col, food_col in meal_components:
    labels = df[code_col].apply(detect_labels)
    
    df[f"{food_col}_bio"] = labels.apply(lambda d: d["bio"])
    df[f"{food_col}_dur"] = labels.apply(lambda d: d["dur"])
    df[f"{food_col}_loc"] = labels.apply(lambda d: d["loc"])

# 1) Ajouter les colonnes "Année" et "Semaine" pour chaque ligne
df["Année"] = df["Date"].dt.year
df["Semaine"] = df["Date"].dt.isocalendar().week

# 2) Grouper par semaine et année pour vérifier s'il y a un plat végé dans la semaine
weekly_vege = df.groupby(["Année", "Semaine"])["is_vege_day"].any().reset_index()
weekly_vege = weekly_vege.rename(columns={"is_vege_day": "has_vege_week"})

# 3) Merge pour ajouter cette info à chaque ligne
df = df.merge(weekly_vege, on=["Année", "Semaine"], how="left")

# Maintenant chaque ligne a une colonne True/False si la semaine contient au moins un repas végé


# === SAUVEGARDE ===
df.to_csv(output_file, index=False, sep=";", encoding="utf-8-sig")

print(f"✅ Prétraitement terminé.\n→ Fichier créé : {output_file}")
