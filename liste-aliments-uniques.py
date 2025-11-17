import pandas as pd

#On charge notre dataset de pré-traité
df = pd.read_csv("menus_cantines_pretraite.csv", sep=";", dtype=str,  encoding="utf-8")

#Petite fonction pour normaliser les noms d'aliment
def clean(col):
    return (col
        .str.lower()
        .str.normalize('NFKD')
        .str.encode('ascii', errors='ignore')
        .str.decode('utf-8')
        .str.strip()
        .str.replace(r" +", " ", regex=True)
    )

df['Légumes_clean'] = clean(df['Légumes'])
df['Plat_clean'] = clean(df['Plat'])
df['Entrée_clean'] = clean(df['Entrée'])
df['Dessert_clean'] = clean(df['Dessert'])
df['Laitage_clean'] = clean(df['Laitage'])
df['Gouter_clean'] = clean(df['Gouter'])

legumes_prop = df['Légumes_clean'].dropna().unique()
print(len(legumes_prop))

plat_prop = df['Plat_clean'].dropna().unique()
print(len(plat_prop))
print(plat_prop)
