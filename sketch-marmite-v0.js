let dataSet;

let canvas;

// Structure d'objets qui contiendra nos données en mémoire vive
let Table

let burgerImg;

// Date de début et de fin d'intervalle
let startDate
let endDate 

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


// Des tableaux pour retenir les valeurs de pourcentages qui nous intéressent dans l'intervalle qui nous intéresse
let intervalDataWeNeed
let intervalDataVegeWeeksWeNeed

// Tableau pou retenir les aléatoires des points du cercle rougr fait main
let randomForHandCirle
let lastUpdate
let step   // densité de points
let numPoints;  // nombre fixe de points


/*******************XXXXXXX GRAPHIQUE MARMITE */
// Variables et classes pour le graphique MARMITE
// ========== CONFIGURATION DU GRAPHIQUE ==========

// ========== CONFIGURATION DU GRAPHIQUE-MARMITE ==========
const CHART_CONFIG = {
  // Zone de dessin
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  
  // Dimensions de la marmite
  potTopY: 0,        // Haut de la marmite
  potBottomY: 0,     // Bas de la marmite
  potLeftX: 0,       // Paroi gauche
  potRightX: 0,      // Paroi droite
  potWidth: 0,       // Largeur intérieure
  
  // Marges pour le contenu
  paddingLeft: 80,
  paddingRight: 50,
  paddingTop: 60,
  paddingBottom: 120,
  
  // Seuils EGalim
  thresholds: {
    bio: 20,
    durable: 50,
    local: 50
  },
  
  // Couleurs thème "cantine"
  colors: {
    bio: {
      above: '#ffffff',      // Vapeur blanche (conforme)
      below: '#ff6b4a',      // Rouge-orange chaleur (non conforme)
      line: '#7cb342',       // Vert salade
      glow: '#aed581'
    },
    durable: {
      above: '#ffffff',
      below: '#ff6b4a',
      line: '#5e92f3',       // Bleu vif (changé)
      glow: '#90caf9'
    },
    local: {
      above: '#ffffff',
      below: '#ff6b4a',
      line: '#ab47bc',       // Violet/mauve (changé)
      glow: '#ce93d8'
    },
    pot: '#757575',          // Gris métal marmite
    potShine: '#bdbdbd',     // Reflets marmite
    potDark: '#424242',      // Ombres marmite
    background: '#fef5e7',   // Beige clair (mur de cuisine)
    fire: ['#ff6b00', '#ff8800', '#ffaa00', '#ffcc00', '#ffe066'],
    rock: '#5d4037',
    text: '#3e2723',
    boil: '#4fc3f7'          // Bleu eau bouillante
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

// Type de données à afficher ('bio', 'durable', 'local')
let currentDataType = 'bio';

// Niveau d'agrégation actuel ('day', 'week', 'month')
let currentAggregation = 'day';

// Animation : progression du dessin de la courbe (0.0 à 1.0)
let animationProgress = 0;

const ANIMATION_SPEED = 0.02;

// Points de données transformés pour l'affichage
let chartPoints = [];

// Segments de courbe (pour gérer les discontinuités)
let curveSegments = [];

// État de l'animation
let isAnimating = true;

// ✅ Animation de l'épaisseur de la courbe (effet liquide)
let liquidAnimationTime = 0;

// ✅ Point actuellement survolé
let hoveredPoint = null;


// Particules de feu
let fireParticles = [];
let fireIntensity = 1.0;  // 1.0 = normal, 2.0 = intense

// Bulles d'ébullition
let bubbles = [];

// Audio
let audioContext;
let fireSound = false;


// ========== CLASSE PARTICULE DE FEU ==========
class FireParticle {
  constructor(x, y) {
    this.x = x + random(-20, 20);
    this.baseY = y;
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
  
  isDead(liquidY) {
    return this.y < liquidY - 20;
  }
}


/************************************************ */
// Variables et classes pour le calendar flottant 
// ========== CONFIGURATION DU CALENDRIER ==========
// ?????????????????????????????????????????????


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
    "menus_cantines_pretraite_v2_prix_excel_fiendly_norm.csv",
    "csv",
    "header"
  );

  burgerImg = loadImage("burger.png")

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

  // Tant que la date sur laquelle on est est plus petite que la date de début d'intrval, on continue
  while(Table[expeditionner].Date < startDate){

    expeditionner ++
  }

  // On a trouvé une date supérieure ou égale à la date de début d'interval

  // Tant que la date où on est actuellement existe (donc sa ligne existe bien), est plus petite que ou égale à la date de fin d'intervalle, on fait ce qu'il y a à faire
  while(expeditionner < Table.length && Table[expeditionner].Date <= endDate){

    let toAdd = Table[expeditionner].statsData
    toAdd['timeStamp'] = new Date(Table[expeditionner].Date).getTime();
    // On va ajouter la titmestamp du jour dans l'objet

    toAdd['week'] = parseInt(Table[expeditionner].Semaine)
    // Egalement le numéro de semaine ISO

    let splittedDate = (Table[expeditionner].Date).split("-")
    toAdd['month'] = parseInt(splittedDate[1]) - 1
    // Aussi le numéro de mois

    toAdd['year'] = parseInt(Table[expeditionner]['Année'])
    // L'année également

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
  canvas = createCanvas(windowWidth, windowHeight).parent("canvas1");
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

  btnStats.addEventListener("click", () => {
    document.querySelector("#canvas1").scrollIntoView({ behavior: "smooth" });
  });

  
  btVege.addEventListener("click", () => {
    document.querySelector("#canvas2").scrollIntoView({ behavior: "smooth" });
  });

  btnContexte.addEventListener("click", () => {
    document.querySelector("#overlay").scrollIntoView({ behavior: "smooth" });
  });


  
  //*************************************************** */
  //*************************************************** */
  //******************************* FIN GESTION DES MACHINS POUR L'OVERLAY ******* */
  //*************************************************** */
  //*************************************************** */


  step = 0.3;
  numPoints = Math.floor(TWO_PI / step);
  randomForHandCirle = []
  verticalStickMagins = 50;

  verticalStickLong = height - 2 * verticalStickMagins;


  // On convertit les lignes de dataSet en objets JavaScript pour plus de commodité
  Table = [];

  // Initialisation de notre structure dédiée aux semaines
  intervalDataVegeWeeksWeNeed = {}

  for (let i = 0; i < dataSet.getRowCount(); i++) {
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

    // On additionne tous les coûts de la journée
    dayCost = row['Prix_entree'] + row['Prix_plat'] + row['Prix_legumes'] + row['Prix_laitage'] + row['Prix_dessert'] + row['Prix_gouter'] + row['Prix_gouter_02']

    // On additionne tous les coûts de la journée mais en multipliant cette fois chaque coût par le booléen indiquant si l'entité de menu concernée en bio (si c'est bio, le booléen vaudra 1, donc la multiplication donnera la valeur même, si c'est faux, le booléen vaudra 0, alors c coût ne sera pas comptabilisé)
    dayBioCost = row['Prix_entree'] * row['Entrée_bio'] + row['Prix_plat'] * row['Plat_bio'] + row['Prix_legumes'] * row['Légumes_bio'] + row['Prix_laitage'] * row['Laitage_bio'] + row['Prix_dessert'] * row['Dessert_bio'] + row['Prix_gouter'] * row['Gouter_bio'] + row['Prix_gouter_02'] * row['Gouter_02_bio']

    // Comme dans le cas précédent, sauf que les booléens considérés sont à la fois ceux déterminant si le produit est oui ou non durable, et également ceux déterminant s'il est bio
    dayDurCost = row['Prix_entree'] * (row['Entrée_bio'] || row['Entrée_dur']) + row['Prix_plat'] * (row['Plat_bio'] || row['Plat_dur']) + row['Prix_legumes'] * (row['Légumes_bio'] || row['Légumes_dur']) + row['Prix_laitage'] * (row['Laitage_bio'] || row['Laitage_dur']) + row['Prix_dessert'] * (row['Dessert_bio'] || row['Dessert_dur']) + row['Prix_gouter'] * (row['Gouter_bio'] || row['Gouter_dur']) + row['Prix_gouter_02'] * (row['Gouter_02_bio'] || row['Gouter_02_dur'])

    // Comme pour le cas bio, sauf qu'ici on considère les booléens indiquant si oui ou non marque de terre source
    dayLocCost = row['Prix_entree'] * row['Entrée_loc'] + row['Prix_plat'] * row['Plat_loc'] + row['Prix_legumes'] * row['Légumes_loc'] + row['Prix_laitage'] * row['Laitage_loc'] + row['Prix_dessert'] * row['Dessert_loc'] + row['Prix_gouter'] * row['Gouter_loc'] + row['Prix_gouter_02'] * row['Gouter_02_loc']

    dayLocCost = dayLocCost + dayDurCost // Cas où on intègre Marque de Terre Source comme critère durable

    // On peut ajouter ces nouvelles données comme 'colonne' supplémentaire de la ligne
    row.statsData = { dayCost, dayBioCost, dayDurCost, dayLocCost };

    Table.push(row);

    
    // On initialise une variable qui retiendra la semaine précisée de son année, à laquelle appartient le jour current. Elle servira de clé dans le tableau des semaines de l'intervalle selectionné. Cette semaine précise, si elle existe pas déjà dans le tableau comme clé, sera donc créée. Si elle existe, on ajoute l'indice dans Table du jour en question au tableau
    let currWeek = `${Table[i]['Année']}-${Table[i]['Semaine']}`;

    (intervalDataVegeWeeksWeNeed[currWeek] ??= []).push(i)// Cette écriture va, si la clé existe pour l'objet simplement ajouter via push ce qu'on veut ajouter, sinond d'abord créer la clé qui sera initialisée à vide, puis ensuite push

  }

  // On prend la première date de notre dataset par défaut
  startDate = Table[0]['Date']
  timeStampStartDate = dateStringToTimestamp(startDate)

  // ___________ dernière _________________________________
  endDate = Table[Table.length - 1]['Date'];
  timeStampEndDate = dateStringToTimestamp(endDate)

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
  textFont("Caveat");  // Juste le nom de la police
  

  //**********************POUR LE POTGRAPHIQUE */
  // Updater les dimensions du graphique
  updateChartDimensions();
  
  // Déterminer le niveau d'agrégation optimal
  determineAggregation();
  
  // Transformer les données en points du graphique
  calculateChartPoints();
  
  // Interface utilisateur pour changer le type de données
  createControls();

  
  // Initialiser l'audio
  audioContext = new (window.AudioContext || window.webkitAudioContext)();



  //**********************POUR LE FLOATING CALENDAR GRAPHIQUE */
  // ??????????????????????????????????????????????????????????


  // Pour du deboogage potentiel
  for (let line of Table){

    console.log(line.Date)
    console.log(line.statsData)
  }

  console.log(startDate)
  console.log(endDate)
  console.log(Table.length)


}

function draw() {
  
  background(CHART_CONFIG.colors.background);


  // Mise en place de la zone curseur
  
  noStroke();
  fill("yellow");


  x = 0;
  y = 0;
  w = 600;
  h = height;
  r = h/2 * 1.3; // profondeur de l’arrondi

  beginShape();

  // Coin haut gauche -> haut droit interne
  vertex(x, y);
  vertex(x + w, y);

  // Arc concave vers l’intérieur (côté droit)
  let cx = x + w;       // centre de l’arc (côté droit du rectangle)
  let cy = y + h / 2;
  
  // Échantillonne l’arc de -90° à +90°
  for (let a = -HALF_PI; a <= HALF_PI; a += 0.05) {
    let vx = cx - r * cos(a);  // soustraction = concave
    let vy = cy + r * sin(a);
    vertex(vx, vy);
  }

  // Coin bas droit interne -> bas gauche
  vertex(x + w, y + h);
  vertex(x, y + h);

  endShape(CLOSE);

  
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

  // Barre verticale
  stroke(0);
  strokeWeight(2);
  line(sliderX, sliderY1, sliderX, sliderY2);

  
  // Burger slider
  image(burgerImg, sliderX - 150, height - verticalStickMagins - 83, 300, 200)


  // Poignée 1
  strokeWeight(6);
  line(sliderX - 15, handle1Y, sliderX + 15, handle1Y);

  // Poignée 2
  line(sliderX - 15, handle2Y, sliderX + 15, handle2Y);

  // Gros volume entre poignées 1 et 2
  strokeWeight(9);
  line(sliderX, handle1Y, sliderX, handle2Y)

  strokeWeight(1);


  // // Dates avec police stylée, légèrement décalées
  // textSize(18)
  // text(startDate, sliderX + 20, handle1Y - 5);
  // text(endDate, sliderX + 20, handle2Y - 5);

//***** MISE EN PLACE DES ARDOISES DE DATE

push()
textAlign(CENTER, CENTER);
textSize(16);
textFont('Caveat');

let startParts = startDate.split('-'); // ["2023","01","26"]
let endParts = endDate.split('-');     // ["2025","07","23"]

// Tableau des mois
let months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

// Dessiner ardoise stylisée
fill(15, 23, 42); // couleur ardoise marron foncé
stroke(0);
strokeWeight(0);

// START / END rectangles dimensions & positions (réutilisées plus bas)
let rectW = 120;
let rectH = 50;

// Il faut controller que les ardoises ne débordent pas hors du cadre. On va le faire avec constrain
let rect1X = sliderX + sliderAreaHalfWidth + 3;
let rect1Y = constrain(handle1Y - 50, 0, height - 2 * rectH); // On prend en compte la taille de l'autre adroise potentiellement, si on est bas
let rect2X = sliderX + sliderAreaHalfWidth + 3;
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
  if (hoveredPoint !== null) {
    drawTooltip(hoveredPoint);
  }

  //drawInstructions();


  /********************************** POUR LE FLOATING CALENDAR GRAPHIQUE */
 //??????????????????????????????????????????????????????????????????????????

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
      const year = day.year;
      
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
  const graphY = CHART_CONFIG.potTopY + 40;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 80;
  
  // Convertir les données en points de graphique
  let currentSegment = [];
  
  aggregatedData.forEach((day, index) => {
    const percentage = (day[dataKey] / day.dayCost) * 100;
    
    // ✅ CORRECTION : Utiliser les bornes des données agrégées pour le mapping
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
      x,
      y,
      percentage,
      timestamp: day.timeStamp,
      index,
      aggregatedFrom: day.aggregatedFrom
    };
    
    chartPoints.push(point);
    
    // Détecter les discontinuités (trous > 3 jours pour données journalières,
    // ou changement de période pour données agrégées)
    if (index > 0) {
      const prevDay = aggregatedData[index - 1];
      const timeDiff = day.timeStamp - prevDay.timeStamp;
      const daysDiff = timeDiff / (24 * 60 * 60 * 1000);
      
      // Seuil de discontinuité selon l'agrégation
      let gapThreshold;
      if (currentAggregation === 'day') {
        gapThreshold = 3; // Plus de 3 jours = trou
      } else if (currentAggregation === 'week') {
        gapThreshold = 10; // Plus de 10 jours = trou
      } else {
        gapThreshold = 35; // Plus d'un mois = trou
      }
      
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
  
  console.log(`${chartPoints.length} points, ${curveSegments.length} segments`);
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
  const centerX = (leftX + rightX) / 2;
  
  // Ombre de la marmite
  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
  drawingContext.shadowOffsetY = 10;
  
  // Corps de la marmite
  fill(CHART_CONFIG.colors.pot);
  stroke(CHART_CONFIG.colors.potDark);
  strokeWeight(4);
  
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

  // Dessiner le bouillant / Seuil
  drawBoilingLiquid();
  
  // Dessiner les discontinuités (gaps)
  drawGaps();
  
  // Dessiner la courbe avec zones colorées
  drawDataCurve();

  // Dessiner les bulles
  drawBubbles();
  

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
  const graphY = CHART_CONFIG.potTopY + 40;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 80;
  
  
  // Lignes horizontales (pourcentages)
  for (let pct = 0; pct <= 100; pct += 20) {
    const y = map(pct, 0, 100, graphY + graphH, graphY);
    line(graphX, y, graphX + graphW, y);
  }

}

// ========== AXES DU GRAPHIQUE ==========
function drawAxes() {
  stroke(CHART_CONFIG.colors.potDark);
  strokeWeight(3);
  
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 40;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 80;
    
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

function drawBoilingLiquid() {
  const threshold = CHART_CONFIG.thresholds[currentDataType];
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 40;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 80;
  
  const liquidY = map(threshold, 0, 100, graphY + graphH, graphY);
  
  // Surface bouillonnante
  noStroke();
  fill(CHART_CONFIG.colors.boil + '99');
  
  beginShape();
  for (let x = graphX; x <= graphX + graphW; x += 5) {
    const wave = sin((x * 0.05) + liquidAnimationTime) * 3;
    if (x === graphX) {
      vertex(x, liquidY + wave);
    } else {
      vertex(x, liquidY + wave);
    }
  }
  vertex(graphX + graphW, liquidY + 10);
  vertex(graphX, liquidY + 10);
  endShape(CLOSE);
  
  // Ligne ondulante
  stroke(CHART_CONFIG.colors.boil);
  strokeWeight(3);
  noFill();
  
  beginShape();
  for (let x = graphX; x <= graphX + graphW; x += 5) {
    const wave = sin((x * 0.05) + liquidAnimationTime) * 3;
    vertex(x, liquidY + wave);
  }
  endShape();
  
  // Créer des bulles
  if (frameCount % 10 === 0) {
    bubbles.push(new Bubble(
      random(graphX, graphX + graphW),
      liquidY
    ));
  }
  
  // Label du seuil
  noStroke();
  //fill(CHART_CONFIG.colors.text);
  fill("red")
  textAlign(LEFT, CENTER);
  textSize(15);
  textStyle(BOLD);
  text(`🌡️ Seuil: ${threshold}%`, graphX + graphW + 15, liquidY);
}


function drawBubbles() {
  const threshold = CHART_CONFIG.thresholds[currentDataType];
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 40;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 80;
  const liquidY = map(threshold, 0, 100, graphY + graphH, graphY);
  
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    
    if (bubbles[i].isDead(liquidY)) {
      bubbles.splice(i, 1);
    }
  }
}

// ========== DESSINER LES ZONES DE DISCONTINUITÉ ==========
function drawGaps() {
  if (curveSegments.length <= 1) return;
  
  const graphY = CHART_CONFIG.potTopY + 40;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 80;
  
  noStroke();
  fill(CHART_CONFIG.colors.potDark + '22');
  
  // Dessiner une zone semi-transparente entre les segments
  for (let i = 0; i < curveSegments.length - 1; i++) {
    const endOfSegment = curveSegments[i][curveSegments[i].length - 1];
    const startOfNext = curveSegments[i + 1][0];
    
    // Zone entre les deux segments
    rect(endOfSegment.x, graphY, startOfNext.x - endOfSegment.x, graphH);
    
    // Texte explicatif
    textAlign(CENTER, CENTER);
    textStyle(ITALIC);
    push()
    fill(CHART_CONFIG.colors.text + '99');
    text('⚠️ Gap', (endOfSegment.x + startOfNext.x) / 2, graphY + graphH / 2);
    pop()

        
    // Lignes pointillées
    stroke(CHART_CONFIG.colors.text + '44');
    strokeWeight(2);
    drawingContext.setLineDash([5, 5]);
    line(endOfSegment.x, graphY, endOfSegment.x, graphY + graphH);
    line(startOfNext.x, graphY, startOfNext.x, graphY + graphH);
    drawingContext.setLineDash([]);
  }
}

// ========== COURBE DE DONNÉES AVEC ZONES COLORÉES ET DOUBLE ANIMATION ==========
function drawDataCurve() {
  if (chartPoints.length < 2) return;
  
  const threshold = CHART_CONFIG.thresholds[currentDataType];
  const colors = CHART_CONFIG.colors[currentDataType];
  
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 40;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 80;
  const baselineY = graphY + graphH;
  const thresholdY = map(threshold, 0, 100, baselineY, graphY);
  
  // ✅ ANIMATION 1 : Progression du dessin de la courbe (0 → 1)
  const totalPointsToShow = Math.floor(chartPoints.length * animationProgress);
  
  // Dessiner chaque segment séparément
  let pointsDrawn = 0;
  
  for (let segIdx = 0; segIdx < curveSegments.length; segIdx++) {
    const segment = curveSegments[segIdx];
    
    // Calculer combien de points de ce segment afficher
    const segmentStart = pointsDrawn;
    const segmentEnd = pointsDrawn + segment.length;
    
    if (segmentStart >= totalPointsToShow) break;
    
    const pointsInSegment = Math.min(segment.length, totalPointsToShow - pointsDrawn);
    
    if (pointsInSegment <= 0) continue;
    
    // Zones colorées (vapeur blanche au-dessus, chaleur rouge en-dessous)
    for (let i = 0; i < pointsInSegment - 1; i++) {
      const p1 = segment[i];
      const p2 = segment[i + 1];
      
      const isAbove = p1.percentage >= threshold;
      const fillColor = isAbove ? colors.above : colors.below;
      
      fill(fillColor + '55');
      noStroke();
      
      beginShape();
      vertex(p1.x, thresholdY);
      vertex(p1.x, p1.y);
      vertex(p2.x, p2.y);
      vertex(p2.x, thresholdY);
      endShape(CLOSE);
    }
    
    // ✅ ANIMATION 2 : Effet liquide avec épaisseur variable
    // Dessiner la courbe segment par segment avec épaisseur animée
    
    // Couche 1 : Glow externe avec épaisseur variable
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = colors.glow;
    noFill();
    
    for (let i = 0; i < pointsInSegment - 1; i++) {
      const p1 = segment[i];
      const p2 = segment[i + 1];
      
      // ✅ Calculer l'épaisseur variable (effet eau qui coule)
      const waveOffset = (i / pointsInSegment) * Math.PI * 4; // 4 vagues le long du segment
      const thickness = 4 + sin(liquidAnimationTime + waveOffset) * 1.5; // Oscille entre 3 et 7
      
      strokeWeight(thickness);

      const isAbove = p1.percentage >= threshold;
      stroke(isAbove ? colors.line : colors.below); // Couleur différente si sous seuil

      line(p1.x, p1.y, p2.x, p2.y);
    }
    
    drawingContext.shadowBlur = 0;
    
    // Couche 2 : Ligne principale avec épaisseur variable (légèrement décalée)
    for (let i = 0; i < pointsInSegment - 1; i++) {
      const p1 = segment[i];
      const p2 = segment[i + 1];
      
      // ✅ Même vague mais avec décalage de phase pour effet de profondeur
      const waveOffset = (i / pointsInSegment) * Math.PI * 4;
      const thickness = 3 + sin(liquidAnimationTime + waveOffset + 0.5) * 1.2; // Oscille entre 1.8 et 4.2
      
      strokeWeight(thickness);

          
      const isAbove = p1.percentage >= threshold;
      stroke(isAbove ? colors.line : colors.below); // Couleur différente si sous seuil

      line(p1.x, p1.y, p2.x, p2.y);
    }
    
    // Point pulsant au dernier point visible de ce segment
    if (pointsInSegment === segment.length || segmentEnd > totalPointsToShow) {
      const lastPoint = segment[pointsInSegment - 1];
      const pulse = sin(frameCount * 0.1) * 3 + 8;
      fill(colors.glow);
      noStroke();
      circle(lastPoint.x, lastPoint.y, pulse);
      
      const isAbove = lastPoint.percentage >= threshold;
      fill(isAbove ? colors.line : colors.below); // Couleur différente si sous seuil
      circle(lastPoint.x, lastPoint.y, 6);
    }
    
    pointsDrawn += segment.length;
  }
}

// ========== LABELS DES AXES ==========
function drawLabels() {

  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 40;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 80;

  
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
  textSize(15);
  textStyle(BOLD);
  fill(CHART_CONFIG.colors.text);
  text('Pourcentage (%)', 0, -20);
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
    graphY + graphH + 35
  );
  
}




// ========== LABELS PAR MOIS (VERSION INTELLIGENTE) ==========
function drawMonthLabels(graphX, graphY, graphW, graphH) {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const numMonths = chartPoints.length;
  
  // Si plus de 18 mois : afficher seulement les années
  if (numMonths > 18) {
    let lastYear = null;
    
    chartPoints.forEach((point, index) => {
      const date = new Date(point.timestamp);
      const year = date.getFullYear();
      
      if (year !== lastYear) {
        lastYear = year;
        
        textSize(13);
        textStyle(BOLD);
        fill(CHART_CONFIG.colors.text);
        text(year, point.x, graphY + graphH + 10);
        
        // Trait vertical
        stroke(CHART_CONFIG.colors.text + '66');
        strokeWeight(2);
        line(point.x, graphY + graphH, point.x, graphY + graphH + 5);
        noStroke();
      }
    });
  } 
  // Si 12-18 mois : afficher 1 mois sur 2
  else if (numMonths > 12) {
    chartPoints.forEach((point, index) => {
      if (index % 2 !== 0) return;
      
      const date = new Date(point.timestamp);
      
      textSize(10);
      fill(CHART_CONFIG.colors.text);
      text(`${months[date.getMonth()]}`, point.x, graphY + graphH + 10);
      
      // Année si changement
      if (index === 0 || new Date(chartPoints[Math.max(0, index - 2)].timestamp).getFullYear() !== date.getFullYear()) {
        textSize(8);
        fill(CHART_CONFIG.colors.text + 'AA');
        text(date.getFullYear(), point.x, graphY + graphH + 23);
      }
    });
  }
  // Sinon : afficher tous les mois
  else {
    chartPoints.forEach((point, index) => {
      const date = new Date(point.timestamp);
      
      textSize(10);
      fill(CHART_CONFIG.colors.text);
      text(`${months[date.getMonth()]}`, point.x, graphY + graphH + 10);
      
      // Année au changement
      if (index === 0 || new Date(chartPoints[index - 1].timestamp).getFullYear() !== date.getFullYear()) {
        textSize(8);
        fill(CHART_CONFIG.colors.text + 'AA');
        text(date.getFullYear(), point.x, graphY + graphH + 23);
      }
      
      // Jours agrégés
      if (point.aggregatedFrom > 1) {
        textSize(7);
        fill(CHART_CONFIG.colors.text + '77');
        text(`(${point.aggregatedFrom}j)`, point.x, graphY + graphH + 33);
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
    text(`S${index + 1}`, point.x, graphY + graphH + 10);
    
    // Date de début
    textSize(13);
    fill(CHART_CONFIG.colors.text + '99');
    text(`${date.getDate()}/${date.getMonth() + 1}`, point.x, graphY + graphH + 22);
    
    // Jours agrégés
    if (point.aggregatedFrom > 1) {
      textSize(7);
      fill(CHART_CONFIG.colors.text + '77');
      text(`(${point.aggregatedFrom}j)`, point.x, graphY + graphH + 32);
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
    if (index === 0 || new Date(chartPoints[Math.max(0, index - step)].timestamp).getFullYear() !== date.getFullYear()) {
      textSize(8);
      fill(CHART_CONFIG.colors.text + '99');
      text(date.getFullYear(), point.x, graphY + graphH + 22);
    }
  });
}


// ========== TITRE DU GRAPHIQUE ==========
function drawTitle() {
  textAlign(CENTER, TOP);
  textSize(20);
  textStyle(BOLD);
  
  const titles = {
    bio: '🌱 Évolution pourcentage Bio',
    durable: '♻️ Évolution pourcentage Durable',
    local: '🥕 Évolution pourcentage Durable (Local inclus)'
  };

  fill(CHART_CONFIG.colors[currentDataType].line);

  drawingContext.shadowBlur = 10;
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
  fill("#c0bcbcff");
  
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

  const controlY = CHART_CONFIG.y - 50;
  const controlX = CHART_CONFIG.x;
  
  const btnBio = createButton('🌱 Bio');
  // Boutons pour changer le type de données
  //const btnBio = createButton('🌱 Bio');
  btnBio.position(controlX, controlY);
  btnBio.mousePressed(() => changeDataType('bio'));
  styleButton(btnBio);
  
  const btnDurable = createButton('♻️ Durable');
  btnDurable.position(controlX + 100, controlY);
  btnDurable.mousePressed(() => changeDataType('durable'));
  styleButton(btnDurable);
  
  const btnLocal = createButton('📍 Durable Local');
  btnLocal.position(controlX + 220, controlY);
  btnLocal.mousePressed(() => changeDataType('local'));
  styleButton(btnLocal);

  // Bouton pour rejouer l'animation
  const btnReplay = createButton('🔥!');
  btnReplay.position(controlX + 360, controlY);
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
  
  // Info sur l'agrégation
  const infoDiv = createDiv();
  infoDiv.position(controlX + 460, controlY + 5);
  infoDiv.style('color', CHART_CONFIG.colors.text);
  infoDiv.style('font-size', '12px');
  infoDiv.id('aggregation-info');
  updateAggregationInfo();

  
  btnBio.parent(mainContainer); // maintenant le bouton est dans le même container que le canvas
  //btnBio.position(20, 20);     // position absolue par rapport au container
  //btnBio.style('position','absolute');
  btnDurable.parent(mainContainer);
  btnLocal.parent(mainContainer);
  btnReplay.parent(mainContainer);
  infoDiv.parent(mainContainer);



}

function styleButton(btn, isSpecial = false) {
  if (isSpecial) btn.style('margin-left', '20px')
  btn.style('padding', '10px 20px');
  btn.style('margin-right', '10px');
  btn.style('font-size', '14px');
  btn.style('cursor', 'pointer');
  //btn.style('border', '2px solid #8d6e63');
  btn.style('border-radius', '8px');
  btn.style('background', isSpecial ? '#ff6b00' : '#fff8e1');
  btn.style('color', isSpecial ? '#fff' : '#3e2723');
  btn.style('font-weight', 'bold');
  btn.style('transition', 'all 0.3s');
  
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
    infoDiv.style('color', CHART_CONFIG.colors.text);

  }
}

// ========== CHANGER LE TYPE DE DONNÉES ==========
function changeDataType(type) {
  if (type === currentDataType) return;
  
  currentDataType = type;
  calculateChartPoints();
  replayAnimation();
}

// ========== REJOUER L'ANIMATION ==========
function replayAnimation() {
  animationProgress = 0;
  isAnimating = true;

  
  // Raviver le feu !
  fireIntensity = 2.5;
  
  // Son de feu
  playFireSound();
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

// ========== VÉRIFIER LE SURVOL (AMÉLIORATION DÉTECTION) ==========
function checkHover() {
  hoveredPoint = null;
  
  // Zone de tolérance plus large pour faciliter la détection
  const tolerance = 15;
  
  const pointsToShow = Math.floor(chartPoints.length * animationProgress);
  
  // Parcourir tous les points visibles
  for (let i = 0; i < pointsToShow; i++) {
    const p = chartPoints[i];
    const d = dist(mouseX, mouseY, p.x, p.y);
    
    if (d < tolerance) {
      hoveredPoint = p;
      cursor(HAND); // Changer le curseur
      return; // Point trouvé, arrêter la recherche
    }
  }
  
  // Si aucun point n'est survolé, restaurer le curseur
  cursor(ARROW);
}


// ========== AFFICHAGE TOOLTIP (VERSION AMÉLIORÉE) ==========
function drawTooltip(point) {
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
  let tooltipY = mouseY - 70;
  
  const tooltipWidth = 200;
  const tooltipHeight = point.aggregatedFrom > 1 ? 100 : 85;
  
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
  
  // Cercle sur le point survolé
  fill(CHART_CONFIG.colors[currentDataType].glow);
  noStroke();
  circle(point.x, point.y, 12);
  fill(255);
  circle(point.x, point.y, 6);
  
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
  fill(isAbove ? CHART_CONFIG.colors[currentDataType].line : CHART_CONFIG.colors[currentDataType].below);
  text(pctStr, tooltipX, tooltipY - tooltipHeight / 2 + 50);
  
  // Statut
  textSize(11);
  textStyle(NORMAL);
  const statusIcon = isAbove ? '✓' : '✗';
  const statusText = isAbove ? 'Conforme' : 'Non conforme';
  fill(isAbove ? '#2e7d32' : '#c62828');

  text(`${statusIcon} ${statusText}`, tooltipX, tooltipY - tooltipHeight / 2 + 75);
  
  // Info agrégation
  if (point.aggregatedFrom > 1) {
    textSize(12);
    fill(CHART_CONFIG.colors.textDim || CHART_CONFIG.colors.text + '99');
    text(`(Moyenne sur ${point.aggregatedFrom} jours)`, tooltipX, tooltipY - tooltipHeight / 2 + 90);
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

  replayAnimation();

  updateAggregationInfo();
}



/********************************************** */
/**************FIN ZONE FONCTIONS CHART RIVER */
/********************************************** */




/********************************************** */
/**************DEBUT ZONE FONCTIONS FLOATING AND SAILING CALENDAR */
/********************************************** */



// ???????????????????????????????????????????????

/********************************************** */
/**************FIN ZONE FONCTIONS FLOATING AND SAILING CALENDAR */
/********************************************** */





/********************************************** */
/*************** ZONE FONCTIONS INTERACTIONS SOURIS */
/********************************************** */

// Gestion du clic
function mousePressed() {

 
  const graphX = CHART_CONFIG.potLeftX + 40;
  const graphY = CHART_CONFIG.potTopY + 40;
  const graphW = CHART_CONFIG.potWidth - 80;
  const graphH = CHART_CONFIG.potBottomY - CHART_CONFIG.potTopY - 80;
  
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
}, {threshold : 0.2})

//BIO : Agriculture Biologique
//DUR : Produits durable
//VEGE : végétarien
//LOC : Marque de Terre de Sources (facultatif)

//AB (Bio)
//SVP (Végé)
//BBC (Bleu Blanc Coeur)