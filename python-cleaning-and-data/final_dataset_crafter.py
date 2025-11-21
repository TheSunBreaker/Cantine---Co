import pandas as pd
import csv

# =====================================================================
# PARAMÈTRES
# =====================================================================
input_main = "menus_cantines_pretraite_v3.csv"               # Fichier prétraité (labels bio/loc/dur, etc.)
input_prices = "menus_cantines_pretraite_v2_prix.csv"        # Fichier contenant tous les prix
#output_file = "menus_cantines_final.csv"                     # Fichier final (avant normalisation Excel)
output_excel_friendly = "menus_cantines_final_v3_ultimate.csv"     # Fichier final normalisé Excel
output_star_log = "log_plats_etoiles.csv"                    # ← LOG des plats contenant '*'


# =====================================================================
# 1) CHARGEMENT DES DONNÉES
# =====================================================================

df = pd.read_csv(input_main, sep=";", dtype=str, encoding="utf-8")
# --- Chargement du fichier des plats uniques ---
df_unique = pd.read_csv("plats_classifies_synced.csv", dtype=str)
df_prices = pd.read_csv(input_prices, sep=";", dtype=str, encoding="utf-8")

# Vérification tailles identiques
assert len(df) == len(df_prices), \
    "❌ Les fichiers n'ont pas le même nombre de lignes. Alignement impossible."


# =====================================================================
# 2) GREFFAGE DES PRIX
# =====================================================================

price_cols = [
    "Prix_entree","Prix_plat","Prix_legumes","Prix_laitage",
    "Prix_dessert","Prix_gouter","Prix_gouter_02"
]

for col in price_cols:
    df[col] = df_prices[col]

# =====================================================================
# 3) NOUVELLE DÉTERMINATION DES JOURS VÉGÉ (PRIORITÉS + FUZZY MATCHING)
# =====================================================================

import re
import difflib
import pandas as pd

df_unique["Plat_unique"] = (
    df_unique["Plat_unique"]
    .astype(str)
    .str.lower()
    .str.strip()
)

# Dictionnaire exact : plat -> vegetarien(bool)
unique_dict = {
    row["Plat_unique"]: (str(row["vegetarien"]).strip().lower() == "true")
    for _, row in df_unique.iterrows()
}

unique_list = list(unique_dict.keys())   # pour fuzzy matching


# --- Fonction split identique à ton premier script ---
def split_plats(texte):
    if not isinstance(texte, str):
        return []
    parts = re.split(r'\bou\b', texte.lower())
    return [p.strip() for p in parts if p.strip()]


# --- Nettoyage de l’ancienne colonne végé ---
df["is_vege_day"] = df["is_vege_day"].apply(
    lambda x: str(x).strip().lower() == "true"
)


# --- Fuzzy matching sur un plat ---
def fuzzy_match(plat, threshold=0.85):
    """
    Retourne le plat unique le plus similaire à `plat`,
    seulement si la similarité est > threshold.
    Sinon retourne None.
    """
    if not plat:
        return None

    matches = difflib.get_close_matches(
        plat, unique_list, n=1, cutoff=threshold
    )
    return matches[0] if matches else None


# --- Fonction principale pour déterminer végé ou non ---
def compute_vege_status(row):
    # PRIORITÉ 1 : déjà vrai dans le dataset initial
    if row["is_vege_day"] is True:
        return True

    plat_raw = row["Plat"]

    # si plat vide / NaN → automatiquement False
    if pd.isna(plat_raw) or str(plat_raw).strip() == "":
        return False

    plat = str(plat_raw).lower()

    # PRIORITÉ 2 : présence de '*'
    if "*" in plat:
        return True

    # PRIORITÉ 3 : analyse des alternatives
    alternatives = split_plats(plat)

    for alt in alternatives:

        # 3a) exact match
        if alt in unique_dict:
            if unique_dict[alt] is True:
                return True
            continue

        # 3b) fuzzy match
        fuzzy = fuzzy_match(alt)
        if fuzzy:
            if unique_dict[fuzzy] is True:
                return True

    # aucune alternative végé
    return False


# --- Application globale ---
df["is_vege_day"] = df.apply(compute_vege_status, axis=1)

print("🌱 Nouvelle logique végé appliquée (priorité + fuzzy + gestion lignes vides)")

# =====================================================================
# 4) ANNÉE ISO + SEMAINE ISO
# =====================================================================

df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

df["Année"] = df["Date"].dt.year
df["AnnéeISO"] = df["Date"].dt.isocalendar().year
df["Semaine"] = df["Date"].dt.isocalendar().week

# =====================================================================
# 5) RECOMPUTE DES SEMAINES VÉGÉ (ISO)
# =====================================================================

weekly_vege = (
    df.groupby(["AnnéeISO", "Semaine"])["is_vege_day"]
    .any()
    .reset_index()
    .rename(columns={"is_vege_day": "has_vege_week"})
)

df = df.merge(weekly_vege, on=["AnnéeISO", "Semaine"], how="left")

# =====================================================================
# 6) SUPPRIMER LES DATES INVALIDES — **APRÈS TOUT LE RESTE**
# =====================================================================

df = df.dropna(subset=["Date"])

# =====================================================================
# 7) EXPORT EXCEL-FRIENDLY (CSV propre)
# =====================================================================

df2 = df.map(lambda x: x.replace('\n', ' ').replace('\r', ' ') if isinstance(x, str) else x)

df2.to_csv(
    output_excel_friendly,
    index=False,
    sep=",",
    encoding="utf-8-sig",
    quoting=csv.QUOTE_ALL
)

print(f"🎉 Export Excel-friendly terminé : {output_excel_friendly}")