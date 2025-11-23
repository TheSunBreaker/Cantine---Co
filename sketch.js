let dataSet;

let canvas;

// Structure d'objets qui contiendra nos données en mémoire vive
let Table

// Assets éléments graphiques
let burger;
let olive;
let bretrave;
let lettuce;
let fromagePlusLegumes;
let meat;

// Date de début et de fin d'intervalle
let startDate
let endDate 

// Tableau des mois
const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

let startParts // ["2023","01","26"]
let endParts // ["2025","07","23"]

// Variables liées au réglage de l'intervalle de dates
let handle1Y, handle2Y;
let dragging1 = false;
let dragging2 = false;
let sliderX

// Variables liées aux dimensions de la zone curseur
let x;
let y;
let w;
let h;
let r; // profondeur de l’arrondi
let verticalStickMagins;
let verticalStickLong;
let timeStampStartDate;
let timeStampEndDate; 


// Des structures pour retenir les valeurs de pourcentages qui nous intéressent dans l'intervalle qui nous intéresse
let intervalDataWeNeed
let intervalDataVegeWeeksWeNeed
let sandwichEuros
const SANDWICHWIDTH = 500

// Tableau pou retenir les aléatoires des points du cercle rougr fait main
let randomForHandCirle
let lastUpdate
let step   // densité de points
let numPoints;  // nombre fixe de points


/*******************XXXXXXX GRAPHIQUE MARMITE */
// Variables et classes pour le graphique MARMITE
// ========== CONFIGURATION DU GRAPHIQUE ==========

// ========== CONFIGURATION DU GRAPHIQUE-MARMITE ==========
// ========== CONFIGURATION ==========
const CHART_CONFIG = {
  x: 0, y: 0, w: 0, h: 0,
  potTopY: 0, potBottomY: 0, potLeftX: 0, potRightX: 0, potWidth: 0,
  paddingLeft: 80, paddingRight: 50, paddingTop: 60, paddingBottom: 120,
  
  thresholds: { bio: 20, durable: 50, local: 50 },
  
  // Couleurs thème "cantine"
  colors: {
    bio: { line: '#528B4C', glow: '#0C5C03', food: '#6DAA2C'},
    durable: { line: '#CC4AA7', glow: '#CC4AA7', food: '#C7A76C' },
    local: { line: '#BA0085', glow: '#CC4AA7', food : '#D89B2A'},
    // pot: '#F15A29', potShine: '#FF9966', potDark: '#832C00',
    // Couleur crème genre
    pot: '#E6D4A8', potShine: '#F3E5B8', potDark: '#BFA16E', 
 
    // pot:      '#D4AF37',   // or principal
    // potShine: '#FFE39F',   // reflets lumineux
    // potDark:  '#8C6C13',   // ombre or foncé
    // pot:      '#C89B3C',   // or chaud
    // potShine: '#FFD27F',   // highlight plus chaud
    // potDark:  '#7A5A12',   // ombres bronze foncé
      
      // pot: '#757575',          // Gris métal marmite
      // potShine: '#bdbdbd',     // Reflets marmite
      // potDark: '#424242',      // Ombres marmite



    background: '#E0E0E0',
    fire: ['#ff6b00', '#ff8800', '#ffaa00', '#ffcc00', '#ffe066'],
    rock: '#5d4037', text: '#3e2723',
    liquidAbove: '#64b5f6',    // Bleu clair (zone conforme)
    liquidBelow: '#ff8a65',    // Orange-rouge (zone chaleur)
    threshold: '#ffd54f',      // Jaune pour la ligne de seuil
    foodGood: ['#7cb342', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b'],
    foodBad: '#d32f2f'
  }
};

function updateChartDimensions() {
  CHART_CONFIG.x = width * 0.25;
  CHART_CONFIG.y = height * 0.45;
  CHART_CONFIG.w = width * 0.60;
  CHART_CONFIG.h = height * 0.60;
  
  // Calculer les dimensions de la marmite
  CHART_CONFIG.potTopY = CHART_CONFIG.y + 40;
  CHART_CONFIG.potBottomY = CHART_CONFIG.y + CHART_CONFIG.h - 80;
  CHART_CONFIG.potLeftX = CHART_CONFIG.x + 30;
  CHART_CONFIG.potRightX = CHART_CONFIG.x + CHART_CONFIG.w - 30;
  CHART_CONFIG.potWidth = CHART_CONFIG.potRightX - CHART_CONFIG.potLeftX;
}

const WEEK = 7 * 24 * 60 * 60 * 1000;
const DAY  = 24 * 60 * 60 * 1000;

// Types d'aliments (formes simplifiées)
const FOOD_TYPES = ['carrot', 'meat', 'fish', 'corn', 'mushroom'];


// Type de données à afficher ('bio', 'durable', 'local')
let currentDataType = 'bio';

// Niveau d'agrégation actuel ('day', 'week', 'month')
let currentAggregation = 'day';

// Animation : progression du dessin de la courbe (0.0 à 1.0)
let animationProgress = 0;

const ANIMATION_SPEED = 0.015;

// Points de données transformés pour l'affichage
let chartPoints = [];

// Segments de courbe (pour gérer les discontinuités)
let curveSegments = [];

// État de l'animation
let isAnimating = true;

// ✅ Animation de l'épaisseur de la courbe (effet liquide)
let liquidAnimationTime = 0;

// ✅ Cluster d'aliments présentement survolé
let hoveredFoodCluster = null;


// Particules de feu
let fireParticles = [];
let fireIntensity = 1.0;  // 1.0 = normal, 2.0 = intense

// Bulles d'ébullition
let bubbles = [];

let vaporParticles = [];

// Clusters d'aliments (remplacent les points)
let foodClusters = [];

// Audio
let audioContext;

// ========== CLASSE PARTICULE DE FEU ==========
class FireParticle {
  constructor(x, y) {
    this.x = x + random(-20, 20);
    this.y = y;
    this.speedY = random(1, 3);
    this.size = random(10, 30);
    this.life = random(0.5, 1.0);
    this.maxLife = this.life;
    this.wobble = random(0, TWO_PI);
    this.colorIndex = floor(random(CHART_CONFIG.colors.fire.length));
  }
  
  update() {
    this.y -= this.speedY * fireIntensity;
    this.x += sin(this.wobble) * 2;
    this.wobble += 0.1;
    this.life -= 0.015 * fireIntensity;
    this.size *= 0.98;
  }
  
  display() {
    if (this.life <= 0) return;
    
    push();
    noStroke();
    const alpha = map(this.life, 0, this.maxLife, 0, 255);
    fill(CHART_CONFIG.colors.fire[this.colorIndex] + alpha.toString(16).padStart(2, '0'));
    
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = CHART_CONFIG.colors.fire[this.colorIndex];
    
    ellipse(this.x, this.y, this.size);
    
    drawingContext.shadowBlur = 0;
    pop();
  }
  
  isDead() {
    return this.life <= 0;
  }
}

// ========== CLASSE BULLE D'ÉBULLITION ==========
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(3, 8);
    this.speedY = random(0.5, 1.5);
    this.wobble = random(0, TWO_PI);
  }
  
  update() {
    this.y -= this.speedY;
    this.x += sin(this.wobble) * 0.5;
    this.wobble += 0.1;
  }
  
  display() {
    push();
    noFill();
    stroke(255, 255, 255, 150);
    strokeWeight(2);
    circle(this.x, this.y, this.size);
    pop();
  }
  
 
  isDead(surfaceY) { return this.y < surfaceY; }
}

// ========== CLASSE VAPEUR ==========
class VaporParticle {
  constructor(x, y) {
    this.x = x + random(-10, 10);
    this.y = y;
    this.speedY = random(0.5, 1);
    this.size = random(5, 15);
    this.life = random(0.8, 1.0);
    this.maxLife = this.life;
    this.wobble = random(0, TWO_PI);
  }
  
  update() {
    this.y -= this.speedY;
    this.x += sin(this.wobble) * 0.5;
    this.wobble += 0.08;
    this.life -= 0.01;
    this.size *= 1.02;
  }
  
  display() {
    if (this.life <= 0) return;
    push();
    noStroke();
    const alpha = map(this.life, 0, this.maxLife, 0, 180);
    fill(255, 255, 255, alpha);
    ellipse(this.x, this.y, this.size);
    pop();
  }
  
  isDead() { return this.life <= 0; }
}

// ========== CLASSE ALIMENT ==========
class FoodItem {
  constructor(point, index, totalPoints) {
    this.point = point;
    this.type = random(FOOD_TYPES);
    this.index = index;
    
    // Taille basée sur le budget (dayCost)
    this.baseSize = map(point.dayCost || 3, 2, 5, 12, 25);
    
    // Couleur selon conformité
    const threshold = CHART_CONFIG.thresholds[currentDataType];
    this.isGood = point.percentage >= threshold;
    
    // Position cible finale
    this.targetX = point.x;
    this.targetY = point.y;
    
    // Position initiale (en haut, hors écran)
    this.x = point.x;
    this.y = CHART_CONFIG.potTopY + 40;
    
    // Animation de chute - CORRECTION : délai basé sur progression normalisée
    this.fallDelay = (index / totalPoints) * 0.8; // S'étale sur 80% de l'animation
    this.hasFallen = false;
    this.velocity = 0;
    
    // Ébullition
    this.wobbleOffset = random(0, TWO_PI);
    this.rotationOffset = random(0, TWO_PI);
    this.rotation = 0;
  }
  
  update(progress) {
    // Animation de chute au début - CORRECTION : comparaison avec progression totale
    if (!this.hasFallen && progress >= this.fallDelay) {
      this.velocity += 0.8;
      this.y += this.velocity;
      
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.hasFallen = true;
        this.velocity = 0;
      }
    }
    
    // Ébullition continue une fois tombé
    if (this.hasFallen) {
      const wobble = sin(liquidAnimationTime + this.wobbleOffset) * 3;
      this.x = this.targetX + wobble;
      this.y = this.targetY + cos(liquidAnimationTime * 0.5 + this.wobbleOffset) * 2;
      this.rotation = sin(liquidAnimationTime + this.rotationOffset) * 0.2;
    }
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    // Couleur selon conformité
    const color = this.isGood ? 
      CHART_CONFIG.colors[currentDataType].food :
      CHART_CONFIG.colors.foodBad;
    
    fill(color);
    stroke(0, 0, 0, 100);
    strokeWeight(1);
    
    // Dessiner selon le type
    switch(this.type) {
      case 'carrot':
        this.drawCarrot();
        break;
      case 'meat':
        this.drawMeat();
        break;
      case 'fish':
        this.drawFish();
        break;
      case 'corn':
        this.drawCorn();
        break;
      case 'mushroom':
        this.drawMushroom();
        break;
    }
    
    pop();
  }
  
  drawCarrot() {
    beginShape();
    vertex(0, -this.baseSize);
    vertex(this.baseSize * 0.3, this.baseSize * 0.5);
    vertex(0, this.baseSize);
    vertex(-this.baseSize * 0.3, this.baseSize * 0.5);
    endShape(CLOSE);
    
    fill(100, 200, 100);
    ellipse(-this.baseSize * 0.2, -this.baseSize * 0.8, this.baseSize * 0.3, this.baseSize * 0.4);
    ellipse(this.baseSize * 0.2, -this.baseSize * 0.8, this.baseSize * 0.3, this.baseSize * 0.4);
  }
  
  drawMeat() {
    ellipse(0, 0, this.baseSize * 1.5, this.baseSize);
    fill(150, 50, 50);
    //ellipse(-this.baseSize * 0.3, 0, this.baseSize * 0.4, this.baseSize * 0.3);
    ellipse(this.baseSize * 0.3, 0, this.baseSize * 0.4, this.baseSize * 0.3);
  }
  
  drawFish() {
    ellipse(0, 0, this.baseSize * 1.5, this.baseSize);
    triangle(
      this.baseSize * 0.75, 0,
      this.baseSize * 1.2, -this.baseSize * 0.4,
      this.baseSize * 1.2, this.baseSize * 0.4
    );
    fill(0);
    circle(-this.baseSize * 0.4, -this.baseSize * 0.2, this.baseSize * 0.2);
  }
  
  drawCorn() {
    rect(-this.baseSize * 0.4, -this.baseSize * 0.6, this.baseSize * 0.8, this.baseSize * 1.2, this.baseSize * 0.2);
    stroke(200, 180, 0);
    for (let i = 0; i < 4; i++) {
      line(
        -this.baseSize * 0.3,
        -this.baseSize * 0.4 + i * this.baseSize * 0.4,
        this.baseSize * 0.3,
        -this.baseSize * 0.4 + i * this.baseSize * 0.4
      );
    }
  }
  
  drawMushroom() {
    arc(0, -this.baseSize * 0.2, this.baseSize * 1.5, this.baseSize, PI, 0);
    rect(-this.baseSize * 0.25, -this.baseSize * 0.2, this.baseSize * 0.5, this.baseSize * 0.8);
  }
  
  contains(mx, my) {
    return dist(mx, my, this.x, this.y) < this.baseSize * 1;
  }
}


/************************************************ */
// Variables et classes pour le sandwich chart 
// ========== CONFIGURATION DU SANDWICH ==========

// Hauteurs actuelles et cibles pour l'animation
let currentHeights = {
  tomato: 0,
  lettuce: 0,
  cheese: 0,
  meat: 0
};

let targetHeights = {
  tomato: 0,
  lettuce: 0,
  cheese: 0,
  meat: 0
};

// Vitesse de transition (interpolation)
let transitionSpeed = 0.1; // Entre 0 et 1 (0.1 = transition douce)


// Animation du prix sur la pancarte
let currentDisplayedPrice = 0;
let targetDisplayedPrice = 0;

// Hauteur totale disponible pour la garniture (en pixels)
let garnitureHeight = 0;



// ?????????????????????????????????????????????



// Pour obtenir l'année IS0 d'une date
function getISOYear(date) {
  // Copier la date pour ne pas la modifier
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  
  // Positionner au jeudi de la semaine ISO (référence ISO)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

  return d.getUTCFullYear();
}
// const date = new Date(timestamp);
// const isoYear = getISOYear(date);
// ou getISOYear(new Date("2021-01-01")); // ➜ 2020
/************************************************ */


// Pour convertir les chaînes booléennes en vrais booléens 
function toBool(x){

  return x === "True"
}

// Mise à jour des aléatoires pour les points du dessin du cercle rouge fait main
function randomForHandCirleUpdate(){

  randomForHandCirle = [];

  for (let i = 0; i < numPoints; i++) {
    // Rayon horizontal plus grand (aplatit)
    let rx = 130 + random(-4, 4);
    // Rayon vertical plus petit (aplatit)
    let ry = 80 + random(-4, 4);

    randomForHandCirle.push([rx, ry])
  }
}

// Fonction pour faire un cercle comme tracé à la main
function drawHandOval(cx, cy) {
  noFill();
  stroke(255, 80, 80);
  strokeWeight(2);

  beginShape();
  for (let i = 0; i < numPoints; i++) {
    let a = i * step;
    let rx = randomForHandCirle[i][0];
    let ry = randomForHandCirle[i][1];
    let x = cx + cos(a) * rx;
    let y = cy + sin(a) * ry;
    curveVertex(x, y);
  }
  endShape(CLOSE);
}



function preload() {


  // On charge le CSV avec loadTable(), séparateur ',' et reconnaissance des en-têtes
  dataSet = loadTable(
    "python-cleaning-and-data/menus_cantines_final_v3_ultimate.csv",
    "csv",
    "header"
  );

  // Chargement des assets images
  burgerImg = loadImage("Assets/burger-vege.png")
  olive = loadImage("Assets/olive-detouree.png")
  bretrave = loadImage("Assets/beterave.png")
  lettuce = loadImage("Assets/laitue.png")
  fromagePlusLegumes = loadImage("Assets/gros-tout-garniture.png")
  meat = loadImage("Assets/meat.png")



}

// Date en timeStamp
function dateStringToTimestamp(str) {
  const [year, month, day] = str.split("-");
  return new Date(year, month - 1, day).getTime();
}

// Convertir timeStamp en date chaîne
function timestampToDateString(ts) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

// Remplir la structure dont nous auront besoin pour construire les graphiques selon l'interval spécifié
function theDataForTheDataVizGraphicsCrafter(){

  // On va chercher la première ligne qui est inclue dans notre interval
  let expeditionner = 0
  
  // On initialise la structure tableaux à vide
  intervalDataWeNeed = []

  // Initialisation de la structure des coûts totaux du sandwich 
  sandwichEuros = {
    totalCost: 0,
    bioCost: 0,
    durableCost: 0,
    localOnlyCost: 0,
  }

  // Tant que la date sur laquelle on est est plus petite que la date de début d'intrval, on continue
  while(Table[expeditionner].Date < startDate){

    expeditionner ++
  }

  // On a trouvé une date supérieure ou égale à la date de début d'interval

  // Tant que la date où on est actuellement existe (donc sa ligne existe bien), est plus petite que ou égale à la date de fin d'intervalle, on fait ce qu'il y a à faire
  while(expeditionner < Table.length && Table[expeditionner].Date <= endDate){

    let toAdd = Table[expeditionner].statsData

    sandwichEuros.totalCost += Table[expeditionner].statsData.dayCost
    sandwichEuros.bioCost += Table[expeditionner].statsData.dayBioCost
    sandwichEuros.durableCost += Table[expeditionner].statsData.dayDurCost
    sandwichEuros.localOnlyCost += Table[expeditionner].statsData.dayLocOnlyCost

    toAdd['timeStamp'] = new Date(Table[expeditionner].Date).getTime();
    // On va ajouter la titmestamp du jour dans l'objet

    toAdd['week'] = parseInt(Table[expeditionner].Semaine)
    // Egalement le numéro de semaine ISO

    let splittedDate = (Table[expeditionner].Date).split("-")
    toAdd['month'] = parseInt(splittedDate[1]) - 1
    // Aussi le numéro de mois

    toAdd['calYear'] = parseInt(Table[expeditionner]['Année'])
    // L'année calendaire aussi,

    toAdd['year'] = parseInt(Table[expeditionner]['AnnéeISO'])
    // L'année ISO également



    intervalDataWeNeed.push(toAdd)

    expeditionner ++
  }

}


// Actualiser les dates de l'intervalle voulu
function intervalDatesActualization(){

  
  // Selon la position du curseur, on trouve la timeStamp associée (en castant d'un interval de pixels à un interval de timeStamps), qu'on convertit en date pour avoir la nouvelle date
  let newTimeStampStartDate = map(handle1Y, verticalStickMagins, height - verticalStickMagins, timeStampStartDate, timeStampEndDate)

  startDate = timestampToDateString(newTimeStampStartDate)


  // Selon la position du curseur, on trouve la timeStamp associée, qu'on convertit en date pour avoir la nouvelle date
  let newTimeStampEndDate = map(handle2Y, verticalStickMagins, height - verticalStickMagins, timeStampStartDate, timeStampEndDate)

  endDate = timestampToDateString(newTimeStampEndDate)

}


function setup() {
  
  canvas = createCanvas(1251, 573).parent("canvas1");
  observer.observe(canvas.elt.parentNode)

    
  //*************************************************** */
  //*************************************************** */
  //******************************* GESTION DES MACHINS POUR L'OVERLAY ******* */
  //*************************************************** */
  //*************************************************** */

  // --- Gestion des boutons ---
  const btnStats = document.getElementById("btnStats");
  const btnContexte = document.getElementById("btnContexte");
  const btVege = document.getElementById("btnVegeLud");
  const actionApp = document.querySelector(".action-appeal");

  btnStats.addEventListener("click", () => {
    document.querySelector("#trans-zone1").scrollIntoView({ behavior: "smooth" });
  });

  
  btVege.addEventListener("click", () => {
    document.querySelector("#trans-zone2").scrollIntoView({ behavior: "smooth" });
  });

  btnContexte.addEventListener("click", () => {
    document.querySelector("#overlay").scrollIntoView({ behavior: "smooth" });
  });

  actionApp.addEventListener("click", () => {
    document.querySelector("#trans-zone1").scrollIntoView({ behavior: "smooth" });
  });


  
  //*************************************************** */
  //*************************************************** */
  //******************************* FIN GESTION DES MACHINS POUR L'OVERLAY ******* */
  //*************************************************** */
  //*************************************************** */


  
  //*************************************************** */
  //*************************************************** */
  //******************************* DEBUT GESTION FRUIT ET LEGUMES DANSANT ******* */
  //*************************************************** */
  //*************************************************** */

    
  const OrVegeOrFruitobserver = new IntersectionObserver(callBackForVegeOrFruitObserver, {
    threshold: 0.6 // déclenche quand ~40% de l’élément est visible
  });

  const vegElements = document.querySelectorAll('.vege-from-ground');
  vegElements.forEach(el => {
    OrVegeOrFruitobserver.observe(el);
  });




  step = 0.3;
  numPoints = Math.floor(TWO_PI / step);
  randomForHandCirle = []
  verticalStickMagins = 50;

  verticalStickLong = height - 2 * verticalStickMagins;


  // On convertit les lignes de dataSet en objets JavaScript pour plus de commodité
  Table = [];

  ///**** Préparatif des opérations de mise à jour du carton menu */
  // Obtention de la date du jour en format ISO (YYYY/MM/DD)
  const TODAY = new Date();
  const day = String(TODAY.getDate()).padStart(2, '0');
  const month = String(TODAY.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
  const year = TODAY.getFullYear();
  const formattedToday = `${year}-${month}-${day}`;

  // Indexe de la ligne correspondant à la date idéale 
  let idealDateIndex = -1;
  // Booléen indiquant si on a trouvé la date idéale
  let foundIdealDate = false;

  // Initialisation de notre structure dédiée aux semaines
  intervalDataVegeWeeksWeNeed = {}

  let i; // Itérateur

  for (i = 0; i < dataSet.getRowCount(); i++) {
    let valuesRow = dataSet.getRow(i);
    let row = {};

    for (let col of dataSet.columns) {

      let raw = valuesRow.getString(col);

      // On converti en float, si c'est un prix
      if (col.includes("Prix_")) {

        raw = parseFloat(raw)
      }
      row[col] = raw
    }

    
    // Conversion explicite des colonnes booléennes
    row["is_vege_day"] = toBool(row["is_vege_day"]);
    row["Entrée_bio"] = toBool(row["Entrée_bio"]);
    row["Entrée_dur"] = toBool(row["Entrée_dur"]);
    row["Entrée_loc"] = toBool(row["Entrée_loc"]);
    row["Plat_bio"] = toBool(row["Plat_bio"]);
    row["Plat_dur"] = toBool(row["Plat_dur"]);
    row["Plat_loc"] = toBool(row["Plat_loc"]);
    row["Légumes_bio"] = toBool(row["Légumes_bio"]);
    row["Légumes_dur"] = toBool(row["Légumes_dur"]);
    row["Légumes_loc"] = toBool(row["Légumes_loc"]);
    row["Laitage_bio"] = toBool(row["Laitage_bio"]);
    row["Laitage_dur"] = toBool(row["Laitage_dur"]);
    row["Laitage_loc"] = toBool(row["Laitage_loc"]);
    row["Dessert_bio"] = toBool(row["Dessert_bio"]);
    row["Dessert_dur"] = toBool(row["Dessert_dur"]);
    row["Dessert_loc"] = toBool(row["Dessert_loc"]);
    row["Gouter_bio"] = toBool(row["Gouter_bio"]);
    row["Gouter_dur"] = toBool(row["Gouter_dur"]);
    row["Gouter_loc"] = toBool(row["Gouter_loc"]);
    row["Gouter_02_bio"] = toBool(row["Gouter_02_bio"]);
    row["Gouter_02_dur"] = toBool(row["Gouter_02_dur"]);
    row["Gouter_02_loc"] = toBool(row["Gouter_02_loc"]);
    row["has_vege_week"] = toBool(row["has_vege_week"]);


    //Accumulateur du total de coût d'un menu dans une journée
    let dayCost

    //Accumulateur du total de coût bio dans une journée
    let dayBioCost

    // ____________ du total de coût durable dans une journée
    let dayDurCost

    //_____________ du total de coût pour marque de terre source (qui est justement facultatif comme élément comptant comme critère pour produit durable)
    let dayLocCost

    let dayLocOnlyCost // On retiendra le coût uniquement local avant d'ajouter le durable

    // On additionne tous les coûts de la journée
    dayCost = row['Prix_entree'] + row['Prix_plat'] + row['Prix_legumes'] + row['Prix_laitage'] + row['Prix_dessert'] + row['Prix_gouter'] + row['Prix_gouter_02']

    // On additionne tous les coûts de la journée mais en multipliant cette fois chaque coût par le booléen indiquant si l'entité de menu concernée en bio (si c'est bio, le booléen vaudra 1, donc la multiplication donnera la valeur même, si c'est faux, le booléen vaudra 0, alors c coût ne sera pas comptabilisé)
    dayBioCost = row['Prix_entree'] * row['Entrée_bio'] + row['Prix_plat'] * row['Plat_bio'] + row['Prix_legumes'] * row['Légumes_bio'] + row['Prix_laitage'] * row['Laitage_bio'] + row['Prix_dessert'] * row['Dessert_bio'] + row['Prix_gouter'] * row['Gouter_bio'] + row['Prix_gouter_02'] * row['Gouter_02_bio']

    // Comme dans le cas précédent, sauf que les booléens considérés sont à la fois ceux déterminant si le produit est oui ou non durable, et également ceux déterminant s'il est bio
    dayDurCost = row['Prix_entree'] * (row['Entrée_bio'] || row['Entrée_dur']) + row['Prix_plat'] * (row['Plat_bio'] || row['Plat_dur']) + row['Prix_legumes'] * (row['Légumes_bio'] || row['Légumes_dur']) + row['Prix_laitage'] * (row['Laitage_bio'] || row['Laitage_dur']) + row['Prix_dessert'] * (row['Dessert_bio'] || row['Dessert_dur']) + row['Prix_gouter'] * (row['Gouter_bio'] || row['Gouter_dur']) + row['Prix_gouter_02'] * (row['Gouter_02_bio'] || row['Gouter_02_dur'])

    // Comme pour le cas bio, sauf qu'ici on considère les booléens indiquant si oui ou non marque de terre source
    dayLocCost = row['Prix_entree'] * row['Entrée_loc'] + row['Prix_plat'] * row['Plat_loc'] + row['Prix_legumes'] * row['Légumes_loc'] + row['Prix_laitage'] * row['Laitage_loc'] + row['Prix_dessert'] * row['Dessert_loc'] + row['Prix_gouter'] * row['Gouter_loc'] + row['Prix_gouter_02'] * row['Gouter_02_loc']

    dayLocOnlyCost = dayLocCost // On retient le coût uniquement local avant d'ajouter le durable

    dayLocCost = dayLocCost + dayDurCost // Cas où on intègre Marque de Terre Source comme critère durable

    // On peut ajouter ces nouvelles données comme 'colonne' supplémentaire de la ligne
    row.statsData = { dayCost, dayBioCost, dayDurCost, dayLocCost, dayLocOnlyCost };

    Table.push(row);

    // On verifie si la date d'aujoud'hui est antérieure ou égale à la date de la ligne courrante, auquel cas on prendra cette date comme date idéale
    if (!foundIdealDate && formattedToday <= row['Date']) {

      idealDateIndex = i
      foundIdealDate = true 
    
    }
  
    
    // On initialise une variable qui retiendra la semaine précisée de son année ISO, à laquelle appartient le jour current. Elle servira de clé dans le tableau des semaines de l'intervalle selectionné. Cette semaine précise, si elle existe pas déjà dans le tableau comme clé, sera donc créée. Si elle existe, on ajoute l'indice dans Table du jour en question au tableau
    let currWeek = `${Table[i]['AnnéeISO']}-${Table[i]['Semaine']}`;

    (intervalDataVegeWeeksWeNeed[currWeek] ??= []).push(i)// Cette écriture va, si la clé existe pour l'objet simplement ajouter via push ce qu'on veut ajouter, sinond d'abord créer la clé qui sera initialisée à vide, puis ensuite push

  }

  // On prend la première date de notre dataset par défaut
  startDate = Table[0]['Date']
  timeStampStartDate = dateStringToTimestamp(startDate)

  // ___________ dernière _________________________________
  endDate = Table[Table.length - 1]['Date'];
  timeStampEndDate = dateStringToTimestamp(endDate)

  startParts = startDate.split('-'); // ["2023","01","26"]
  endParts = endDate.split('-');     // ["2025","07","23"]


  /////////************ Opérations pour mise à jour de carton menu d'acceuil */

  if (!foundIdealDate) {
    // Si on a pas trouvé de date idéale, on prend la dernière date du dataset
    idealDateIndex = i - 1
  }

  // On vérifie si la date idéale trouvée est aujourd'hui ou demain ou hier
  let idealDate = Table[idealDateIndex]['Date'];

  const idealDateDate = new Date(idealDate);

  // On normalise les dates pour ne garder que année/mois/jour
  const normalizedToday = normalize(TODAY);
  const normalizedIdealDate = normalize(idealDateDate); 

  // On convertit les deux dates en timeStamps pour faire la différenc
  const diffInMs = normalizedIdealDate - normalizedToday;
  const diffInDays = diffInMs / DAY; 

  let textForMenuDateAreaDateZone = "";

  // On remplit le texte selon le cas
  if (diffInDays === 0) {
      console.log("Même jour");
      textForMenuDateAreaDateZone = "'aujourd'hui";
  } else if (diffInDays === -1) {
      console.log("La date est la veille");
      textForMenuDateAreaDateZone = "'hier";
  } else if (diffInDays === 1) {
      console.log("La date est le lendemain");
      textForMenuDateAreaDateZone = "e demain";
  } else {
      console.log("Cette date n'est ni hier, ni aujourd'hui, ni demain");
      textForMenuDateAreaDateZone = `u ${idealDateDate.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })}`;
  }

  const menuDateArea = document.querySelector("#menu-date-area");

  // Mise à jour du texte avec la date du jour
  menuDateArea.innerText = `(Menu d${textForMenuDateAreaDateZone})`;

  // Puis, on rempli le carton de menu avec les données de la ligne idéale
  const menuData = {
      entrée: Table[idealDateIndex]['Entrée'],
      plat: Table[idealDateIndex]['Plat'],
      légume: Table[idealDateIndex]['Légumes'],
      laitage: Table[idealDateIndex]['Laitage'],
      dessert: Table[idealDateIndex]['Dessert'],
      gouter1: Table[idealDateIndex]['Gouter'],
      gouter2: Table[idealDateIndex]['Gouter_02']
  };

  // Strcuture qui déterminera le nom du fichier à prendre pour l'image badge du menu selon si oui ou non végé, et qui marquera ou non une classe 'nonvege' en fonction
  let vegeBadge = Table[idealDateIndex].is_vege_day ? ["laitue-choux", ""] : ["viande", "nonvege"];


  updateWelcomePageMenu(menuData, vegeBadge);



  // Position initiale des deux poignées
  handle1Y = height * 0.3;
  handle2Y = height * 0.7;

  // On actualise déjà les dates pour avoir les bons TimeStamps et déjà faire les premiers calculs des pourcentages
  intervalDatesActualization()

  // On craft une première fois les données qui nous intéressent pour nos smart graphiques selon l'interval 
  theDataForTheDataVizGraphicsCrafter()



  // On construit une première fois les aléatoires des points du cercle fait main
  randomForHandCirleUpdate();
  lastUpdate = millis();


  //Textes font
  textFont("Inter");  // Juste le nom de la police
  

  //**********************POUR LE POTGRAPHIQUE */
  // Updater les dimensions du graphique
  updateChartDimensions();
  
  // Déterminer le niveau d'agrégation optimal
  determineAggregation();
  
  // Transformer les données en points du graphique
  calculateChartPoints();

  // On créé les foodclsuters
  createFoodClusters();
  
  // Interface utilisateur pour changer le type de données
  createControls();

  
  // Initialiser l'audio
  audioContext = new (window.AudioContext || window.webkitAudioContext)();



  //**********************POUR LE FLOATING SANDWICH CHART */
  // Initialiser la hauteur de la garniture
  
  // Récupérer la hauteur de la div "garniture"
  let garnitureDiv = select('.garniture');
  if (garnitureDiv) {
    garnitureHeight = garnitureDiv.size().height;
  }
  
  // Calculer les hauteurs initiales
  updateTargetHeights();
  
  // Initialiser les hauteurs actuelles aux valeurs cibles (pas d'animation au départ)
  currentHeights = {...targetHeights};
  
  // Créer les éléments SVG pour chaque couche
  createSandwichLayers();

  // Initialiser le prix affiché aux valeurs cibles (aucune animation au départ)
  currentDisplayedPrice = sandwichEuros.totalCost;
  targetDisplayedPrice = sandwichEuros.totalCost;


  // Pour du deboogage potentiel
  for (let line of Table){

    console.log(line.Date)
    console.log(line.statsData)
  }

  console.log(startDate)
  console.log(endDate)
  console.log(Table.length)


  // Quand tout est setup ici, on lance le sketch2
  new p5(sketchVege);

}

// Normaliser une date en année/mois/jour, simplement 
function normalize(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Fonction de mise à jour du carton de menu de la première page
function updateWelcomePageMenu(data, badge) {
    const container = document.getElementById("menuContent");
    const bigMotherMenuContainer = document.querySelector(".menu-container");
    let html = "";

    for (const key in data) {
        if (data[key] !== "") {
            html += `
                <div class="menu-item">
                    <div class="menu-item-name">
                        ${key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                    <div class="menu-item-value">${data[key].charAt(0).toUpperCase() + data[key].slice(1)}</div>
                </div>
            `;
        }
    }

    container.innerHTML = html;
    bigMotherMenuContainer.innerHTML += `<img src="Assets/${badge[0]}.png" alt="végé ou pas végé" class="vege-badge-or-not">`
    bigMotherMenuContainer.className += " " + badge[1];
}

// Fonction de dessin des olives selecteurs
function drawOlive(x, y, w = 30, h = 18) {
  // 1) Corps vert
  noStroke();
  fill(60, 180, 60);
  ellipse(x, y, w, h);

  // 2) Trou noir (légèrement décalé pour effet 3D)
  fill(20); // noir profond
  ellipse(x + w*0.3, y, w*0.35, h*0.35);
}

function drawSandwichLabel(x, y, label = "Poulet", color = "#000") {
  push();
  //textFont('Caveat');
  translate(x, y);
  rotate(-PI / 24); // Légère inclinaison pour effet dynamique

  // Style
  stroke("gold");
  fill(255, 240, 200);
  strokeWeight(2);

  // --- 1) Le petit cercle de l'étiquette ---
  let r = 18; // rayon de la pastille
  ellipse(0, 0, r * 5, r * 2);

  // --- 2) Le pic en bois ---
  stroke(160, 120, 60);
  strokeWeight(4);
  line(0, r, 0, r + 20); // la tige

  // --- 3) Le texte au centre ---
  noStroke();
  fill(color);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(9);
  text(label, -27, 0);

  pop();
}


function drawPlacard(x, y, price) {

  push();
  textFont('Caveat');
  textAlign(CENTER, CENTER);
  rectMode(CENTER);

  // --- Ombre au sol ---
  noStroke();
  fill(0, 50); // légère transparence
  ellipse(x, y + 80, 80, 20);

  // --- Pique (pied) ---
  fill(139, 69, 19);
  beginShape();
  vertex(x - 8, y + 20);   // gauche haut
  vertex(x + 8, y + 20);   // droite haut
  vertex(x, y + 90);       // bas pointu
  endShape(CLOSE);

  // --- Planche de la pancarte ---
  fill(255, 240, 200);
  stroke(150, 100, 50);
  strokeWeight(3);
  rect(x, y - 10, 160, 80, 10);

  // --- Texte du prix ---
  noStroke();
  fill(0);

  // Symbole euro plus gros
  textSize(38);
  text("€", x - 43, y - 10);

  // Montant
  textSize(30);
  text(price, x + 12, y - 10);

  // Infos de précision
  let detailsText = `* Du ${startParts[2]} ${months[parseInt(startParts[1]) - 1]} ${startParts[0]} au ${endParts[2]} ${months[parseInt(endParts[1]) - 1]} ${endParts[0]}`;
  textSize(10);
  text(detailsText, x, y-35);
  textSize(11);
  text("De repas, par élève, servis", x, y + 15);

  pop();
}

// Fonction de dessin principale
function draw() {
  
  background(CHART_CONFIG.colors.background);

  // Mise en place de la zone curseur
  
  noStroke();
  // fill(224,224,224);


  x = 0;
  y = 0;
  w = 600;
  h = height;
  r = h/2 * 1.3; // profondeur de l’arrondi

  // beginShape();

  // // Coin haut gauche -> haut droit interne
  // vertex(x, y);
  // vertex(x + w, y);

  // // Arc concave vers l’intérieur (côté droit)
  // let cx = x + w;       // centre de l’arc (côté droit du rectangle)
  // let cy = y + h / 2;
  
  // // Échantillonne l’arc de -90° à +90°
  // for (let a = -HALF_PI; a <= HALF_PI; a += 0.05) {
  //   let vx = cx - r * cos(a);  // soustraction = concave
  //   let vy = cy + r * sin(a);
  //   vertex(vx, vy);
  // }

  // // Coin bas droit interne -> bas gauche
  // vertex(x + w, y + h);
  // vertex(x, y + h);

  // endShape(CLOSE);

  
  // CURSEUR À DEUX POIGNÉES
  sliderX = x + w - 500; // position horizontale du curseur
  let sliderY1 = verticalStickMagins;
  let sliderY2 = height - verticalStickMagins;

  const sliderAreaHalfWidth = 5
  
  // Aire du slider
  push()
  fill(222, 184, 135)
  strokeWeight(2)
  stroke("black")
  rect(sliderX - sliderAreaHalfWidth, verticalStickMagins - 5, sliderAreaHalfWidth * 2, height - 2 * verticalStickMagins + 5 * 2, 30)
  pop()

 // Gros volume entre poignées 1 et 2
  stroke(129, 77, 11)
  strokeWeight(9);
  line(sliderX, handle1Y, sliderX, handle2Y)

  // Barre verticale
  stroke(0);
  strokeWeight(2);
  //line(sliderX, sliderY1, sliderX, sliderY2);

  push();
  // Burger slider
  imageMode(CENTER);
  image(burgerImg, sliderX, height - verticalStickMagins + 50, 200, 100)
  pop();

  strokeWeight(1);

  // // Poignée 1
  // strokeWeight(6);
  // line(sliderX - 15, handle1Y, sliderX + 15, handle1Y);

  // // Poignée 2
  // line(sliderX - 15, handle2Y, sliderX + 15, handle2Y);

  // Poignée 1
  // drawOlive(sliderX, handle1Y);
  image(olive, sliderX - 15, handle1Y - 9, 30, 18);
  // Poignée 2
  // drawOlive(sliderX, handle2Y);
  image(olive, sliderX - 15, handle2Y - 9, 30, 18);


 

  // // Dates avec police stylée, légèrement décalées
  // textSize(18)
  // text(startDate, sliderX + 20, handle1Y - 5);
  // text(endDate, sliderX + 20, handle2Y - 5);

//***** MISE EN PLACE DES ARDOISES DE DATE

push()
textAlign(CENTER, CENTER);
textSize(16);
textFont('Caveat');

startParts = startDate.split('-'); // ["2023","01","26"]
endParts = endDate.split('-');     // ["2025","07","23"]

// Dessiner ardoise stylisée
fill(15, 23, 42); // couleur ardoise marron foncé
stroke(0);
strokeWeight(0);

// START / END rectangles dimensions & positions (réutilisées plus bas)
let rectW = 120;
let rectH = 50;

// Il faut controller que les ardoises ne débordent pas hors du cadre. On va le faire avec constrain
let rect1X = sliderX + sliderAreaHalfWidth + 7; // + 3
let rect1Y = constrain(handle1Y - 50, 0, height - 2 * rectH); // On prend en compte la taille de l'autre adroise potentiellement, si on est bas
let rect2X = sliderX + sliderAreaHalfWidth + 7; // + 3
let rect2Y = constrain(handle2Y, rectH, height - rectH); // On prend en compte la taille de l'autre adroise potentiellement, si on est hauts

rect(rect1X, rect1Y, rectW, rectH, 10, 10, 10, 0);   // pour startDate
rect(rect2X, rect2Y, rectW, rectH, 0, 10, 10, 10); // pour endDate

// Texte principal
fill(255); // blanc par défaut
noStroke();
textAlign(CENTER, CENTER);


// calculs adaptatifs selon la largeur du rectangle
let spacing = rectW * 0.22; // distance horizontale entre jour, mois, année
let textScale = map(rectW, 120, 300, 12, 20); // taille du texte selon largeur
textSize(textScale);

// --- START DATE ---
push();
translate(rect1X + rectW / 2, rect1Y + rectH / 2); // centre du rectangle
text(startParts[2], -spacing, 0); // jour à gauche
fill(255, 200, 0); // couleur différente pour le mois
rotate(-PI/12); // légère inclinaison
text(months[parseInt(startParts[1]) - 1], 0, 0); // mois au centre
fill(255);
rotate(PI / 12);
text(startParts[0], spacing, 0); // année à droite
pop();

// End date
push();
translate(rect2X + rectW / 2, rect2Y + rectH / 2);
text(endParts[2], -spacing, 0); // jour
fill(0, 200, 255);
rotate(-PI / 12);
text(months[parseInt(endParts[1]) - 1], 0, 0);
fill(255);
rotate(PI / 12);
text(endParts[0], spacing, 0); // Année
pop();

pop(); // fin globale

// --- "Du" et "Au" --- en coin haut-gauche de chaque rectangle
fill("red");
textSize(18);
textAlign(LEFT, TOP);

text("Du", rect1X + 8, rect1Y + 5);
text("Au", rect2X + 8, rect2Y + 5);


//*****FIN PARTIE ARDOISES */

  // Entourages "fait main"

  if (millis() - lastUpdate > 1000){

    // On met à jour le cercle chaque 1 seconde
    randomForHandCirleUpdate()
    lastUpdate = millis()
  }

  drawHandOval(sliderX + 20, handle1Y - 5);
  drawHandOval(sliderX + 20, handle2Y - 5);


  intervalDatesActualization();

  noStroke();

  ellipse(500, height * 0.15, 20, 20)


  /********************************** POUR LE PLOT GRAPHIQUE */

  // Mettre à jour l'animation
  if (isAnimating && animationProgress < 1.0) {
    animationProgress += ANIMATION_SPEED;
    if (animationProgress >= 1.0) {
      animationProgress = 1.0;
      isAnimating = false;
    }
  }

  // Réduire progressivement l'intensité du feu
  if (fireIntensity > 1.0) {
    fireIntensity = lerp(fireIntensity, 1.0, 0.02);
  }

  // ✅ Mettre à jour l'animation liquide (toujours active)
  liquidAnimationTime += 0.05;

  // Dessiner
  drawRocks();
  drawFire();
  drawPot();
  drawChart();
  
  // ✅ Vérifier le survol APRÈS avoir dessiné (pour afficher le tooltip par-dessus)
  checkHover();
  
  // ✅ Afficher le tooltip si un point est survolé
  if (hoveredFoodCluster !== null) {
    drawTooltip(hoveredFoodCluster);
  }

  //drawInstructions();


  /********************************** POUR LE SANDWICH */

  
  // Interpolation douce vers les hauteurs cibles
  currentHeights.tomato = lerp(currentHeights.tomato, targetHeights.tomato, transitionSpeed);
  currentHeights.lettuce = lerp(currentHeights.lettuce, targetHeights.lettuce, transitionSpeed);
  currentHeights.cheese = lerp(currentHeights.cheese, targetHeights.cheese, transitionSpeed);
  currentHeights.meat = lerp(currentHeights.meat, targetHeights.meat, transitionSpeed);

  // Animation du prix sur la pancarte
  currentDisplayedPrice = lerp(currentDisplayedPrice, targetDisplayedPrice, transitionSpeed);
  
  // Mettre à jour l'affichage des couches
  updateSandwichLayers();
  
  // Mettre à jour la pancarte avec le prix animé
  updatePlacard();

  // Dessiner les étiquettes du sandwich

  // Etiquette bio
  drawSandwichLabel(width * 0.34, 25, "Bio :", "#528B4C");
  let wIm = 50; // largeur désirée
  let hIm = bretrave.height * (wIm / bretrave.width); // hauteur calculée automatiquement
  push()
  translate(width * 0.34 + 15, 20);
  rotate(-PI / 24);
  image(bretrave, -28, -2, wIm, hIm);
  pop()

  
  // Etiquette durable
  drawSandwichLabel(width * 0.42, 25, "Dur :", "#CC4AA7");

  
  wIm = 50; // largeur désirée
  hIm = lettuce.height * (wIm / lettuce.width); // hauteur calculée automatiquement
  push()
  translate(width * 0.42 + 15, 20);
  rotate(-PI / 24);
  image(lettuce, -28, 0, wIm, hIm);


  wIm = 50; // largeur désirée
  hIm = bretrave.height * (wIm / bretrave.width); // hauteur calculée automatiquement
  image(bretrave, -28, -6, wIm, hIm);

  pop()

  // Etiquette durable incluant local
  drawSandwichLabel(width * 0.50, 25, "Dur(+\nMTS) :", "#BA0085");
  wIm = 50; // largeur désirée
  hIm = fromagePlusLegumes.height * (wIm / fromagePlusLegumes.width); // hauteur calculée automatiquement
  push()
  translate(width * 0.50 + 15, 20);
  rotate(-PI / 24);
  image(fromagePlusLegumes, -28, -6, wIm, hIm);
  pop()

  // Etiquette reste
  drawSandwichLabel(width * 0.58, 25, "Autre :");
  wIm = 50; // largeur désirée
  hIm = meat.height * (wIm / meat.width); // hauteur calculée automatiquement
  push()
  translate(width * 0.58 + 15, 20);
  rotate(-PI / 24);
  image(meat, -26, -2, wIm, hIm);
  pop()

}


/********************************************** */
/**************DEBUT ZONE FONCTIONS CHARTPOT */
/********************************************** */

// ========== DÉTERMINER LE NIVEAU D'AGRÉGATION ==========
function determineAggregation() {

  const numDays = intervalDataWeNeed.length;
  if (numDays < 90) currentAggregation = 'day';
  else if (numDays < 180) currentAggregation = 'week';
  else currentAggregation = 'month';
}

// ========== AGRÉGATION DES DONNÉES PAR PÉRIODE (VERSION OPTIMISÉE) ==========
function aggregateData() {
  if (intervalDataWeNeed.length === 0) return [];
  
  // Si on affiche par jour, retourner les données telles quelles
  if (currentAggregation === 'day') {
    return intervalDataWeNeed.map(day => ({
      ...day,
      aggregatedFrom: 1  // 1 jour = pas d'agrégation
    }));
  }
  
  const aggregated = [];
  
  if (currentAggregation === 'week') {
    // ✅ OPTIMISÉ : Agréger par semaine en utilisant le champ pré-calculé
    let currentWeek = null;
    let currentYear = null;
    let weekData = [];
    
    intervalDataWeNeed.forEach((day, index) => {
      // ✅ Lecture directe des champs pré-calculés (pas de création de Date)
      const weekNum = day.week;
      const year = day.year; // Année nécessaire pour différencier semaine 1 de 2024 vs 2025
      
      // Nouvelle semaine détectée
      if (currentWeek === null || weekNum !== currentWeek || year !== currentYear) {
        // Sauvegarder la semaine précédente si elle existe
        if (weekData.length > 0) {
          aggregated.push(calculateAverage(weekData));
        }
        
        // Commencer une nouvelle semaine
        currentWeek = weekNum;
        currentYear = year;
        weekData = [day];
      } else {
        weekData.push(day);
      }
      
      // Dernière semaine
      if (index === intervalDataWeNeed.length - 1 && weekData.length > 0) {
        aggregated.push(calculateAverage(weekData));
      }
    });
    
  } else if (currentAggregation === 'month') {
    // ✅ OPTIMISÉ : Agréger par mois en utilisant le champ pré-calculé
    let currentMonth = null;
    let currentYear = null;
    let monthData = [];
    
    intervalDataWeNeed.forEach((day, index) => {
      // ✅ Lecture directe des champs pré-calculés
      const monthNum = day.month; // 0-11
      const year = day.calYear; // Année calendaire
      
      // Nouveau mois détecté
      if (currentMonth === null || monthNum !== currentMonth || year !== currentYear) {
        // Sauvegarder le mois précédent s'il existe
        if (monthData.length > 0) {
          aggregated.push(calculateAverage(monthData));
        }
        
        // Commencer un nouveau mois
        currentMonth = monthNum;
        currentYear = year;
        monthData = [day];
      } else {
        monthData.push(day);
      }
      
      // Dernier mois
      if (index === intervalDataWeNeed.length - 1 && monthData.length > 0) {
        aggregated.push(calculateAverage(monthData));
      }
    });
  }
  
  return aggregated;
}

// ========== CALCULER LA MOYENNE D'UN GROUPE DE JOURS (VERSION OPTIMISÉE) ==========
function calculateAverage(daysArray) {
  const totalCost = daysArray.reduce((sum, d) => sum + d.dayCost, 0);
  const totalBio = daysArray.reduce((sum, d) => sum + d.dayBioCost, 0);
  const totalDur = daysArray.reduce((sum, d) => sum + d.dayDurCost, 0);
  const totalLoc = daysArray.reduce((sum, d) => sum + d.dayLocCost, 0);
  
  const count = daysArray.length;
  
  // ✅ Utiliser le timestamp du premier jour de la période (déjà trié)
  return {
    dayCost: totalCost / count,
    dayBioCost: totalBio / count,
    dayDurCost: totalDur / count,
    dayLocCost: totalLoc / count,
    timeStamp: daysArray[0].timeStamp,  // Premier jour du groupe
    aggregatedFrom: count  // Nombre de jours agrégés
  };
}

// ========== CALCUL DES POINTS DU GRAPHIQUE ==========
function calculateChartPoints() {
  chartPoints = [];
  curveSegments = [];
  
  if (intervalDataWeNeed.length === 0) return;
  
  // Agréger les données selon le niveau choisi
  const aggregatedData = aggregateData();
  
  if (aggregatedData.length === 0) return;
  
  // ✅ CORRECTION : Calculer les bornes temporelles des données AGRÉGÉES
  const minTimestamp = aggregatedData[0].timeStamp;
  const maxTimestamp = aggregatedData[aggregatedData.length - 1].timeStamp;
  
  // Déterminer quelle donnée afficher
  const dataKey = currentDataType === 'bio' ? 'dayBioCost' :
                  currentDataType === 'durable' ? 'dayDurCost' : 'dayLocCost';
  
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 60;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 100;
  
  // Convertir les données en points de graphique
  let currentSegment = [];
  
  aggregatedData.forEach((day, index) => {
    const percentage = (day[dataKey] / day.dayCost) * 100;
    
    // Utiliser les bornes des données agrégées pour le mapping
    const x = map(
      day.timeStamp,
      minTimestamp,
      maxTimestamp,
      graphX,
      graphX + graphW
    );
    
    const y = map(
      percentage,
      0,
      100,
      graphY + graphH,
      graphY
    );
    
    const point = {
      x, y, percentage,
      timestamp: day.timeStamp,
      index,
      aggregatedFrom: day.aggregatedFrom,
      dayCost: day.dayCost
    };
    
    chartPoints.push(point);
    
    // Détecter les discontinuités (trous > 3 jours pour données journalières,
    // ou changement de période pour données agrégées)
    if (index > 0) {
      const prevDay = aggregatedData[index - 1];
      const timeDiff = day.timeStamp - prevDay.timeStamp;
      const daysDiff = timeDiff / (24 * 60 * 60 * 1000);
      
      // Seuil de discontinuité selon l'agrégation
      let gapThreshold = currentAggregation === 'day' ? 3 : // Plus de 3 jours = trou
                        currentAggregation === 'week' ? 10 : 35; // Plus de 10 jours = trou , Plus d'un mois = trou
     
      
      if (daysDiff > gapThreshold) {
        // Trou détecté : terminer le segment actuel
        if (currentSegment.length > 0) {
          curveSegments.push([...currentSegment]);
          currentSegment = [];
        }
      }
    }
    
    currentSegment.push(point);
    
    // Dernier point : terminer le segment
    if (index === aggregatedData.length - 1 && currentSegment.length > 0) {
      curveSegments.push(currentSegment);
    }
  });
  
}

// ========== MODIFIÉ : CRÉATION DES ALIMENTS (1 par point) ==========
function createFoodClusters() {
  foodClusters = [];
  const totalPoints = chartPoints.length;
  chartPoints.forEach((point, index) => {
    foodClusters.push(new FoodItem(point, index, totalPoints));
  });
}

// ========== DESSINER LES ROCHERS ==========
function drawRocks() {
  push();
  fill(CHART_CONFIG.colors.rock);
  noStroke();
  
  const baseY = CHART_CONFIG.potBottomY + 40;
  const centerX = (CHART_CONFIG.potLeftX + CHART_CONFIG.potRightX) / 2;
  
  // 5-6 rochers sous la marmite
  for (let i = 0; i < 6; i++) {
    const x = centerX - 80 + i * 35;
    const size = random(20, 35);
    ellipse(x, baseY, size, size * 0.7);
  }
  pop();
}

// ========== DESSINER LE FEU ==========
function drawFire() {
  const baseY = CHART_CONFIG.potBottomY + 30;
  const centerX = (CHART_CONFIG.potLeftX + CHART_CONFIG.potRightX) / 2;
  
  // Créer nouvelles particules
  if (frameCount % 3 === 0) {
    for (let i = 0; i < fireIntensity * 2; i++) {
      fireParticles.push(new FireParticle(centerX, baseY));
    }
  }
  
  // Mettre à jour et afficher
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    fireParticles[i].update();
    fireParticles[i].display();
    
    if (fireParticles[i].isDead()) {
      fireParticles.splice(i, 1);
    }
  }
}

// ========== DESSINER LA MARMITE ==========
function drawPot() {
  push();
  
  const topY = CHART_CONFIG.potTopY;
  const bottomY = CHART_CONFIG.potBottomY;
  const leftX = CHART_CONFIG.potLeftX;
  const rightX = CHART_CONFIG.potRightX;
  
  // Ombre de la marmite
  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
  drawingContext.shadowOffsetY = 10;
  
  // Corps de la marmite
  fill(CHART_CONFIG.colors.pot);
  stroke(CHART_CONFIG.colors.potDark);
  strokeWeight(2);
  
  beginShape();
  vertex(leftX, topY);
  vertex(leftX + 10, bottomY - 20);
  bezierVertex(leftX + 20, bottomY, rightX - 20, bottomY, rightX - 10, bottomY - 20);
  vertex(rightX, topY);
  endShape();
  
  drawingContext.shadowBlur = 0;
  drawingContext.shadowOffsetY = 0;
  
  // Reflets métalliques
  noStroke();
  fill(CHART_CONFIG.colors.potShine + '66');
  ellipse(leftX + 30, topY + 50, 15, 60);
  ellipse(rightX - 30, topY + 50, 15, 60);
  
  // Anses
  noFill();
  stroke(CHART_CONFIG.colors.potDark);
  strokeWeight(6);
  arc(leftX - 15, topY + 30, 30, 40, -HALF_PI, HALF_PI);
  arc(rightX + 15, topY + 30, 30, 40, HALF_PI, -HALF_PI);
  
  // Bord de la marmite
  stroke(CHART_CONFIG.colors.potDark);
  strokeWeight(8);
  line(leftX - 5, topY, rightX + 5, topY);
  
  pop();
}




// ========== DESSINER LE GRAPHIQUE DANS LA MARMITE ==========
function drawChart() {
  push();
  
  // Dessiner la grille et les axes
  drawGrid();
  drawAxes();

  // Dessiner les zones du liquide bouillant / Seuil
  drawLiquidZones();
  
  // Dessiner les discontinuités (gaps)
  // drawGaps();
  
  // Dessiner la courbe avec zones colorées
  // drawDataCurve();

  // Dessiner les bulles
  drawBubbles();

  // Dessiner la surface du liquide bouillant
  drawSurface();

  // Dessiner les clusters d'aliments
  drawFoodClusters();

  // Faire la vapeur
  drawVapor();

  // Dessiner les labels
  drawLabels();
  
  // Titre du graphique
  drawTitle();
  
  pop();
}

// ========== GRILLE DU GRAPHIQUE ==========
function drawGrid() {
  
  stroke(CHART_CONFIG.colors.text + '22');
  strokeWeight(1);
  
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 60;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 100;
  
  
  // Lignes horizontales (pourcentages)
  for (let pct = 20; pct <= 100; pct += 20) {
    const y = map(pct, 0, 100, graphY + graphH, graphY);
    line(graphX, y, graphX + graphW, y);
  }

}

// ========== AXES DU GRAPHIQUE ==========
function drawAxes() {
  stroke(CHART_CONFIG.colors.potDark);
  strokeWeight(3);
  
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 60;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 100;
    
// Axe Y (paroi gauche interne)
  line(graphX, graphY, graphX, graphY + graphH);
  
  // Axe X (fond)
  line(graphX, graphY + graphH, graphX + graphW, graphY + graphH);
  
  
  // Labels Y
  textAlign(RIGHT, CENTER);
  textSize(15);
  fill(CHART_CONFIG.colors.text);
  noStroke();
  
  for (let pct = 0; pct <= 100; pct += 20) {
    const y = map(pct, 0, 100, graphY + graphH, graphY);
    text(`${pct}%`, graphX - 10, y);
  }
}

// ========== ZONES DE LIQUIDE (2 COULEURS) ==========
function drawLiquidZones() {
  const threshold = CHART_CONFIG.thresholds[currentDataType];
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 60;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 100;
  
  const thresholdY = map(threshold, 0, 100, graphY + graphH, graphY);
  
  // Zone EN-DESSOUS du seuil (chaleur orange-rouge)
  noStroke();
  fill(CHART_CONFIG.colors.liquidBelow + '66');
  rect(graphX, thresholdY, graphW, graphY + graphH - thresholdY);
  
  // Zone AU-DESSUS du seuil (eau bleue)
  fill(CHART_CONFIG.colors.liquidAbove + '66');
  rect(graphX, graphY, graphW, thresholdY - graphY);
  
  // Ligne de seuil ondulante
  stroke(CHART_CONFIG.colors.threshold);
  strokeWeight(3);
  noFill();
  
  drawingContext.setLineDash([8, 8]);
  beginShape();
  for (let x = graphX; x <= graphX + graphW; x += 5) {
    const wave = sin((x * 0.05) + liquidAnimationTime) * 2;
    vertex(x, thresholdY + wave);
  }
  endShape();
  drawingContext.setLineDash([]);
  
  // Label du seuil
  noStroke();
  fill(CHART_CONFIG.colors.threshold);
  textAlign(LEFT, CENTER);
  textSize(20);
  textStyle(BOLD);
  text(`🌡️ ${threshold}%`, graphX + graphW + 15, thresholdY);
}

// ========== BULLES D'ÉBULLITION ==========
function drawBubbles() {
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 60;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 100;
  
  if (frameCount % 8 === 0) {
    bubbles.push(new Bubble(
      random(graphX, graphX + graphW),
      graphY + graphH - 10
    ));
  }
  
  const surfaceY = graphY;
  
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    
    if (bubbles[i].isDead(surfaceY)) {
      bubbles.splice(i, 1);
    }
  }
}

// ========== CLUSTERS D'ALIMENTS ==========
function drawFoodClusters() {
  foodClusters.forEach(cluster => {
    cluster.update(animationProgress);
    cluster.display();
  });
}

// ========== VAPEUR ==========
function drawVapor() {
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 60;
  const graphW = CHART_CONFIG.potWidth - 80;
  
  if (frameCount % 15 === 0) {
    vaporParticles.push(new VaporParticle(
      random(graphX, graphX + graphW),
      graphY
    ));
  }
  
  for (let i = vaporParticles.length - 1; i >= 0; i--) {
    vaporParticles[i].update();
    vaporParticles[i].display();
    
    if (vaporParticles[i].isDead()) {
      vaporParticles.splice(i, 1);
    }
  }
}

// ========== DESSINER LES ZONES DE DISCONTINUITÉ ==========
// function drawGaps() {
//   if (curveSegments.length <= 1) return;
  
//   const graphY = CHART_CONFIG.potTopY + 40;
//   const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 80;
  
//   noStroke();
//   fill(CHART_CONFIG.colors.potDark + '22');
  
//   // Dessiner une zone semi-transparente entre les segments
//   for (let i = 0; i < curveSegments.length - 1; i++) {
//     const endOfSegment = curveSegments[i][curveSegments[i].length - 1];
//     const startOfNext = curveSegments[i + 1][0];
    
//     // Zone entre les deux segments
//     rect(endOfSegment.x, graphY, startOfNext.x - endOfSegment.x, graphH);
    
//     // Texte explicatif
//     textAlign(CENTER, CENTER);
//     textStyle(ITALIC);
//     push()
//     fill(CHART_CONFIG.colors.text + '99');
//     text('⚠️ Gap', (endOfSegment.x + startOfNext.x) / 2, graphY + graphH / 2);
//     pop()

        
//     // Lignes pointillées
//     stroke(CHART_CONFIG.colors.text + '44');
//     strokeWeight(2);
//     drawingContext.setLineDash([5, 5]);
//     line(endOfSegment.x, graphY, endOfSegment.x, graphY + graphH);
//     line(startOfNext.x, graphY, startOfNext.x, graphY + graphH);
//     drawingContext.setLineDash([]);
//   }
// }

// ========== SURFACE AGITÉE ==========
function drawSurface() {
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 60;
  const graphW = CHART_CONFIG.potWidth - 80;
  
  push();
  noStroke();
  fill(CHART_CONFIG.colors.liquidAbove + 'AA');
  
  beginShape();
  for (let x = graphX; x <= graphX + graphW; x += 5) {
    const wave = sin((x * 0.08) + liquidAnimationTime * 1.5) * 4;
    if (x === graphX) {
      vertex(x, graphY + wave);
    } else {
      vertex(x, graphY + wave);
    }
  }
  vertex(graphX + graphW, graphY - 10);
  vertex(graphX, graphY - 10);
  endShape(CLOSE);
  
  // Ligne de surface brillante
  stroke(255, 255, 255, 200);
  strokeWeight(2);
  noFill();
  
  beginShape();
  for (let x = graphX; x <= graphX + graphW; x += 5) {
    const wave = sin((x * 0.08) + liquidAnimationTime * 1.5) * 4;
    vertex(x, graphY + wave);
  }
  endShape();
  
  pop();
}



// ========== COURBE DE DONNÉES AVEC ZONES COLORÉES ET DOUBLE ANIMATION ==========
// function drawDataCurve() {
//   if (chartPoints.length < 2) return;
  
//   const threshold = CHART_CONFIG.thresholds[currentDataType];
//   const colors = CHART_CONFIG.colors[currentDataType];
  
//   const graphX = CHART_CONFIG.potLeftX + 40;
//   const graphY = CHART_CONFIG.potTopY + 40;
//   const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 80;
//   const baselineY = graphY + graphH;
//   const thresholdY = map(threshold, 0, 100, baselineY, graphY);
  
//   // ✅ ANIMATION 1 : Progression du dessin de la courbe (0 → 1)
//   const totalPointsToShow = Math.floor(chartPoints.length * animationProgress);
  
//   // Dessiner chaque segment séparément
//   let pointsDrawn = 0;
  
//   for (let segIdx = 0; segIdx < curveSegments.length; segIdx++) {
//     const segment = curveSegments[segIdx];
    
//     // Calculer combien de points de ce segment afficher
//     const segmentStart = pointsDrawn;
//     const segmentEnd = pointsDrawn + segment.length;
    
//     if (segmentStart >= totalPointsToShow) break;
    
//     const pointsInSegment = Math.min(segment.length, totalPointsToShow - pointsDrawn);
    
//     if (pointsInSegment <= 0) continue;
    
//     // Zones colorées (vapeur blanche au-dessus, chaleur rouge en-dessous)
//     for (let i = 0; i < pointsInSegment - 1; i++) {
//       const p1 = segment[i];
//       const p2 = segment[i + 1];
      
//       const isAbove = p1.percentage >= threshold;
//       const fillColor = isAbove ? colors.above : colors.below;
      
//       fill(fillColor + '55');
//       noStroke();
      
//       beginShape();
//       vertex(p1.x, thresholdY);
//       vertex(p1.x, p1.y);
//       vertex(p2.x, p2.y);
//       vertex(p2.x, thresholdY);
//       endShape(CLOSE);
//     }
    
//     // ✅ ANIMATION 2 : Effet liquide avec épaisseur variable
//     // Dessiner la courbe segment par segment avec épaisseur animée
    
//     // Couche 1 : Glow externe avec épaisseur variable
//     drawingContext.shadowBlur = 15;
//     drawingContext.shadowColor = colors.glow;
//     noFill();
    
//     for (let i = 0; i < pointsInSegment - 1; i++) {
//       const p1 = segment[i];
//       const p2 = segment[i + 1];
      
//       // ✅ Calculer l'épaisseur variable (effet eau qui coule)
//       const waveOffset = (i / pointsInSegment) * Math.PI * 4; // 4 vagues le long du segment
//       const thickness = 4 + sin(liquidAnimationTime + waveOffset) * 1.5; // Oscille entre 3 et 7
      
//       strokeWeight(thickness);

//       const isAbove = p1.percentage >= threshold;
//       stroke(isAbove ? colors.line : colors.below); // Couleur différente si sous seuil

//       line(p1.x, p1.y, p2.x, p2.y);
//     }
    
//     drawingContext.shadowBlur = 0;
    
//     // Couche 2 : Ligne principale avec épaisseur variable (légèrement décalée)
//     for (let i = 0; i < pointsInSegment - 1; i++) {
//       const p1 = segment[i];
//       const p2 = segment[i + 1];
      
//       // ✅ Même vague mais avec décalage de phase pour effet de profondeur
//       const waveOffset = (i / pointsInSegment) * Math.PI * 4;
//       const thickness = 3 + sin(liquidAnimationTime + waveOffset + 0.5) * 1.2; // Oscille entre 1.8 et 4.2
      
//       strokeWeight(thickness);

          
//       const isAbove = p1.percentage >= threshold;
//       stroke(isAbove ? colors.line : colors.below); // Couleur différente si sous seuil

//       line(p1.x, p1.y, p2.x, p2.y);
//     }
    
//     // Point pulsant au dernier point visible de ce segment
//     if (pointsInSegment === segment.length || segmentEnd > totalPointsToShow) {
//       const lastPoint = segment[pointsInSegment - 1];
//       const pulse = sin(frameCount * 0.1) * 3 + 8;
//       fill(colors.glow);
//       noStroke();
//       circle(lastPoint.x, lastPoint.y, pulse);
      
//       const isAbove = lastPoint.percentage >= threshold;
//       fill(isAbove ? colors.line : colors.below); // Couleur différente si sous seuil
//       circle(lastPoint.x, lastPoint.y, 6);
//     }
    
//     pointsDrawn += segment.length;
//   }
// }

// ========== LABELS DES AXES ==========
function drawLabels() {

  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 60;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 100;

  
  textAlign(CENTER, TOP);
  fill(CHART_CONFIG.colors.text);
  noStroke();
  
  
  // Choisir la fonction d'affichage selon l'agrégation
  if (currentAggregation === 'month') {
    drawMonthLabels(graphX, graphY, graphW, graphH);
  } else if (currentAggregation === 'week') {
    drawWeekLabels(graphX, graphY, graphW, graphH);
  } else {
    drawDayLabels(graphX, graphY, graphW, graphH);
  }

  // Label de l'axe Y
  push();
  translate(CHART_CONFIG.potLeftX + 15, CHART_CONFIG.potTopY + (CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY) / 2);
  rotate(-HALF_PI);
  textAlign(CENTER, CENTER);
  textSize(10);
  textStyle(BOLD);
  fill(CHART_CONFIG.colors.text);
  text('Pourcentage (%)', 0, -29);
  pop();
  
 // Label de l'axe X
  textAlign(CENTER, TOP);
  textSize(15);
  textStyle(NORMAL);
  const aggLabels = {
    day: 'par jour',
    week: 'par semaine (moyenne)',
    month: 'par mois (moyenne)'
  };
  fill(CHART_CONFIG.colors.text + 'AA');
  text(
    `Temps (${aggLabels[currentAggregation]})`,
    graphX + graphW / 2,
    graphY + graphH + 50
  );
  
}

// ========== LABELS PAR MOIS (VERSION INTELLIGENTE) ==========
function drawMonthLabels(graphX, graphY, graphW, graphH) {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const numMonths = chartPoints.length;
  
  // Si plus de 18 mois : afficher seulement les années
  if (numMonths > 18) {
    let lastYear = null;
    
    chartPoints.forEach((point) => {
      const date = new Date(point.timestamp);
      const year = getISOYear(date);
      
      if (year !== lastYear) {
        lastYear = year;
        
        textSize(9);
        textStyle(BOLD);
        fill(CHART_CONFIG.colors.text);
        text(year, point.x, graphY + graphH + 15);
        
        // Trait vertical
        stroke(CHART_CONFIG.colors.text + '66');
        strokeWeight(2);
        line(point.x, graphY + graphH, point.x, graphY + graphH + 10);
        noStroke();
      }
    });
  } 
  // Si 12-18 mois : afficher 1 mois sur 2
  else if (numMonths > 12) {
    chartPoints.forEach((point, index) => {
      if (index % 2 !== 0) return;
      
      const date = new Date(point.timestamp);
      
      textSize(11);
      fill(CHART_CONFIG.colors.text);
      text(`${months[date.getMonth()]}`, point.x, graphY + graphH + 15);

      // Année si changement
      if (index === 0 || getISOYear(new Date(chartPoints[Math.max(0, index - 2)].timestamp)) !== getISOYear(date)) {
        textSize(11);
        fill(CHART_CONFIG.colors.text + 'AA');
        text(getISOYear(date), point.x, graphY + graphH + 23);
      }
    });
  }
  // Sinon : afficher tous les mois
  else {
    chartPoints.forEach((point, index) => {
      const date = new Date(point.timestamp);
      
      textSize(11);
      fill(CHART_CONFIG.colors.text);
      text(`${months[date.getMonth()]}`, point.x, graphY + graphH + 15);
      
      // Année au changement
      if (index === 0 || getISOYear(new Date(chartPoints[index - 1].timestamp)) !== getISOYear(date)) {
        textSize(11);
        fill(CHART_CONFIG.colors.text + 'AA');
        text(getISOYear(date), point.x, graphY + graphH + 30);
      }
      
      // Jours agrégés
      if (point.aggregatedFrom > 1) {
        textSize(9);
        fill(CHART_CONFIG.colors.text + '77');
        text(`(${point.aggregatedFrom}j)`, point.x, graphY + graphH + 39);
      }
    });
  }
}

// ========== LABELS PAR SEMAINE ==========
function drawWeekLabels(graphX, graphY, graphW, graphH) {
  const maxLabels = 12;
  const step = Math.max(1, Math.floor(chartPoints.length / maxLabels));
  
  chartPoints.forEach((point, index) => {
    if (index % step !== 0) return;
    
    const date = new Date(point.timestamp);
    
    textSize(9);
    fill(CHART_CONFIG.colors.text);
    text(`S${index + 1}`, point.x, graphY + graphH + 15);
    
    // Date de début
    textSize(13);
    fill(CHART_CONFIG.colors.text + '99');
    text(`${date.getDate()}/${date.getMonth() + 1}`, point.x, graphY + graphH + 28);
    
    // Jours agrégés
    if (point.aggregatedFrom > 1) {
      textSize(9);
      fill(CHART_CONFIG.colors.text + '77');
      text(`(${point.aggregatedFrom}j)`, point.x, graphY + graphH + 39);
    }
  });
}

// ========== LABELS PAR JOUR ==========
function drawDayLabels(graphX, graphY, graphW, graphH) {
  const maxLabels = 15;
  const step = Math.max(1, Math.floor(chartPoints.length / maxLabels));
  
  chartPoints.forEach((point, index) => {
    if (index % step !== 0) return;
    
    const date = new Date(point.timestamp);
    
    textSize(12);
    fill(CHART_CONFIG.colors.text);
    text(`${date.getDate()}/${date.getMonth() + 1}`, point.x, graphY + graphH + 10);
    
    // Année si changement
    if (index === 0 || getISOYear(new Date(chartPoints[Math.max(0, index - step)].timestamp)) !== getISOYear(date)) {
      textSize(15);
      fill(CHART_CONFIG.colors.text + '99');
      text(getISOYear(date), point.x, graphY + graphH + 22);
    }
  });
}


// ========== TITRE DU GRAPHIQUE ==========
function drawTitle() {
  textAlign(CENTER, TOP);
  textSize(30);
  textFont('Chaumon-Script')
  textStyle(BOLD);
  
  const titles = {
    bio: '🌱 Évolution pourcentage Bio',
    durable: '♻️ Évolution pourcentage Durable',
    local: '🥕 Évolution pourcentage Durable (Dont Marqe de Terre Source)'
  };

  fill(CHART_CONFIG.colors[currentDataType].line);

  drawingContext.shadowBlur = 0;
  drawingContext.shadowColor = CHART_CONFIG.colors[currentDataType].glow;
  
  text(
    titles[currentDataType],
    CHART_CONFIG.x + CHART_CONFIG.w / 2,
    CHART_CONFIG.y + 5
  );
  
  drawingContext.shadowBlur = 0;
  
  // Sous-titre avec la période
  textSize(20);
  textStyle(BOLD);
  textFont("Inter")
  fill("#ede6e6ff");
  
  const startDateForLocal = new Date(startDate);
  const endDateForLocal = new Date(endDate);
  
  text(
    `${startDateForLocal.toLocaleDateString('fr-FR')} - ${endDateForLocal.toLocaleDateString('fr-FR')} • ${chartPoints.length} agrégats`,
    CHART_CONFIG.x + CHART_CONFIG.w / 2,
    CHART_CONFIG.y + 47
  );
}

// ========== CONTRÔLES UTILISATEUR ==========
function createControls() {

  const mainContainer = document.querySelector('#canvas1');

  const controlY = CHART_CONFIG.y - 42;
  const controlX = CHART_CONFIG.x;

  const gap = 20; // espacement horizontal constant

  
  // Fonction utilitaire pour placer un bouton après l'autre
  function placeNextButton(prevBtn, btn, y) {
    const prevWidth = prevBtn.elt.getBoundingClientRect().width;
    const prevX = prevBtn.position().x;

    const newX = prevX + prevWidth + gap;

    btn.position(newX, y);
  }
  
  
  // --- 1) Création du premier bouton ---
  const btnBio = createButton('🌱 Bio');
  // Boutons pour changer le type de données
  //const btnBio = createButton('🌱 Bio');
  btnBio.position(controlX, controlY);
  btnBio.mousePressed(() => changeDataType('bio'));
  styleButton(btnBio);
  btnBio.parent(mainContainer); // maintenant le bouton est dans le même container que le canvas
  //btnBio.position(20, 20);     // position absolue par rapport au container
  //btnBio.style('position','absolute');
  btnBio.style('background','#0C5C03');

  
  // --- 2) Bouton suivant : Durable ---
  const btnDurable = createButton('♻️ Durable');
  btnDurable.mousePressed(() => changeDataType('durable'));
  styleButton(btnDurable);
  btnDurable.parent(mainContainer);
  placeNextButton(btnBio, btnDurable, controlY);
  btnDurable.style('background','#CC4AA7');


  // --- 3) Bouton suivant : Local ---
  const btnLocal = createButton('📍 Durable Local');
  btnLocal.mousePressed(() => changeDataType('local'));
  styleButton(btnLocal);
  btnLocal.parent(mainContainer);
  placeNextButton(btnDurable, btnLocal, controlY);
  btnLocal.style('background','#BA0085');



  // --- 4) Bouton suivant : Replay et réinitialisation d'intervalle ---
  const btnReplay = createButton('🔥!');
  btnReplay.mousePressed(()=>{

    // On réinitialise les curseurs
    handle1Y = height * 0.3;
    handle2Y = height * 0.7;
    // On update les dates selon les positions du curseur
    intervalDatesActualization()
    // On update les data
    riverGraphicsNCoAcutualization()
  });
  styleButton(btnReplay, true);
  btnReplay.parent(mainContainer);
  placeNextButton(btnLocal, btnReplay, controlY);
  btnReplay.style('background', '#FF5E07');



  
  // Info sur l'agrégation
  const infoDiv = createDiv();
  infoDiv.style('color', CHART_CONFIG.colors.text);
  infoDiv.style('font-size', '12px');
  infoDiv.id('aggregation-info');
  infoDiv.parent(mainContainer);
  placeNextButton(btnReplay, infoDiv, controlY + 5); // petit décalage vertical

  updateAggregationInfo();

}

function styleButton(btn, isSpecial = false) {
  if (isSpecial) btn.style('margin-left', '20px')
  btn.style('padding', '10px 20px');
  btn.style('margin-right', '10px');
  btn.style('font-size', '14px');
  btn.style('cursor', 'pointer');
  btn.style('font-size', '0.9em');
  btn.style('border', 'none');
  btn.style('border-radius', '0');
  // btn.style('color', isSpecial ? '#fff' : '#3e2723');
  btn.style('color','#fff');
  // btn.style('font-weight', 'bold');
  btn.style('transition', 'all 0.3s');
  btn.style('font-family', 'Chaumon-Script')
  
  btn.mouseOver(() => {
    btn.style('transform', 'scale(1.05)');
    btn.style('box-shadow', '0 4px 12px rgba(0,0,0,0.2)');
  });
  
  btn.mouseOut(() => {
    btn.style('transform', 'scale(1)');
    btn.style('box-shadow', 'none');
  });
}

// ========== METTRE À JOUR L'INFO D'AGRÉGATION ==========
function updateAggregationInfo() {
  const infoDiv = select('#aggregation-info');
  if (infoDiv) {
    const aggText = {
      day: '📅 Affichage par jour',
      week: '📊 Moyenne par semaine',
      month: '📈 Moyenne par mois'
    };
    infoDiv.html(aggText[currentAggregation]);
    // infoDiv.style('color', CHART_CONFIG.colors.text);

  }
}

// ========== CHANGER LE TYPE DE DONNÉES ==========
function changeDataType(type) {
  if (type === currentDataType) return;
  
  currentDataType = type;
  calculateChartPoints();
  createFoodClusters();
  replayAnimation();
}

// ========== REJOUER L'ANIMATION ==========
function replayAnimation() {
  animationProgress = 0;
  isAnimating = true;
  fireIntensity = 2.5;
  playFireSound();
  
  // Faire retomber tous les aliments
  foodClusters.forEach(food => {
    food.hasFallen = false;
    food.y = CHART_CONFIG.potTopY + 40;
    food.velocity = 0;
  });
}

// ========== SON DU FEU ==========
function playFireSound() {
  if (!audioContext) return;
  
  // Créer un son de "whoosh" avec oscillateurs
  const now = audioContext.currentTime;
  
  // Oscillateur pour le bruit blanc
  const bufferSize = audioContext.sampleRate * 0.5;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;
  
  // Filtre passe-bande pour le son du feu
  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.5;
  
  // Gain pour l'enveloppe
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  // Connexions
  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Jouer
  noise.start(now);
  noise.stop(now + 0.5);
}

// ========== REDIMENSIONNEMENT DE LA FENÊTRE ==========
// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   updateChartDimensions();
//   calculateChartPoints();
// }

// ========== VÉRIFIER LE SURVOL ==========
function checkHover() {
  hoveredFoodCluster = null;
  
  for (let food of foodClusters) {
    if (food.contains(mouseX, mouseY)) {
      hoveredFoodCluster = food;
      cursor(HAND);
      return;
    }
  }
  
  cursor(ARROW);
}


// ========== AFFICHAGE TOOLTIP (VERSION AMÉLIORÉE) ==========
function drawTooltip(food) {
  const point = food.point;
  const date = new Date(point.timestamp);
  let dateStr = '';
  
  // Format selon l'agrégation
  if (currentAggregation === 'day') {
    dateStr = date.toLocaleDateString('fr-FR');
  } else if (currentAggregation === 'week') {
    dateStr = `Semaine du ${date.toLocaleDateString('fr-FR')}`;
  } else {
    dateStr = `${date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
  }
  
  const pctStr = point.percentage.toFixed(1) + '%';
  const threshold = CHART_CONFIG.thresholds[currentDataType];
  const isAbove = point.percentage >= threshold;

  push();
  
  // ✅ Position du tooltip (ajustée pour éviter de sortir de l'écran)

  let tooltipX = mouseX;
  let tooltipY = mouseY - 90;
  const tooltipWidth = 220;
  const tooltipHeight = point.aggregatedFrom > 1 ? 115 : 100;

  // Ajuster si trop près des bords
  if (tooltipX + tooltipWidth / 2 > width) tooltipX = width - tooltipWidth / 2 - 10;
  if (tooltipX - tooltipWidth / 2 < 0) tooltipX = tooltipWidth / 2 + 10;
  if (tooltipY - tooltipHeight / 2 < 0) tooltipY = tooltipHeight / 2 + 10;
  
  // Fond du tooltip avec ombre
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
  
  fill(255, 250, 240);
  stroke(CHART_CONFIG.colors[currentDataType].line);
  strokeWeight(3);
  rectMode(CENTER);
  rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8);

  // Petit trou de crochet en haut
  fill(CHART_CONFIG.colors.background);
  circle(tooltipX, tooltipY - tooltipHeight / 2 + 10, 8);
    
  drawingContext.shadowBlur = 0;
  
  // Triangle vers le point
  noStroke();
  fill(255, 250, 240);
  triangle(
    tooltipX - 10, tooltipY + tooltipHeight / 2,
    tooltipX + 10, tooltipY + tooltipHeight / 2,
    point.x, point.y
  );
  
  // Texte du tooltip
  noStroke();
  fill(CHART_CONFIG.colors.text);
  textAlign(CENTER, CENTER);
  
  // Date
  textSize(14);
  textStyle(NORMAL);
  text(dateStr, tooltipX, tooltipY - tooltipHeight / 2 + 25);
  
  // Pourcentage (grand et coloré)
  textSize(24);
  textStyle(BOLD);
  fill(isAbove ? CHART_CONFIG.colors[currentDataType].line : CHART_CONFIG.colors.foodBad);
  text(pctStr, tooltipX, tooltipY - tooltipHeight / 2 + 50);
  
  // Statut
  textSize(11);
  textStyle(NORMAL);
  const statusIcon = isAbove ? '✓' : '✗';
  const statusText = isAbove ? 'Conforme' : 'Non conforme';
  fill(isAbove ? '#2e7d32' : '#c62828');

  text(`${statusIcon} ${statusText}`, tooltipX, tooltipY - tooltipHeight / 2 + 75);

  textSize(10);
  fill(CHART_CONFIG.colors.text + 'AA');
  text(`💰 Budget moyen: ${point.dayCost.toFixed(2)}€`, tooltipX, tooltipY - tooltipHeight / 2 + 92);  
  // Info agrégation
  if (point.aggregatedFrom > 1) {
    textSize(12);
    fill(CHART_CONFIG.colors.textDim || CHART_CONFIG.colors.text + '88');
    text(`(Moyenne sur ${point.aggregatedFrom} jours)`, tooltipX, tooltipY - tooltipHeight / 2 + 107);
  }

  pop();
}

// // ========== MESSAGE D'INSTRUCTIONS ==========
// function drawInstructions() {
//   if (frameCount < 300) { // Afficher pendant 5 secondes
//     push();
//     textAlign(CENTER, CENTER);
//     textSize(50);
//     fill(255, map(frameCount, 250, 300, 255, 0));
//     text('Survolez la courbe pour quelques détails', width / 2, height - 30);
//     pop();
//   }
// }

function riverGraphicsNCoAcutualization(){


  theDataForTheDataVizGraphicsCrafter()
    
  updateChartDimensions();
  
  determineAggregation();

  calculateChartPoints();

  createFoodClusters();

  replayAnimation();

  updateAggregationInfo();


  // MAJ du sandwich
  updateSandwichData();
}



/********************************************** */
/**************FIN ZONE FONCTIONS CHART RIVER */
/********************************************** */




/********************************************** */
/**************DEBUT ZONE FONCTIONS SANDWICH CHARTS */
/********************************************** */

// ============================================
// FONCTION À APPELER QUAND LES DONNÉES CHANGENT
// ============================================

function updateSandwichData() {
  
  // Mettre à jour le prix cible pour l'animation
  targetDisplayedPrice = sandwichEuros.totalCost;
  
  // Recalculer les hauteurs cibles
  updateTargetHeights();
  
  // L'animation se fera automatiquement dans draw()
}

// ============================================
// CALCUL DES HAUTEURS CIBLES
// ============================================

function updateTargetHeights() {
  if (sandwichEuros.totalCost === 0) {
    // Pas de données = sandwich vide
    targetHeights.tomato = 0;
    targetHeights.lettuce = 0;
    targetHeights.cheese = 0;
    targetHeights.meat = 0;
    return;
  }
  
  // Calcul des pourcentages CORRECTS
  // BIO (tomates)
  let bioPercent = sandwichEuros.bioCost / sandwichEuros.totalCost;
  
  // DURABLE sans bio (salade) = durable total - bio
  let durableOnlyPercent = (sandwichEuros.durableCost - sandwichEuros.bioCost) / sandwichEuros.totalCost;
  
  // Marque Terre Source (fromage)
  let localPercent = sandwichEuros.localOnlyCost / sandwichEuros.totalCost;
  
  // RESTE (viande) = 100% - (durable total + MTS)
  let totalDurableWithMTS = sandwichEuros.durableCost + sandwichEuros.localOnlyCost;
  let remainingPercent = 1 - (totalDurableWithMTS / sandwichEuros.totalCost);
  
  // S'assurer que les pourcentages sont positifs
  bioPercent = max(0, bioPercent);
  durableOnlyPercent = max(0, durableOnlyPercent);
  localPercent = max(0, localPercent);
  remainingPercent = max(0, remainingPercent);
  
  // Conversion en hauteur de pixels
  targetHeights.tomato = bioPercent * garnitureHeight;
  targetHeights.lettuce = durableOnlyPercent * garnitureHeight;
  targetHeights.cheese = localPercent * garnitureHeight;
  targetHeights.meat = remainingPercent * garnitureHeight;
}


// ============================================
// CRÉATION DES COUCHES SVG
// ============================================

function createSandwichLayers() {
  let garnitureDiv = select('.garniture');
  if (!garnitureDiv) return;
  
  // Vider le contenu existant
  garnitureDiv.html('');
  
  // Définir la position relative pour le conteneur
  garnitureDiv.style('position', 'relative');
  
  // Créer la barre de référence 100% à gauche avec texte
  let leftBarContainer = createDiv('').parent(garnitureDiv);
  leftBarContainer.id('left-reference-container');
  leftBarContainer.style('position', 'absolute');
  leftBarContainer.style('left', '-15px');
  leftBarContainer.style('top', '0');
  leftBarContainer.style('width', '5px');
  leftBarContainer.style('height', '100%');
  leftBarContainer.style('display', 'flex');
  leftBarContainer.style('font-weight', 'bolder');
  leftBarContainer.style('flex-direction', 'column');
  leftBarContainer.style('align-items', 'center');
  
  leftBarContainer.html(`
    <div style="position: absolute; bottom: 100%; margin-bottom: 5px; writing-mode: vertical-rl; transform: rotate(180deg); color: #000; font-weight: bold; font-size: 12px; font-family: Inter; font-style: italic">100%</div>
    <div style="width: 5px; flex-grow: 1; background-color: #000; border-radius: 1px;"></div>
  `);
  
  // Créer les 4 couches dans l'ordre (de bas en haut)
  // 1. Viande (rose avec texture)
  let meatSvg = createDiv('').parent(garnitureDiv);
  meatSvg.id('meat-layer');
  meatSvg.class('sandwich-layer');
  meatSvg.style('position', 'absolute');
  meatSvg.style('bottom', '0');
  meatSvg.style('width', '100%');
  meatSvg.style('overflow', 'visible');
  meatSvg.style('line-height', '0');
  meatSvg.style('cursor', 'pointer');

  
  // 2. Fromage (jaune avec texture)
  let cheeseSvg = createDiv('').parent(garnitureDiv);
  cheeseSvg.id('cheese-layer');
  cheeseSvg.class('sandwich-layer');
  cheeseSvg.style('position', 'absolute');
  cheeseSvg.style('width', '100%');
  cheeseSvg.style('overflow', 'visible');
  cheeseSvg.style('line-height', '0');
  cheeseSvg.style('cursor', 'pointer');
  
  // 3. Salade (verte ondulée)
  let lettuceSvg = createDiv('').parent(garnitureDiv);
  lettuceSvg.id('lettuce-layer');
  lettuceSvg.class('sandwich-layer');
  lettuceSvg.style('position', 'absolute');
  lettuceSvg.style('width', '100%');
  lettuceSvg.style('overflow', 'visible');
  lettuceSvg.style('line-height', '0');
  lettuceSvg.style('cursor', 'pointer');
  
  // 4. Tomates (rouges ondulées)
  let tomatoSvg = createDiv('').parent(garnitureDiv);
  tomatoSvg.id('tomato-layer');
  tomatoSvg.class('sandwich-layer');
  tomatoSvg.style('position', 'absolute');
  tomatoSvg.style('top', '0');
  tomatoSvg.style('width', '100%');
  tomatoSvg.style('overflow', 'visible');
  tomatoSvg.style('line-height', '0');
  tomatoSvg.style('cursor', 'pointer');
  
  // Créer les barres de pourcentage à droite
  createPercentageBars(garnitureDiv);
  
  // Créer le tooltip
  createTooltip();
  
  // Ajouter les événements hover
  // setupHoverEvents();
  setupHoverLogic();
}

// ============================================
// MISE À JOUR DES COUCHES
// ============================================

function updateSandwichLayers() {
  // Mise à jour de la viande (couche du bas)
  let meatLayer = select('#meat-layer');
  if (meatLayer) {
    meatLayer.style('height', currentHeights.meat + 'px');
    meatLayer.html(generateMeatSVG(currentHeights.meat));
  }
  
  // Mise à jour du fromage (au-dessus de la viande)
  let cheeseLayer = select('#cheese-layer');
  if (cheeseLayer) {
    cheeseLayer.style('height', currentHeights.cheese + 'px');
    cheeseLayer.style('bottom', currentHeights.meat + 'px');
    cheeseLayer.html(generateCheeseSVG(currentHeights.cheese));
  }
  
  // Mise à jour de la salade (au-dessus du fromage)
  let lettuceLayer = select('#lettuce-layer');
  if (lettuceLayer) {
    lettuceLayer.style('height', currentHeights.lettuce + 'px');
    lettuceLayer.style('bottom', (currentHeights.meat + currentHeights.cheese) + 'px');
    lettuceLayer.html(generateLettuceSVG(currentHeights.lettuce));
  }
  
  // Mise à jour des tomates (en haut)
  let tomatoLayer = select('#tomato-layer');
  if (tomatoLayer) {
    tomatoLayer.style('height', currentHeights.tomato + 'px');
    tomatoLayer.html(generateBeetSVG(currentHeights.tomato));
  }
  
  // Mise à jour des barres de pourcentage (hauteurs ET couleurs)
  updateBarsDisplay();
}

// ============================================
// GÉNÉRATION DES SVG POUR CHAQUE INGRÉDIENT
// ============================================

// Betterave (deux rondelles vues de côté, côte à côte)
function generateBeetSVG(height) {
  if (height < 2) return ''; // Trop petit pour afficher
  
  let svg = `
    <svg width="500" height="${height}" xmlns="http://www.w3.org/2000/svg" style="display: block;">
      <defs>

        <!-- Dégradé de betterave -->
        <linearGradient id="beet-side-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   style="stop-color:#4A0038;stop-opacity:1" />
          <stop offset="20%"  style="stop-color:#7A0058;stop-opacity:1" />
          <stop offset="50%"  style="stop-color:#B30073;stop-opacity:1" />
          <stop offset="80%"  style="stop-color:#7A0058;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3A002B;stop-opacity:1" />
        </linearGradient>

        <!-- Pattern de pépins/brillances en tons roses/violets -->
        <pattern id="beet-seeds-side" x="0" y="0" width="40" height="25" patternUnits="userSpaceOnUse">
          <ellipse cx="5" cy="5"  rx="1.5" ry="1" fill="#FFB5E8" opacity="0.45"/>
          <ellipse cx="12" cy="8" rx="1.3" ry="0.8" fill="#FFB5E8" opacity="0.40"/>
          <ellipse cx="20" cy="4" rx="1.4" ry="0.9" fill="#FFB5E8" opacity="0.35"/>
          <ellipse cx="28" cy="10" rx="1.2" ry="0.7" fill="#FFB5E8" opacity="0.40"/>
          <ellipse cx="18" cy="15" rx="1.4" ry="1" fill="#FFB5E8" opacity="0.45"/>
          <ellipse cx="8"  cy="18" rx="1.3" ry="0.8" fill="#FFB5E8" opacity="0.35"/>
          <ellipse cx="26" cy="18" rx="1.5" ry="1" fill="#FFB5E8" opacity="0.50"/>
          <ellipse cx="32" cy="6"  rx="1.2" ry="0.7" fill="#FFB5E8" opacity="0.40"/>
        </pattern>

      </defs>

      <!-- Rondelle 1 -->
      <rect x="10" y="0" width="210" height="${height}"
            fill="url(#beet-side-grad)" rx="3"/>
      <rect x="10" y="0" width="210" height="${height}"
            fill="url(#beet-seeds-side)" rx="3"/>
      <rect x="10" y="0" width="210" height="${height}"
            fill="none" stroke="#2A001F" stroke-width="2" rx="3"/>

      <!-- Rondelle 2 -->
      <rect x="280" y="0" width="210" height="${height}"
            fill="url(#beet-side-grad)" rx="3"/>
      <rect x="280" y="0" width="210" height="${height}"
            fill="url(#beet-seeds-side)" rx="3"/>
      <rect x="280" y="0" width="210" height="${height}"
            fill="none" stroke="#2A001F" stroke-width="2" rx="3"/>
    </svg>
  `;
  
  return svg;
}



// SALADE (verte avec formes ondulées des 2 côtés)
function generateLettuceSVG(height) {
  if (height < 2) return '';
  
  let waveAmp = Math.min(8, height / 3); // Amplitude des vagues adaptée
  
  let svg = `
    <svg width="500" height="${height}" xmlns="http://www.w3.org/2000/svg" style="display: block;">
      <defs>
        <!-- Forme ondulée haut et bas -->
        <clipPath id="lettuce-waves">
          <path d="M 0,${waveAmp} Q 50,0 100,${waveAmp} T 200,${waveAmp} T 300,${waveAmp} T 400,${waveAmp} T 500,${waveAmp} 
                   L 500,${height - waveAmp} Q 450,${height} 400,${height - waveAmp} 
                   T 300,${height - waveAmp} T 200,${height - waveAmp} T 100,${height - waveAmp} T 0,${height - waveAmp} Z" />
        </clipPath>
        
        <!-- Texture de nervures de salade -->
        <pattern id="lettuce-veins" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 20,0 L 20,40" stroke="#1E8449" stroke-width="1" opacity="0.3"/>
          <path d="M 20,10 Q 15,12 10,15" stroke="#1E8449" stroke-width="0.8" fill="none" opacity="0.25"/>
          <path d="M 20,10 Q 25,12 30,15" stroke="#1E8449" stroke-width="0.8" fill="none" opacity="0.25"/>
          <path d="M 20,25 Q 15,27 10,30" stroke="#1E8449" stroke-width="0.8" fill="none" opacity="0.25"/>
          <path d="M 20,25 Q 25,27 30,30" stroke="#1E8449" stroke-width="0.8" fill="none" opacity="0.25"/>
        </pattern>
      </defs>
      
      <!-- Base verte -->
      <rect x="0" y="0" width="500" height="${height}" 
            fill="#27AE60" clip-path="url(#lettuce-waves)"/>
      
      <!-- Nervures de la salade -->
      <rect x="0" y="0" width="500" height="${height}" 
            fill="url(#lettuce-veins)" clip-path="url(#lettuce-waves)"/>
      
      <!-- Variations de vert (ondulations) -->
      <ellipse cx="100" cy="${height / 2}" rx="80" ry="${Math.max(15, height/4)}" 
               fill="#2ECC71" opacity="0.4" clip-path="url(#lettuce-waves)"/>
      <ellipse cx="300" cy="${height / 2}" rx="100" ry="${Math.max(20, height/3)}" 
               fill="#229954" opacity="0.3" clip-path="url(#lettuce-waves)"/>
      <ellipse cx="200" cy="${height / 3}" rx="60" ry="${Math.max(12, height/5)}" 
               fill="#1E8449" opacity="0.2" clip-path="url(#lettuce-waves)"/>
      
      <!-- Contours ondulés -->
      <path d="M 0,${waveAmp} Q 50,0 100,${waveAmp} T 200,${waveAmp} T 300,${waveAmp} T 400,${waveAmp} T 500,${waveAmp}" 
            stroke="#1E8449" stroke-width="1.5" fill="none"/>
      <path d="M 0,${height - waveAmp} Q 50,${height} 100,${height - waveAmp} 
               T 200,${height - waveAmp} T 300,${height - waveAmp} T 400,${height - waveAmp} T 500,${height - waveAmp}" 
            stroke="#1E8449" stroke-width="1.5" fill="none"/>
    </svg>
  `;
  return svg;
}

// FROMAGE (jaune avec texture)
function generateCheeseSVG(height) {
  if (height < 2) return '';
  
  let svg = `
    <svg width="500" height="${height}" xmlns="http://www.w3.org/2000/svg" style="display: block;">
      <defs>
        <!-- Texture du fromage (trous) -->
        <pattern id="cheese-holes" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <ellipse cx="10" cy="15" rx="4" ry="5" fill="#D68910" opacity="0.4"/>
          <ellipse cx="30" cy="10" rx="3" ry="4" fill="#D68910" opacity="0.3"/>
          <ellipse cx="25" cy="30" rx="3.5" ry="4.5" fill="#D68910" opacity="0.35"/>
        </pattern>
        
        <linearGradient id="cheese-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#F9E79F;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#F39C12;stop-opacity:0" />
        </linearGradient>
      </defs>
      
      <!-- Base jaune -->
      <rect x="0" y="0" width="500" height="${height}" fill="#F39C12"/>
      
      <!-- Trous du fromage -->
      <rect x="0" y="0" width="500" height="${height}" fill="url(#cheese-holes)"/>
      
      <!-- Dégradé subtil -->
      <rect x="0" y="0" width="500" height="${height}" 
            fill="url(#cheese-gradient)" opacity="0.3"/>
    </svg>
  `;
  return svg;
}

// VIANDE (rose avec texture marbrée)
function generateMeatSVG(height) {
  if (height < 2) return '';
  
  let svg = `
    <svg width="500" height="${height}" xmlns="http://www.w3.org/2000/svg" style="display: block;">
      <defs>
        <!-- Texture de la viande (marbrures) -->
        <pattern id="meat-texture" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 10,20 Q 20,10 30,20 T 50,20" 
                stroke="#D98880" stroke-width="2" fill="none" opacity="0.4"/>
          <path d="M 5,40 Q 15,35 25,40 T 45,40" 
                stroke="#E6B0AA" stroke-width="1.5" fill="none" opacity="0.3"/>
          <circle cx="40" cy="15" r="2" fill="#C39BD3" opacity="0.2"/>
        </pattern>
        
        <linearGradient id="meat-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#F1948A;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#EC7063;stop-opacity:0" />
          <stop offset="100%" style="stop-color:#CB4335;stop-opacity:0.6" />
        </linearGradient>
      </defs>
      
      <!-- Base rose -->
      <rect x="0" y="0" width="500" height="${height}" fill="#EC7063"/>
      
      <!-- Marbrures -->
      <rect x="0" y="0" width="500" height="${height}" fill="url(#meat-texture)"/>
      
      <!-- Dégradé pour le relief -->
      <rect x="0" y="0" width="500" height="${height}" 
            fill="url(#meat-gradient)" opacity="0.2"/>
    </svg>
  `;
  return svg;
}


// ============================================
// CRÉATION DES BARRES DE POURCENTAGE À DROITE
// ============================================

function createPercentageBars(parent) {
  // UN SEUL conteneur pour toutes les barres
  let barsContainer = createDiv('').parent(parent);
  barsContainer.id('bars-container');
  barsContainer.style('position', 'absolute');
  barsContainer.style('left', 'calc(100% + 10px)');
  barsContainer.style('top', '0');
  barsContainer.style('width', 'fit-content');
  barsContainer.style('height', '100%');
  barsContainer.style('display', 'flex');
  barsContainer.style('flex-direction', 'row');
  barsContainer.style('justify-content', 'flex-start');
  barsContainer.style('align-items', 'flex-start');
  barsContainer.style('gap', '5px');
  barsContainer.style('font-weight', 'bolder');
  barsContainer.style('pointer-events', 'none'); // Le conteneur ne bloque pas

  
  // Créer les 3 barres avec leur structure HTML (UNE SEULE FOIS)
  barsContainer.html(`
    <!-- Barre verte (BIO) -->
    <div id="bar-bio-wrapper" style="height: 0px; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
      <div id="bar-bio-label" style="position: absolute; bottom: 100%; writing-mode: vertical-rl; transform: rotate(180deg); font-weight: bold; font-size: 12px; margin-bottom: 5px; font-style: italic; font-family: Inter; color: #528B4C;">bio</div>
      <div id="bar-bio" class="percentage-bar-rect" data-type="bio" style="width: 5px; flex-grow: 1; background-color: #528B4C; cursor: pointer; transition: width 0.2s ease; border-radius: 1px;"></div>
    </div>
    
    <!-- Barre bleue (DURABLE) -->
    <div id="bar-durable-wrapper" style="height: 0px; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
      <div id="bar-durable-label" style="position: absolute; bottom: 100%; writing-mode: vertical-rl; transform: rotate(180deg); font-weight: bold; font-size: 12px; margin-bottom: 5px; font-style: italic; font-family: Inter; color: #CC4AA7;">dur</div>
      <div id="bar-durable" class="percentage-bar-rect" data-type="durable" style="width: 5px; flex-grow: 1; background-color: #CC4AA7; cursor: pointer; transition: width 0.2s ease; border-radius: 1px;"></div>
    </div>
    
    <!-- Barre violette (DURABLE + MTS) -->
    <div id="bar-mts-wrapper" style="height: 0px; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
      <div id="bar-mts-label" style="position: absolute; bottom: 100%; writing-mode: vertical-rl; transform: rotate(180deg); font-weight: bold; font-size: 11px; margin-bottom: 5px; font-style: italic; font-family: Inter; color: #9B59B6;">dur(+MTS)</div>
      <div id="bar-mts" class="percentage-bar-rect" data-type="mts" style="width: 5px; flex-grow: 1; background-color: #9B59B6; cursor: pointer; transition: width 0.2s ease; border-radius: 1px;"></div>
    </div>
  `);
}


// ============================================
// MISE À JOUR DES BARRES DE POURCENTAGE
// ============================================

// function updatePercentageBars() {
//   let barsContainer = select('#bars-container');
//   if (!barsContainer) return;
  
//   let bioPercent = (sandwichEuros.bioCost / sandwichEuros.totalCost * 100);
//   let durablePercent = (sandwichEuros.durableCost / sandwichEuros.totalCost * 100);
//   let totalDurableWithMTS = sandwichEuros.durableCost + sandwichEuros.localOnlyCost;
//   let totalWithMTSPercent = (totalDurableWithMTS / sandwichEuros.totalCost * 100);
  
//   // Hauteurs = hauteur exacte de ce qu'elles représentent
//   let greenHeight = currentHeights.tomato;
//   let blueHeight = currentHeights.tomato + currentHeights.lettuce;
//   let purpleHeight = currentHeights.tomato + currentHeights.lettuce + currentHeights.cheese;
  
//   // Couleurs
//   let greenColor = bioPercent >= 20 ? '#27AE60' : '#E74C3C';
//   let blueColor = durablePercent >= 50 ? '#3498DB' : '#E74C3C';
//   let purpleColor = totalWithMTSPercent >= 50 ? '#9B59B6' : '#E74C3C';
  
//   // Mettre à jour tout le conteneur avec les 3 barres
//   barsContainer.html(`
//     <!-- Barre verte (BIO) -->
//     <div style="position: absolute; left: 0px; top: 0; height: ${greenHeight}px; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
//       <div style="position: absolute; bottom: 100%; writing-mode: vertical-rl; transform: rotate(180deg); color: ${greenColor}; font-weight: bold; font-size: 12px; margin-bottom: 5px; font-style: italic; font-family: Inter;">bio</div>
//       <div class="percentage-bar-rect" data-type="bio" style="width: 5px; flex-grow: 1; background-color: ${greenColor}; cursor: pointer; transition: width 0.2s ease; border-radius: 1px;"></div>
//     </div>
    
//     <!-- Barre bleue (DURABLE) -->
//     <div style="position: absolute; left: 10px; top: 0; height: ${blueHeight}px; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
//       <div style="position: absolute; bottom: 100%; writing-mode: vertical-rl; transform: rotate(180deg); color: ${blueColor}; font-weight: bold; font-size: 12px; margin-bottom: 5px; font-style: italic; font-family: Inter;">dur</div>
//       <div class="percentage-bar-rect" data-type="durable" style="width: 5px; flex-grow: 1; background-color: ${blueColor}; cursor: pointer; transition: width 0.2s ease; border-radius: 1px;"></div>
//     </div>
    
//     <!-- Barre violette (DURABLE + MTS) -->
//     <div style="position: absolute; left: 20px; top: 0; height: ${purpleHeight}px; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
//       <div style="position: absolute; bottom: 100%; writing-mode: vertical-rl; transform: rotate(180deg); color: ${purpleColor}; font-weight: bold; font-size: 11px; margin-bottom: 5px; font-style: italic; font-family: Inter;">dur(+MTS)</div>
//       <div class="percentage-bar-rect" data-type="mts" style="width: 5px; flex-grow: 1; background-color: ${purpleColor}; cursor: pointer; transition: width 0.2s ease; border-radius: 1px;"></div>
//     </div>
//   `);
  
//   // Réattacher les événements après la mise à jour du HTML
//   setTimeout(() => {
//     reattachHoverEvents();
//   }, 150);
// }


// ============================================
// MISE À JOUR DE L'AFFICHAGE DES BARRES (hauteurs + couleurs)
// ============================================

function updateBarsDisplay() {
  // Calcul des pourcentages
  let bioPercent = (sandwichEuros.bioCost / sandwichEuros.totalCost * 100);
  let durablePercent = (sandwichEuros.durableCost / sandwichEuros.totalCost * 100);
  let totalDurableWithMTS = sandwichEuros.durableCost + sandwichEuros.localOnlyCost;
  let totalWithMTSPercent = (totalDurableWithMTS / sandwichEuros.totalCost * 100);
  
  // Calcul des hauteurs
  let greenHeight = currentHeights.tomato;
  let blueHeight = currentHeights.tomato + currentHeights.lettuce;
  let purpleHeight = currentHeights.tomato + currentHeights.lettuce + currentHeights.cheese;
  
  // Calcul des couleurs (selon seuils)
  let greenColor = bioPercent >= 20 ? '#528B4C' : '#E74C3C';
  let blueColor = durablePercent >= 50 ? '#CC4AA7' : '#E74C3C';
  let purpleColor = totalWithMTSPercent >= 50 ? '#BA0085' : '#E74C3C';
  
  // Mise à jour des wrappers (hauteurs)
  let barBioWrapper = document.getElementById('bar-bio-wrapper');
  let barDurableWrapper = document.getElementById('bar-durable-wrapper');
  let barMtsWrapper = document.getElementById('bar-mts-wrapper');
  
  if (barBioWrapper) barBioWrapper.style.height = greenHeight + 'px';
  if (barDurableWrapper) barDurableWrapper.style.height = blueHeight + 'px';
  if (barMtsWrapper) barMtsWrapper.style.height = purpleHeight + 'px';
  
  // Mise à jour des couleurs des barres ET des labels
  let barBio = document.getElementById('bar-bio');
  let barBioLabel = document.getElementById('bar-bio-label');
  if (barBio) barBio.style.backgroundColor = greenColor;
  if (barBioLabel) barBioLabel.style.color = greenColor;
  
  let barDurable = document.getElementById('bar-durable');
  let barDurableLabel = document.getElementById('bar-durable-label');
  if (barDurable) barDurable.style.backgroundColor = blueColor;
  if (barDurableLabel) barDurableLabel.style.color = blueColor;
  
  let barMts = document.getElementById('bar-mts');
  let barMtsLabel = document.getElementById('bar-mts-label');
  if (barMts) barMts.style.backgroundColor = purpleColor;
  if (barMtsLabel) barMtsLabel.style.color = purpleColor;
}


// ============================================
// CRÉATION DU TOOLTIP
// ============================================

function createTooltip() {
  let tooltip = createDiv('').id('sandwich-tooltip');
  tooltip.style('position', 'fixed');
  tooltip.style('background-color', 'rgba(0, 0, 0, 0.85)');
  tooltip.style('color', 'white');
  tooltip.style('padding', '10px 15px');
  tooltip.style('border-radius', '8px');
  tooltip.style('font-family', 'Arial, sans-serif');
  tooltip.style('font-size', '14px');
  tooltip.style('pointer-events', 'none');
  tooltip.style('opacity', '0');
  tooltip.style('transition', 'opacity 0.2s ease');
  tooltip.style('z-index', '10000');
  tooltip.style('white-space', 'nowrap');
  tooltip.style('box-shadow', '0 4px 8px rgba(0,0,0,0.3)');
}



// ============================================
// AJOUT DU STYLE CSS POUR LE GROSSISSEMENT DES BARRES
// ============================================

// Injecter le style CSS dans la page
let style = document.createElement('style');
style.textContent = `
  .percentage-bar-rect {
    width: 5px !important;
  }
  .percentage-bar-rect.bar-active {
    width: 7px !important;
    background-color: black !important;
  }
`;
document.head.appendChild(style);


// ============================================
// CONFIGURATION DES ÉVÉNEMENTS HOVER
// ============================================

let tooltipActive = false;

function setupHoverLogic() {
  const tooltip = document.getElementById('sandwich-tooltip');

  // Détection universelle
  document.addEventListener('mousemove', e => {
    const target = e.target.closest(
      '.percentage-bar-rect, #tomato-layer, #lettuce-layer, #cheese-layer, #meat-layer'
    );

    if (!target) {
      hideTooltip(tooltip);
      return;
    }

    const type = target.dataset.type || layerIdToType(target.id);
    if (!type) return;

    showTooltip(tooltip, type, e);
  });
}

function layerIdToType(id) {
  if (id === 'tomato-layer') return 'bio';
  if (id === 'lettuce-layer') return 'durable';
  if (id === 'cheese-layer') return 'mts';
  if (id === 'meat-layer') return 'other';
  return null;
}

function showTooltip(tooltip, type, e) {
  tooltipActive = true;

  tooltip.innerHTML = buildTooltipContent(type);

  tooltip.style.left = (e.clientX + 15) + 'px';
  tooltip.style.top = (e.clientY + 15) + 'px';
  tooltip.style.opacity = '1';

  updateActiveBar(type);
}

function hideTooltip(tooltip) {
  if (!tooltipActive) return;
  tooltipActive = false;

  tooltip.style.opacity = '0';

  // Retirer les barres actives
  document.querySelectorAll('.percentage-bar-rect')
    .forEach(el => el.classList.remove('bar-active'));
}

function updateActiveBar(type) {
  document.querySelectorAll('.percentage-bar-rect')
    .forEach(el => el.classList.remove('bar-active'));

  const bar = document.querySelector(`.percentage-bar-rect[data-type="${type}"]`);
  if (bar) bar.classList.add('bar-active');
}

function buildTooltipContent(type) {
  if (type === 'bio') {
    let percent = (sandwichEuros.bioCost / sandwichEuros.totalCost * 100).toFixed(1);
    let euros = sandwichEuros.bioCost.toFixed(2);
    let ok = percent >= 20;
    return `
      <div style="font-weight:bold;">🍅 Produits BIO</div>
      <div>${euros}€ (${percent}%)</div>
      <div style="font-size:12px;color:${ok?'#2ECC71':'#E74C3C'};">
        ${ok?'✓':'✗'} Seuil légal : 20%
      </div>`;
  }

  if (type === 'durable') {
    let percent = (sandwichEuros.durableCost / sandwichEuros.totalCost * 100).toFixed(1);
    let euros = sandwichEuros.durableCost.toFixed(2);
    let ok = percent >= 50;
    return `
      <div style="font-weight:bold;">🥬 Produits DURABLES</div>
      <div>${euros}€ (${percent}%)</div>
      <div style="font-size:12px;color:${ok?'#2ECC71':'#E74C3C'};">
        ${ok?'✓':'✗'} Seuil légal : 50%
      </div>`;
  }

  if (type === 'mts') {
    let total = sandwichEuros.durableCost + sandwichEuros.localOnlyCost;
    let percent = (total / sandwichEuros.totalCost * 100).toFixed(1);
    let mtsPercent = (sandwichEuros.localOnlyCost / sandwichEuros.totalCost * 100).toFixed(1);
    let euros = total.toFixed(2);
    let ok = percent >= 50;
    return `
      <div style="font-weight:bold;">🧀 Durable incluant MTS</div>
      <div>${euros}€ (${percent}%)</div>
      <div style="font-size:12px;">dont ${mtsPercent}% de MTS</div>
      <div style="font-size:12px;color:${ok?'#2ECC71':'#E74C3C'};">
        ${ok?'✓':'✗'} Seuil légal : 50%
      </div>`;
  }

  if (type === 'other') {
    let totalDurableWithMTS = sandwichEuros.durableCost + sandwichEuros.localOnlyCost;
    let otherCost = sandwichEuros.totalCost - totalDurableWithMTS;
    let percent = (otherCost / sandwichEuros.totalCost * 100).toFixed(1);
    return `
      <div style="font-weight:bold;">🥩 Autres</div>
      <div>${otherCost.toFixed(2)}€ (${percent}%)</div>`;
  }

  return '';
}


// let currentHoveredType = null;
// let hoverTimeoutId = null;
// let isTooltipVisible = false;

// function setupHoverEvents() {
//   let tooltip = select('#sandwich-tooltip');
//   if (!tooltip) return;
  
//   // Fonction pour afficher le tooltip et grossir la barre
//   function showTooltip(type, e) {
//     if (hoverTimeoutId) {
//       clearTimeout(hoverTimeoutId);
//       hoverTimeoutId = null;
//     }
    
//     currentHoveredType = type;
//     isTooltipVisible = true;
    
//     // Retirer la classe active de toutes les barres
//     document.querySelectorAll('.percentage-bar-rect').forEach(bar => {
//       bar.classList.remove('bar-active');
//     });
    
//     // Ajouter la classe active à la barre concernée
//     let bar = document.querySelector(`.percentage-bar-rect[data-type="${type}"]`);
//     if (bar) {
//       bar.classList.add('bar-active');
//     }
    
//     // Générer le contenu du tooltip
//     let content = '';
    
//     if (type === 'bio') {
//       let bioPercent = (sandwichEuros.bioCost / sandwichEuros.totalCost * 100).toFixed(1);
//       let bioEuros = sandwichEuros.bioCost.toFixed(2);
//       let isCompliant = bioPercent >= 20;
      
//       content = `
//         <div style="font-weight: bold; margin-bottom: 5px;">🍅 Produits BIO</div>
//         <div>${bioEuros}€ (${bioPercent}%)</div>
//         <div style="margin-top: 5px; font-size: 12px; color: ${isCompliant ? '#2ECC71' : '#E74C3C'};">
//           ${isCompliant ? '✓' : '✗'} Seuil légal : 20%
//         </div>
//       `;
//     } else if (type === 'durable') {
//       let durablePercent = (sandwichEuros.durableCost / sandwichEuros.totalCost * 100).toFixed(1);
//       let durableEuros = sandwichEuros.durableCost.toFixed(2);
//       let isCompliant = durablePercent >= 50;
      
//       content = `
//         <div style="font-weight: bold; margin-bottom: 5px;">🥬 Produits DURABLES</div>
//         <div>${durableEuros}€ (${durablePercent}%)</div>
//         <div style="margin-top: 5px; font-size: 12px; color: ${isCompliant ? '#2ECC71' : '#E74C3C'};">
//           ${isCompliant ? '✓' : '✗'} Seuil légal : 50%
//         </div>
//       `;
//     } else if (type === 'mts') {
//       let totalDurableWithMTS = sandwichEuros.durableCost + sandwichEuros.localOnlyCost;
//       let totalPercent = (totalDurableWithMTS / sandwichEuros.totalCost * 100).toFixed(1);
//       let mtsPercent = (sandwichEuros.localOnlyCost / sandwichEuros.totalCost * 100).toFixed(1);
//       let totalEuros = totalDurableWithMTS.toFixed(2);
//       let isCompliant = totalPercent >= 50;
      
//       content = `
//         <div style="font-weight: bold; margin-bottom: 5px;">🧀 Durable incluant MTS</div>
//         <div>${totalEuros}€ (${totalPercent}%)</div>
//         <div style="font-size: 12px; margin-top: 3px;">dont ${mtsPercent}% de MTS</div>
//         <div style="margin-top: 5px; font-size: 12px; color: ${isCompliant ? '#2ECC71' : '#E74C3C'};">
//           ${isCompliant ? '✓' : '✗'} Seuil légal : 50%
//         </div>
//       `;
//     } else if (type === 'other') {
//       let otherCost = sandwichEuros.totalCost - sandwichEuros.bioCost - sandwichEuros.durableCost - sandwichEuros.localOnlyCost;
//       let otherPercent = (otherCost / sandwichEuros.totalCost * 100).toFixed(1);
//       let otherEuros = otherCost.toFixed(2);
      
//       content = `
//         <div style="font-weight: bold; margin-bottom: 5px;">🥩 Autres</div>
//         <div>${otherEuros}€ (${otherPercent}%)</div>
//       `;
//     }
    
//     tooltip.elt.innerHTML = content;
//     tooltip.elt.style.opacity = '1';
//     tooltip.elt.style.left = (e.clientX + 15) + 'px';
//     tooltip.elt.style.top = (e.clientY + 15) + 'px';
//   }
  
//   // Fonction pour cacher le tooltip
//   function hideTooltip() {
//     if (hoverTimeoutId) {
//       clearTimeout(hoverTimeoutId);
//       hoverTimeoutId = null;
//     }
    
//     isTooltipVisible = false;
//     currentHoveredType = null;
//     tooltip.elt.style.opacity = '0';
    
//     // Retirer la classe active de toutes les barres
//     document.querySelectorAll('.percentage-bar-rect').forEach(bar => {
//       bar.classList.remove('bar-active');
//     });
//   }
  
//   // Attacher les événements UNE SEULE FOIS
//   function attachEvents(selector, type) {
//     let elements = document.querySelectorAll(selector);
    
//     elements.forEach(element => {
//       element.addEventListener('mouseenter', function(e) {
//         showTooltip(type, e);
//       });
      
//       element.addEventListener('mouseleave', function() {
//         hoverTimeoutId = setTimeout(() => {
//           let stillHovering = false;
//           document.querySelectorAll(selector).forEach(el => {
//             if (el.matches(':hover')) stillHovering = true;
//           });
          
//           if (!stillHovering && currentHoveredType === type) {
//             hideTooltip();
//           }
//         }, 200);
//       });
      
//       element.addEventListener('mousemove', function(e) {
//         if (isTooltipVisible && currentHoveredType === type) {
//           tooltip.elt.style.left = (e.clientX + 15) + 'px';
//           tooltip.elt.style.top = (e.clientY + 15) + 'px';
//         }
//       });
//     });
//   }
  
//   // Attacher aux couches et barres
//   attachEvents('#tomato-layer, .percentage-bar-rect[data-type="bio"]', 'bio');
//   attachEvents('#lettuce-layer, .percentage-bar-rect[data-type="durable"]', 'durable');
//   attachEvents('#cheese-layer, .percentage-bar-rect[data-type="mts"]', 'mts');
//   attachEvents('#meat-layer', 'other');
// }

// ============================================
// MISE À JOUR DE LA PANCARTE AVEC ANIMATION
// ============================================

function updatePlacard() {
  // Appeler ta fonction drawPlacard avec le prix animé
 drawPlacard(CHART_CONFIG.x + SANDWICHWIDTH + 170, 110, currentDisplayedPrice.toFixed(2));
}

/********************************************** */
/**************FIN ZONE FONCTIONS SANDWICH CHARTS */
/********************************************** */





/********************************************** */
/*************** ZONE FONCTIONS INTERACTIONS SOURIS */
/********************************************** */

// Gestion du clic
function mousePressed() {

 
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 60;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 100;
  
  // Vérifie si on clique sur la poignée 1
  if (abs(mouseX - (sliderX)) < 20 && abs(mouseY - handle1Y) < 10) {
    dragging1 = true;
  }

  // Vérifie si on clique sur la poignée 2
  if (abs(mouseX - (sliderX)) < 20 && abs(mouseY - handle2Y) < 10) {
    dragging2 = true;
  }

  // Si on a cliqué dans la zone du graphique sans compter le padding
  if (mouseX > graphX && mouseX < graphX + graphW && mouseY > graphY && mouseY < graphY + graphH){

    // On commence par récupérer le timestamp associé à la coordonnée X en castant le point pixel en timestamp
    let clickedArea = map(mouseX, graphX, graphX + graphW, intervalDataWeNeed[0].timeStamp, intervalDataWeNeed[intervalDataWeNeed.length - 1].timeStamp)

    // Si on est actullement en affichage mois, on passe en affichage semaine autour de la zone prise. 
    if (currentAggregation == 'month'){

      // Rayon de 15 semaines autour de la date
      const inTmStp15Weeks = 15 * WEEK
      let potentialNewStartTime = constrain(clickedArea - inTmStp15Weeks, timeStampStartDate, timeStampEndDate)
      let potentialNewEndTime = constrain(clickedArea + inTmStp15Weeks, timeStampStartDate, timeStampEndDate)

      // On vérifie si l'interval résultant n'est pas trop petit, plus que les 30 semaines (après tout, on a contraint les valeurs à ne pas dépasser un certain seuil, ceux de date max possible et date min pissible alors l'intervalle choisi, selon le click, pourrait être trop petit ; on va alors compter l'écart des 30 semaines à partir de la borne qui a été contrainte)
      if ((potentialNewEndTime - potentialNewStartTime) < inTmStp15Weeks * 2 - 2000 ){

        // Si c'est la date de début qui a été contrainte, ça veut dire qu'on est au bord à gauche, donc c'est à partir de la gauche qu'on compte les 30 semaines
        if (potentialNewStartTime !== clickedArea - inTmStp15Weeks){

          potentialNewEndTime = potentialNewStartTime + inTmStp15Weeks * 2
        }
        else{

          // Sinon à partie de la droite
          potentialNewStartTime = potentialNewEndTime - inTmStp15Weeks * 2
        }
      }

      startDate = timestampToDateString(potentialNewStartTime)
      endDate = timestampToDateString(potentialNewEndTime)

      // On actualise aussi la position des poignées de façon smooth
      handle1Y = map(potentialNewStartTime, timeStampStartDate, timeStampEndDate, verticalStickMagins, height - verticalStickMagins)

      handle2Y = map(potentialNewEndTime, timeStampStartDate, timeStampEndDate, verticalStickMagins, height - verticalStickMagins)

    }


    // Si on est actullement en affichage semaine, on passe en affichage jours autour de la zone prise.
    if (currentAggregation == 'week'){

      // Rayon de 40 jours autour de la date
      const inTmStp40Days = 40 * DAY
      let potentialNewStartTime = constrain(clickedArea - inTmStp40Days, timeStampStartDate, timeStampEndDate)
      let potentialNewEndTime = constrain(clickedArea + inTmStp40Days, timeStampStartDate, timeStampEndDate)

      // On vérifie si l'interval résultant n'est pas trop petit, plus que les 80 jours (après tout, on a contraint les valeurs à ne pas dépasser un certain seuil, ceux de date max possible et date min pissible alors l'intervalle choisi, selon le click, pourrait être trop petit ; on va alors compter l'écart des 80 jours à partir de la borne qui a été contrainte)
      if ((potentialNewEndTime - potentialNewStartTime) < inTmStp40Days * 2 - 2000 ){

        // Si c'est la date de début qui a été contrainte, ça veut dire qu'on est au bord à gauche, donc c'est à partir de la gauche qu'on compte les 80 jours
        if (potentialNewStartTime !== clickedArea - inTmStp40Days){

          potentialNewEndTime = potentialNewStartTime + inTmStp40Days * 2
        }
        else{

          // Sinon à partie de la droite
          potentialNewStartTime = potentialNewEndTime - inTmStp40Days * 2
        }
      }

      startDate = timestampToDateString(potentialNewStartTime)
      endDate = timestampToDateString(potentialNewEndTime)

      // On actualise aussi la position des poignées de façon smooth
      handle1Y = map(potentialNewStartTime, timeStampStartDate, timeStampEndDate, verticalStickMagins, height - verticalStickMagins)

      handle2Y = map(potentialNewEndTime, timeStampStartDate, timeStampEndDate, verticalStickMagins, height - verticalStickMagins)

    }

    // Si on est en aggrégation jour, on je fais rien, c'est suffisamment zoomé

    riverGraphicsNCoAcutualization() // On recraft alors les bonnes données et on actualise ce qu'il y a à actualiser
  }





  // Gestion des clics pour la zone FLOATING CALENDAR

  // ?????????????????????????????????????????????????,
}

// Gestion du drag
function mouseDragged() {
  if (dragging1) {
    // La position du poignet 1 ne peut pas aller plus haut que 20, et plus bas que l'autre poignée avec un écart de 10 entre eux
    handle1Y = constrain(mouseY, verticalStickMagins, handle2Y - 10);

  }
  if (dragging2) {
    // La position du poignet 1 ne peut pas aller plus haut que l'autre poignée avec un écart de 10 entre eux, et plus bas que heigt - 20
    handle2Y = constrain(mouseY, handle1Y + 10, height - verticalStickMagins);

  }
}


// Quand on relâche la souris
function mouseReleased() {

  if (dragging1 || dragging2){
    // Si l'un des curseurs avait été préssé précedemment, donc que l'intervalle a changé, on reconstruit les données d'intérêt pour les graphique

  
    riverGraphicsNCoAcutualization()
  
  }

  dragging1 = false;
  dragging2 = false;
}


// Pour arrêter la boucle des draw quand on n'est pas sur le sketch, pour l'optim
// 
const observer = new IntersectionObserver((entries)=> {

  entries.forEach(entry=>{

  
    if (entry.isIntersecting){

      console.log("Intercepting")
      loop()
    }else{
      noLoop()
    }
  })
}, {threshold : 0.05})

function callBackForVegeOrFruitObserver(entries){
  entries.forEach(entry => {
    const el = entry.target;

    // entrée dans la fenêtre -> sort de terre
    if (entry.isIntersecting) {
      el.classList.add('out-of-ground');
    } else {
      // sortie de la fenêtre -> rentre dans la terre
      el.classList.remove('out-of-ground');
    }
  });
}




//BIO : Agriculture Biologique
//DUR : Produits durable
//VEGE : végétarien
//LOC : Marque de Terre de Sources (facultatif)

//AB (Bio)
//SVP (Végé)
//BBC (Bleu Blanc Coeur)