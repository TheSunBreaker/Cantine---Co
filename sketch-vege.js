// Sketch 2 en mode instant pour pouvoir avoir deux canvas simultanés

let sketchVege = function(p){

    let vegeCanvas

    
    // États de navigation
    let currentView = 'years'; // 'years', 'months', 'weeks', 'days'
    let selectedYear = null;
    let selectedMonth = null;
    let selectedWeek = null;
    
    // Animation et transitions
    let transitionProgress = 0;
    let isTransitioning = false;
    let transitionSpeed = 0.03;
    let zoomOrigin = { x: 0, y: 0 };
    
    // Données structurées
    let yearsData = {};
    
    // Éléments visuels
    let yearClusters = [];
    let monthClusters = [];
    let weekClusters = [];
    let dayCards = [];
    
    // Palette de couleurs thématique
    const colors = {
        vegGreen: '#4CAF50',
        nonVegRed: '#E53935',
        bg: '#F5F5F0',
        text: '#2C3E50',
        accent: '#FFA726',
        border: '#8D6E63'
    };
    
    // Noms des mois en français
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

                           
    p.setup = function(){

        vegeCanvas = p.createCanvas(1251, 573).parent("canvas2")

        
        // On observe le wrapper du canvas (le <div id="canvas2">)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log("Canvas2 visible");
                    p.loop();
                } else {
                    p.noLoop();
                }
            });
        }, { threshold: 0.05 });

        observer.observe(vegeCanvas.elt.parentNode); 
        // vegeCanvas.elt = <canvas>
        // .parentNode = le <div> dans lequel on l’a attaché
     
        // Préparation des données
        prepareData();
        
        // Création des clusters initiaux (années)
        createYearClusters();

        p.textFont('Inter')

    }

   
    p.draw = function() {
        p.background(colors.bg);
        
        // Gestion des transitions de zoom
        if (isTransitioning) {
            transitionProgress += transitionSpeed;
            if (transitionProgress >= 1) {
                transitionProgress = 0;
                isTransitioning = false;
            }
        }

        p.cursor(p.ARROW);
        
        // Affichage selon la vue actuelle
        if (isTransitioning) {
            // Pendant la transition, afficher l'effet de zoom
            displayTransition();
        } else {
            switch(currentView) {
                case 'years':
                    displayYearClusters();
                    break;
                case 'months':
                    displayMonthClusters();
                    break;
                case 'weeks':
                    displayWeekClusters();
                    break;
                case 'days':
                    displayDayCards();
                    break;
            }
        }
        
        // Bouton retour (sauf vue années)
        if (currentView !== 'years' && !isTransitioning) {
            drawBackButton();
        }
    };
    
    // ==================== PRÉPARATION DES DONNÉES ====================
    
    // function prepareData() {
    //     // Structurer les données par année, mois, semaine
    //     for (let key in intervalDataVegeWeeksWeNeed) {
    //         let [year, week] = key.split('-');
    //         let indices = intervalDataVegeWeeksWeNeed[key];
            
    //         // Initialiser l'année si nécessaire
    //         if (!yearsData[year]) {
    //             yearsData[year] = {
    //                 months: {},
    //                 hasVegeWeek: true  // Initialisé à true, sera false si une semaine n'est pas végé
    //             };
    //         }
            
    //         // Pour chaque jour de la semaine, récupérer le mois
    //         indices.forEach(idx => {
    //             let row = Table[idx];
    //             let date = new Date(row.Date);
    //             let month = date.getMonth() + 1; // 1-12
                
    //             // Initialiser le mois si nécessaire
    //             if (!yearsData[year].months[month]) {
    //                 yearsData[year].months[month] = {
    //                     weeks: {},
    //                     hasVegeWeek: true  // Initialisé à true, sera false si une semaine n'est pas végé
    //                 };
    //             }
                
    //             // Initialiser la semaine si nécessaire
    //             if (!yearsData[year].months[month].weeks[week]) {
    //                 yearsData[year].months[month].weeks[week] = {
    //                     days: [],
    //                     hasVegeDay: false
    //                 };
    //             }
                
    //             // Ajouter le jour
    //             let isVegeDay = row.is_vege_day === 'True' || row.is_vege_day === true;
    //             //let hasVegeWeek = row.has_vege_week === 'True' || row.has_vege_week === true;
                
    //             yearsData[year].months[month].weeks[week].days.push({
    //                 index: idx,
    //                 date: date,
    //                 isVege: isVegeDay,
    //                 data: row
    //             });
                
    //             // Mettre à jour les flags
    //             if (isVegeDay) {
    //                 yearsData[year].months[month].weeks[week].hasVegeDay = true;
    //             }
    //             // Un mois n'est validé que si TOUTES ses semaines sont végé (ET logique)
    //             yearsData[year].months[month].hasVegeWeek = 
    //                 yearsData[year].months[month].hasVegeWeek && yearsData[year].months[month].weeks[week].hasVegeDay;
    //             // Une année n'est validée que si TOUTES ses semaines sont végé
    //             yearsData[year].hasVegeWeek = 
    //                 yearsData[year].hasVegeWeek && yearsData[year].months[month].hasVegeWeek;
    //         });
    //     }
        
    //     console.log("Données préparées:", yearsData);
    // }

    function prepareData() {

        // ================================
        // 1) COLLECTE ET STRUCTURATION DES DONNÉES
        // ================================

        // Structurer les données par année, mois, semaine
        for (let key in intervalDataVegeWeeksWeNeed) {

            let [year, week] = key.split('-');       // ex: "2023-12" → "2023", "12"
            let indices = intervalDataVegeWeeksWeNeed[key];

            // Initialiser l'année si nécessaire
            if (!yearsData[year]) {
                yearsData[year] = {
                    months: {},
                    // !!!!! On ne calcule plus ici hasVegeWeek !
                    // On l’évaluera APRES avoir rempli tous les mois.
                    hasVegeWeek: true 
                };
            }

            // Pour chaque jour listé dans cette semaine
            indices.forEach(idx => {

                let row = Table[idx];
                let date = new Date(row.Date);
                
                let isoYear = parseInt(year);
                let isoWeek = parseInt(week);

                // Date du jeudi de la semaine ISO
                let thursday = getDateOfISOWeek(isoYear, isoWeek, 4);

                // Le mois auquel appartient officiellement cette semaine
                let month = thursday.getMonth() + 1;


                // Initialiser le mois si nécessaire
                if (!yearsData[year].months[month]) {
                    yearsData[year].months[month] = {
                        weeks: {},
                        // !!! Même principe : on ne calcule PAS encore ici
                        hasVegeWeek: true 
                    };
                }

                // Initialiser la semaine si nécessaire
                if (!yearsData[year].months[month].weeks[week]) {
                    yearsData[year].months[month].weeks[week] = {
                        days: [],
                        hasVegeDay: false  // deviendra true si un seul jour végé existe
                    };
                }

                // Ajouter le jour dans la semaine correspondante
                let isVegeDay = row.is_vege_day === 'True' || row.is_vege_day === true;

                yearsData[year].months[month].weeks[week].days.push({
                    index: idx,
                    date: date,
                    isVege: isVegeDay,
                    data: row
                });

                // Mettre à jour le flag de la semaine
                if (isVegeDay) {
                    yearsData[year].months[month].weeks[week].hasVegeDay = true;
                }

            });
        }



        // ================================
        // 2) CALCUL DES FLAGS : SEMAINES → MOIS
        // ================================
        // À ce stade, on a rempli toutes les structures,
        // et maintenant on peut déterminer quels mois valident la règle.

        for (let year in yearsData) {

            for (let month in yearsData[year].months) {

                let monthObj = yearsData[year].months[month];

                // Un mois est validé VEGE si TOUTES ses semaines
                // ont au moins un jour végé.
                // (= équivalent du ET logique sur toutes les semaines)
                monthObj.hasVegeWeek = Object.values(monthObj.weeks)
                                            .every(week => week.hasVegeDay);

            }
        }



        // ================================
        // 3) CALCUL DES FLAGS : MOIS → ANNÉE
        // ================================
        // Même logique : une année n’est validée végé
        // que si TOUS ses mois sont validés.

        for (let year in yearsData) {

            let yearObj = yearsData[year];

            yearObj.hasVegeWeek = Object.values(yearObj.months)
                                        .every(month => month.hasVegeWeek);
        }



        // ================================
        // DEBUG FINAL
        // ================================
        console.log("Données préparées:", yearsData);
    }

    
    // ==================== CRÉATION DES CLUSTERS ====================
    
    function createYearClusters() {
        yearClusters = [];
        let years = Object.keys(yearsData).sort();
        
        years.forEach((year, i) => {
            let months = Object.keys(yearsData[year].months);
            let numPlates = months.length;
            let radius = 50 + numPlates * 4; // Encore plus petit
            
            // Position aléatoire mais espacée
            let x, y, tooClose;
            let attempts = 0;
            do {
                tooClose = false;
                x = p.random(radius + 100, p.width - radius - 100);
                y = p.random(radius + 100, p.height - radius - 100);
                
                // Vérifier qu'on ne se superpose pas avec les autres clusters (marge augmentée)
                for (let other of yearClusters) {
                    let d = p.dist(x, y, other.x, other.y);
                    if (d < radius + other.radius + 100) { // Marge de 100px entre clusters
                        tooClose = true;
                        break;
                    }
                }
                attempts++;
            } while (tooClose && attempts < 100);
            
            yearClusters.push({
                year: year,
                x: x,
                y: y,
                vx: p.random(-0.15, 0.15),
                vy: p.random(-0.15, 0.15),
                radius: radius,
                months: months,
                hasVege: yearsData[year].hasVegeWeek,
                // Création des assiettes qui voguent à l'intérieur
                plates: months.map((month, j) => {
                    let angle = (j / months.length) * p.TWO_PI;
                    return {
                        month: month,
                        offsetX: p.cos(angle) * (radius - 30),
                        offsetY: p.sin(angle) * (radius - 30),
                        vx: p.random(-0.3, 0.3),
                        vy: p.random(-0.3, 0.3),
                        maxDist: radius - 25
                    };
                })
            });
        });
    }
    
    function createMonthClusters() {
        monthClusters = [];
        let months = Object.keys(yearsData[selectedYear].months).sort((a, b) => a - b);
        
        months.forEach((month, i) => {
            let weeks = Object.keys(yearsData[selectedYear].months[month].weeks);
            let hasVegeWeek = yearsData[selectedYear].months[month].hasVegeWeek;
            let radius = 45 + weeks.length * 4;
            
            // Position aléatoire espacée
            let x, y, tooClose;
            let attempts = 0;
            do {
                tooClose = false;
                x = p.random(radius + 80, p.width - radius - 80);
                y = p.random(radius + 80, p.height - radius - 80);
                
                for (let other of monthClusters) {
                    let d = p.dist(x, y, other.x, other.y);
                    if (d < radius + other.radius + 80) {
                        tooClose = true;
                        break;
                    }
                }
                attempts++;
            } while (tooClose && attempts < 100);
            
            monthClusters.push({
                month: month,
                x: x,
                y: y,
                vx: p.random(-0.15, 0.15),
                vy: p.random(-0.15, 0.15),
                radius: radius,
                weeks: weeks,
                hasVege: hasVegeWeek,
                plates: weeks.map((week, j) => {
                    let angle = (j / weeks.length) * p.TWO_PI;
                    return {
                        week: week,
                        offsetX: p.cos(angle) * (radius - 25),
                        offsetY: p.sin(angle) * (radius - 25),
                        vx: p.random(-0.3, 0.3),
                        vy: p.random(-0.3, 0.3),
                        maxDist: radius - 20
                    };
                })
            });
        });

        console.log(monthClusters)
    }
    
    function createWeekClusters() {
        weekClusters = [];
        let weeks = Object.keys(yearsData[selectedYear].months[selectedMonth].weeks).sort((a, b) => a - b);
        
        weeks.forEach((week, i) => {
            let weekData = yearsData[selectedYear].months[selectedMonth].weeks[week];
            let radius = 40 + weekData.days.length * 5;
            
            let x, y, tooClose;
            let attempts = 0;
            do {
                tooClose = false;
                x = p.random(radius + 80, p.width - radius - 80);
                y = p.random(radius + 80, p.height - radius - 80);
                
                for (let other of weekClusters) {
                    let d = p.dist(x, y, other.x, other.y);
                    if (d < radius + other.radius + 80) {
                        tooClose = true;
                        break;
                    }
                }
                attempts++;
            } while (tooClose && attempts < 100);
            
            weekClusters.push({
                week: week,
                x: x,
                y: y,
                vx: p.random(-0.15, 0.15),
                vy: p.random(-0.15, 0.15),
                radius: radius,
                days: weekData.days,
                hasVege: weekData.hasVegeDay,
                cards: weekData.days.map((day, j) => {
                    let angle = (j / weekData.days.length) * p.TWO_PI;
                    return {
                        day: day,
                        offsetX: p.cos(angle) * (radius - 22),
                        offsetY: p.sin(angle) * (radius - 22),
                        vx: p.random(-0.3, 0.3),
                        vy: p.random(-0.3, 0.3),
                        maxDist: radius - 18
                    };
                })
            });
        });
    }
    
    function createDayCards() {
        dayCards = [];
        let weekData = yearsData[selectedYear].months[selectedMonth].weeks[selectedWeek];
        let days = weekData.days.sort((a, b) => a.date - b.date);
        
        let cardWidth = 200;
        let cardHeight = 280;
        let spacing = 20;
        let totalWidth = days.length * (cardWidth + spacing) - spacing;
        let startX = (p.width - totalWidth) / 2;
        let startY = (p.height - cardHeight) / 2;
        
        days.forEach((day, i) => {
            dayCards.push({
                day: day,
                x: startX + i * (cardWidth + spacing),
                y: startY,
                width: cardWidth,
                height: cardHeight,
                scale: 0
            });
        });
    }
    
    // ==================== AFFICHAGE DES VUES ====================
    
    function displayYearClusters() {
        // Gérer les collisions entre clusters
        handleClusterCollisions(yearClusters);
        
        yearClusters.forEach(cluster => {
            // Mouvement de bulle flottante
            updateClusterMovement(cluster);
            
            p.push();
            p.translate(cluster.x, cluster.y);
            
            // Dessin du contour organique
            drawOrganicCircle(0, 0, cluster.radius, colors.border);
            
            // Année au centre avec couleur selon validation
            p.fill(colors.text);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(32);
            p.textStyle(p.BOLD);
            
            // Assiettes des mois qui voguent librement
            cluster.plates.forEach(plate => {
                // Mouvement libre comme un bâton à la dérive
                plate.offsetX += plate.vx;
                plate.offsetY += plate.vy;
                
                // Ajouter variation aléatoire
                plate.vx += p.random(-0.05, 0.05);
                plate.vy += p.random(-0.05, 0.05);
                
                // Limiter vitesse
                plate.vx = p.constrain(plate.vx, -0.5, 0.5);
                plate.vy = p.constrain(plate.vy, -0.5, 0.5);
                
                // Garder dans les limites du cluster
                let dist = p.dist(0, 0, plate.offsetX, plate.offsetY);
                if (dist > plate.maxDist) {
                    let angle = p.atan2(plate.offsetY, plate.offsetX);
                    plate.offsetX = p.cos(angle) * plate.maxDist;
                    plate.offsetY = p.sin(angle) * plate.maxDist;
                    // Inverser direction
                    plate.vx *= -0.8;
                    plate.vy *= -0.8;
                }
                
                let hasVege = yearsData[cluster.year].months[plate.month].hasVegeWeek;
                drawPlate(plate.offsetX, plate.offsetY, 24, hasVege, monthNames[plate.month - 1].substring(0, 3));
            });

            p.text(cluster.year + (cluster.hasVege ? '✅' : '❌'), 0, 0);
            
            p.pop();
            
            // Détection du survol
            if (p.dist(p.mouseX, p.mouseY, cluster.x, cluster.y) < cluster.radius) {
                p.cursor(p.HAND);
            }
        });
    }
    
    function displayMonthClusters() {
        // Background avec l'année
        p.push();
        let bgColor = selectedYear && yearsData[selectedYear].hasVegeWeek ? 
               p.color(colors.vegGreen) : p.color(colors.nonVegRed);
        bgColor.setAlpha(30);
        p.fill(bgColor);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(180);
        p.textStyle(p.BOLD);
        p.text(selectedYear, p.width / 2, p.height / 2);
        p.pop();
        
        // Gérer les collisions entre clusters
        handleClusterCollisions(monthClusters);
        
        monthClusters.forEach(cluster => {
            updateClusterMovement(cluster);
            
            p.push();
            p.translate(cluster.x, cluster.y);
            
            drawOrganicCircle(0, 0, cluster.radius, colors.border);
            
            // Nom du mois au centre avec couleur selon validation
            p.fill(colors.text);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(20);
            p.textStyle(p.BOLD);
            
            // Assiettes des semaines qui voguent librement
            cluster.plates.forEach(plate => {
                plate.offsetX += plate.vx;
                plate.offsetY += plate.vy;
                
                plate.vx += p.random(-0.05, 0.05);
                plate.vy += p.random(-0.05, 0.05);
                
                plate.vx = p.constrain(plate.vx, -0.5, 0.5);
                plate.vy = p.constrain(plate.vy, -0.5, 0.5);
                
                let dist = p.dist(0, 0, plate.offsetX, plate.offsetY);
                if (dist > plate.maxDist) {
                    let angle = p.atan2(plate.offsetY, plate.offsetX);
                    plate.offsetX = p.cos(angle) * plate.maxDist;
                    plate.offsetY = p.sin(angle) * plate.maxDist;
                    plate.vx *= -0.8;
                    plate.vy *= -0.8;
                }
                
                let weekData = yearsData[selectedYear].months[cluster.month].weeks[plate.week];
                drawPlate(plate.offsetX, plate.offsetY, 22, weekData.hasVegeDay, `S${plate.week}`);
            });

            p.text(monthNames[cluster.month - 1]  + (cluster.hasVege ? '✅' : '❌'), 0, 0);
            
            p.pop();
            
            if (p.dist(p.mouseX, p.mouseY, cluster.x, cluster.y) < cluster.radius) {
                p.cursor(p.HAND);
            }
        });
    }
    
    function displayWeekClusters() {
        // Background avec le mois
        p.push();
        let bgColor = selectedMonth && yearsData[selectedYear].months[selectedMonth].hasVegeWeek ? 
               p.color(colors.vegGreen) : p.color(colors.nonVegRed);
        bgColor.setAlpha(30);
        p.fill(bgColor);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(150);
        p.textStyle(p.BOLD);
        p.text(monthNames[selectedMonth - 1] + " " + selectedYear, p.width / 2, p.height / 2);
        p.pop();
        
        // Gérer les collisions entre clusters
        handleClusterCollisions(weekClusters);
        
        weekClusters.forEach(cluster => {
            updateClusterMovement(cluster);
            
            p.push();
            p.translate(cluster.x, cluster.y);
            
            drawOrganicCircle(0, 0, cluster.radius, colors.border);
            
            // Numéro de semaine au centre avec couleur selon validation
            p.fill(colors.text);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(18);
            p.textStyle(p.BOLD);
            
            // Cartes menu des jours qui voguent librement
            cluster.cards.forEach(card => {
                card.offsetX += card.vx;
                card.offsetY += card.vy;
                
                card.vx += p.random(-0.05, 0.05);
                card.vy += p.random(-0.05, 0.05);
                
                card.vx = p.constrain(card.vx, -0.5, 0.5);
                card.vy = p.constrain(card.vy, -0.5, 0.5);
                
                let dist = p.dist(0, 0, card.offsetX, card.offsetY);
                if (dist > card.maxDist) {
                    let angle = p.atan2(card.offsetY, card.offsetX);
                    card.offsetX = p.cos(angle) * card.maxDist;
                    card.offsetY = p.sin(angle) * card.maxDist;
                    card.vx *= -0.8;
                    card.vy *= -0.8;
                }
                
                drawMiniMenuCard(card.offsetX, card.offsetY, 20, card.day.isVege, card.day.date.getDate());
            });

            p.text(`Semaine ${cluster.week}` + (cluster.hasVege ? '✅' : '❌'), 0, 0);
            
            p.pop();
            
            if (p.dist(p.mouseX, p.mouseY, cluster.x, cluster.y) < cluster.radius) {
                p.cursor(p.HAND);
            }
        });
    }
    
    function displayDayCards() {
        dayCards.forEach(card => {
            // Animation d'apparition
            card.scale = p.lerp(card.scale, 1, 0.1);
            
            p.push();
            p.translate(card.x + card.width / 2, card.y + card.height / 2);
            p.scale(card.scale);
            
            drawFullMenuCard(0, 0, card.width, card.height, card.day);
            
            p.pop();
        });
    }
    
    function displayTransition() {
        // Effet de zoom progressif depuis le cluster cliqué
        // Inspiré du code de référence avec lerp pour smooth transition
        let ease = easeInOutCubic(transitionProgress);
        
        // Fond qui s'éclaircit progressivement
        let bgColor = p.color(colors.bg);
        let whiteColor = p.color(255, 255, 255, 200);
        p.background(p.lerpColor(bgColor, whiteColor, ease * 0.3));
        
        // Ne dessiner QUE le cluster cliqué qui grandit
        p.push();
        
        // Calculer la position et taille cibles (centre de l'écran, grande taille)
        let targetX = p.width / 2;
        let targetY = p.height / 2;
        let targetRadius = p.max(p.width, p.height) * 0.6;
        
        // Interpoler position et taille
        let currentX = p.lerp(zoomOrigin.x, targetX, ease);
        let currentY = p.lerp(zoomOrigin.y, targetY, ease);
        let currentRadius = p.lerp(80, targetRadius, ease);
        
        p.translate(currentX, currentY);
        
        // Dessiner le contour organique qui grandit
        p.push();
        let fillColor = p.color(colors.bg);
        fillColor.setAlpha(255 * (1 - ease * 0.5));
        p.fill(fillColor);
        drawOrganicCircle(0, 0, currentRadius, colors.border);
        p.pop();
        
        // Afficher la nouvelle vue en avance (à partir de 60% de la transition)
        if (ease > 0.6) {
            let fadeIn = (ease - 0.6) * 2.5; // Fade in progressif
            
            p.push();
            // Remettre à l'échelle normale pour afficher les nouveaux clusters
            p.translate(-currentX, -currentY);
            
            switch(currentView) {
                case 'months':
                    // Afficher l'année en background
                    let yearBgColor = selectedYear && yearsData[selectedYear].hasVegeWeek ? 
                           p.color(colors.vegGreen) : p.color(colors.nonVegRed);
                    yearBgColor.setAlpha(30 * fadeIn);
                    p.fill(yearBgColor);
                    p.noStroke();
                    p.textAlign(p.CENTER, p.CENTER);
                    p.textSize(180);
                    p.textStyle(p.BOLD);
                    p.text(selectedYear, p.width / 2, p.height / 2);
                    
                    monthClusters.forEach(cluster => {
                        p.push();
                        p.translate(cluster.x, cluster.y);
                        let clusterFillColor = p.color(colors.bg);
                        clusterFillColor.setAlpha(255 * fadeIn);
                        p.fill(clusterFillColor);
                        drawOrganicCircle(0, 0, cluster.radius, colors.border);
                        
                        // Afficher le contenu
                        let textColor = cluster.hasVege ? p.color(colors.vegGreen) : p.color(colors.nonVegRed);
                        textColor.setAlpha(255 * fadeIn);
                        p.fill(textColor);
                        p.noStroke();
                        p.textAlign(p.CENTER, p.CENTER);
                        p.textSize(20);
                        p.textStyle(p.BOLD);
                        p.text(monthNames[cluster.month - 1], 0, 0);
                        p.pop();
                    });
                    break;
                    
                case 'weeks':
                    // Afficher le mois en background
                    let monthBgColor = selectedMonth && yearsData[selectedYear].months[selectedMonth].hasVegeWeek ? 
                           p.color(colors.vegGreen) : p.color(colors.nonVegRed);
                    monthBgColor.setAlpha(30 * fadeIn);
                    p.fill(monthBgColor);
                    p.noStroke();
                    p.textAlign(p.CENTER, p.CENTER);
                    p.textSize(150);
                    p.textStyle(p.BOLD);
                    p.text(monthNames[selectedMonth - 1], p.width / 2, p.height / 2);
                    
                    weekClusters.forEach(cluster => {
                        p.push();
                        p.translate(cluster.x, cluster.y);
                        let clusterFillColor = p.color(colors.bg);
                        clusterFillColor.setAlpha(255 * fadeIn);
                        p.fill(clusterFillColor);
                        drawOrganicCircle(0, 0, cluster.radius, colors.border);
                        
                        let textColor = cluster.hasVege ? p.color(colors.vegGreen) : p.color(colors.nonVegRed);
                        textColor.setAlpha(255 * fadeIn);
                        p.fill(textColor);
                        p.noStroke();
                        p.textAlign(p.CENTER, p.CENTER);
                        p.textSize(18);
                        p.textStyle(p.BOLD);
                        p.text(`Semaine ${cluster.week}`, 0, 0);
                        p.pop();
                    });
                    break;
                    
                case 'days':
                    // Pour la transition vers les jours, afficher les cartes qui apparaissent
                    dayCards.forEach(card => {
                        card.scale = fadeIn;
                        p.push();
                        p.translate(card.x + card.width / 2, card.y + card.height / 2);
                        p.scale(card.scale);
                        
                        let cardColor = card.day.isVege ? p.color(colors.vegGreen) : p.color(colors.nonVegRed);
                        cardColor.setAlpha(255 * fadeIn);
                        p.fill(cardColor);
                        p.stroke(colors.text);
                        p.strokeWeight(3);
                        p.rect(-card.width/2, -card.height/2, card.width, card.height, 10);
                        
                        p.pop();
                    });
                    break;
            }
            p.pop();
        }
        
        p.pop();
    }
    
    // ==================== UTILITAIRES MOUVEMENT ====================
    
    function handleClusterCollisions(clusters) {
        // Détecter et résoudre les collisions entre clusters
        // Inspiré de la méthode collide() du code de référence
        for (let i = 0; i < clusters.length; i++) {
            let c1 = clusters[i];
            for (let j = i + 1; j < clusters.length; j++) {
                let c2 = clusters[j];
                
                let d = p.dist(c1.x, c1.y, c2.x, c2.y);
                let minDist = c1.radius + c2.radius + 25; // Marge de sécurité
                
                // S'ils se touchent, les repousser progressivement
                if (d < minDist && d > 0) {
                    // Calculer l'angle entre les deux clusters
                    let angle = p.atan2(c1.y - c2.y, c1.x - c2.x);
                    
                    // Force de répulsion proportionnelle au chevauchement
                    let force = (minDist - d) * 0.02;
                    
                    // Appliquer la force aux deux clusters
                    c1.x += p.cos(angle) * force;
                    c1.y += p.sin(angle) * force;
                    c2.x -= p.cos(angle) * force;
                    c2.y -= p.sin(angle) * force;
                    
                    // Ajuster légèrement les vitesses pour éviter qu'ils restent collés
                    c1.vx += p.cos(angle) * 0.05;
                    c1.vy += p.sin(angle) * 0.05;
                    c2.vx -= p.cos(angle) * 0.05;
                    c2.vy -= p.sin(angle) * 0.05;
                }
            }
        }
    }
    
    function updateClusterMovement(cluster) {
        // Mouvement de bulle flottante avec rebond sur les bords
        cluster.x += cluster.vx;
        cluster.y += cluster.vy;
        
        // Rebond sur les bords avec inversion de vitesse
        let margin = cluster.radius + 20;
        if (cluster.x < margin || cluster.x > p.width - margin) {
            cluster.vx *= -1;
            cluster.x = p.constrain(cluster.x, margin, p.width - margin);
        }
        if (cluster.y < margin || cluster.y > p.height - margin) {
            cluster.vy *= -1;
            cluster.y = p.constrain(cluster.y, margin, p.height - margin);
        }
        
        // Légère variation aléatoire pour mouvement organique (effet vent/courant)
        cluster.vx += p.random(-0.02, 0.02);
        cluster.vy += p.random(-0.02, 0.02);
        
        // Limiter la vitesse max
        let maxSpeed = 0.4;
        cluster.vx = p.constrain(cluster.vx, -maxSpeed, maxSpeed);
        cluster.vy = p.constrain(cluster.vy, -maxSpeed, maxSpeed);
    }
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // ==================== FONCTIONS DE DESSIN ====================
    
    function drawOrganicCircle(x, y, radius, col) {
        p.push();
        p.translate(x, y);
        p.stroke(col);
        p.strokeWeight(3);
        p.noFill();
        
        // Cercle organique avec variations
        p.beginShape();
        let points = 20;
        for (let i = 0; i <= points; i++) {
            let angle = (i / points) * p.TWO_PI;
            let variation = p.noise(i * 0.5, p.frameCount * 0.01) * 15;
            let r = radius + variation;
            let px = p.cos(angle) * r;
            let py = p.sin(angle) * r;
            p.curveVertex(px, py);
        }
        p.endShape(p.CLOSE);
        
        p.pop();
    }
    
    function drawPlate(x, y, size, isVege, label) {
        const baseHex = isVege ? colors.vegGreen : colors.nonVegRed;
        const baseColor = p.color(baseHex);

        p.push();
        p.translate(x, y);

        // // --- Dégradé radial léger ---
        // for (let r = size * 1.6; r > 0; r -= 2) {
        //     let t = p.map(r, 0, size * 1.6, 1, 0);
        //     let c = p.lerpColor(
        //         p.color(p.red(baseColor) * 0.4, p.green(baseColor) * 0.6, p.blue(baseColor) * 0.6),
        //         baseColor,
        //         t
        //     );
        //     p.noStroke();
        //     p.fill(c);
        //     p.circle(0, 0, r * 2);
        // }

        // --- Bord ondulé ---
        p.fill(baseColor);
        p.stroke(255);
        p.strokeWeight(2);

        p.beginShape();
        let waves = 60;
        let amp = size * 0.06;
        for (let i = 0; i <= waves; i++) {
            let angle = (i / waves) * p.TWO_PI;
            let wave = p.sin(angle * 6) * amp;
            let r = size * 1.2 + wave;
            p.vertex(p.cos(angle) * r, p.sin(angle) * r);
        }
        p.endShape(p.CLOSE);

        // --- Centre éclairci ---
        let centerColor = lightenColor(p, baseHex, 40);
        p.noStroke();
        p.fill(centerColor);
        p.circle(0, 0, size);

        // --- Texte ---
        p.fill(colors.text);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(size * 0.35);
        p.textStyle(p.BOLD);
        p.text(label, 0, 0);

        p.pop();
    }
        
    function drawMiniMenuCard(x, y, size, isVege, dayNumber) {
        p.push();
        p.translate(x, y);
        
        // Carte rectangulaire mini
        p.fill(isVege ? colors.vegGreen : colors.nonVegRed);
        p.stroke(255);
        p.strokeWeight(2);
        p.rect(-size, -size, size * 2, size * 2, 5);
        
        // Numéro du jour
        p.fill(255);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(size * 0.8);
        p.textStyle(p.BOLD);
        p.text(dayNumber, 0, 0);
        
        p.pop();
    }
    
    function drawFullMenuCard(x, y, w, h, dayData) {
        p.push();
        p.translate(x, y);
        
        // Fond de la carte
        p.fill(dayData.isVege ? colors.vegGreen : colors.nonVegRed);
        p.stroke(colors.text);
        p.strokeWeight(3);
        p.rect(-w/2, -h/2, w, h, 10);
        
        // Titre "MENU"
        p.fill(255);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.textStyle(p.BOLD);
        p.text("MENU", 0, -h/2 + 30);
        
        // Date avec année
        let dateStr = dayData.date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        });
        p.textSize(11);
        p.textStyle(p.NORMAL);
        p.text(dateStr, 0, -h/2 + 55);
        
        // Ligne de séparation
        p.stroke(255);
        p.strokeWeight(2);
        p.line(-w/2 + 20, -h/2 + 70, w/2 - 20, -h/2 + 70);
        
        // Contenu du menu
        let yPos = -h/2 + 90;
        let lineHeight = 30;
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(11);
        p.noStroke();
        
        let menuItems = [
            { label: 'Entrée', value: dayData.data.Entrée },
            { label: 'Plat', value: dayData.data.Plat },
            { label: 'Légumes', value: dayData.data.Légumes },
            { label: 'Laitage', value: dayData.data.Laitage },
            { label: 'Dessert', value: dayData.data.Dessert }
        ];
        
        menuItems.forEach(item => {
            if (item.value && item.value.trim() !== '') {
                p.textStyle(p.BOLD);
                p.text(item.label + ' :', -w/2 + 15, yPos);
                p.textStyle(p.NORMAL);
                
                // Gérer le texte long
                let maxWidth = w - 30;
                let words = item.value.split(' ');
                let line = '';
                let lines = [];
                
                words.forEach(word => {
                    let testLine = line + word + ' ';
                    if (p.textWidth(testLine) > maxWidth - 60) {
                        lines.push(line);
                        line = word + ' ';
                    } else {
                        line = testLine;
                    }
                });
                lines.push(line);
                
                lines.forEach((l, i) => {
                    p.text(l, -w/2 + 75, yPos + i * 15);
                });
                
                yPos += lineHeight + (lines.length - 1) * 15;
            }
        });
        
        // Badge végétarien
        if (dayData.isVege) {
            p.fill(255);
            p.stroke(255);
            p.strokeWeight(2);
            p.rect(-w/2 + 10, h/2 - 35, 80, 25, 5);
            p.fill(colors.vegGreen);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(12);
            p.textStyle(p.BOLD);
            p.text("🌱 VÉGÉ", -w/2 + 50, h/2 - 22);
        }
        
        p.pop();
    }
    
    function drawBackButton() {
        let buttonX = 30;
        let buttonY = 30;
        let buttonSize = 40;
        
        // Détection survol
        let isHover = p.dist(p.mouseX, p.mouseY, buttonX, buttonY) < buttonSize / 2;
        
        p.push();
        p.fill(isHover ? colors.accent : colors.text);
        p.noStroke();
        p.circle(buttonX, buttonY, buttonSize);
        
        // Flèche retour
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.text('←', buttonX, buttonY);
        p.pop();
        
        if (isHover) {
            p.cursor(p.HAND);
        }
    }
    
    // ==================== INTERACTIONS ====================
    
    p.mousePressed = function() {
        // Bouton retour
        if (currentView !== 'years' && p.dist(p.mouseX, p.mouseY, 30, 30) < 20) {
            goBack();
            return;
        }
        
        // Navigation selon la vue
        switch(currentView) {
            case 'years':
                yearClusters.forEach(cluster => {
                    if (p.dist(p.mouseX, p.mouseY, cluster.x, cluster.y) < cluster.radius) {
                        selectedYear = cluster.year;
                        zoomOrigin = { x: cluster.x, y: cluster.y };
                        isTransitioning = true;
                        createMonthClusters();
                        setTimeout(() => {
                            currentView = 'months';
                        }, 300);
                    }
                });
                break;
                
            case 'months':
                monthClusters.forEach(cluster => {
                    if (p.dist(p.mouseX, p.mouseY, cluster.x, cluster.y) < cluster.radius) {
                        selectedMonth = cluster.month;
                        zoomOrigin = { x: cluster.x, y: cluster.y };
                        isTransitioning = true;
                        createWeekClusters();
                        setTimeout(() => {
                            currentView = 'weeks';
                        }, 300);
                    }
                });
                break;
                
            case 'weeks':
                weekClusters.forEach(cluster => {
                    if (p.dist(p.mouseX, p.mouseY, cluster.x, cluster.y) < cluster.radius) {
                        selectedWeek = cluster.week;
                        zoomOrigin = { x: cluster.x, y: cluster.y };
                        previousView = 'weeks';
                        previousClusters = [...weekClusters];
                        isTransitioning = true;
                        createDayCards();
                        setTimeout(() => {
                            currentView = 'days';
                        }, 300);
                    }
                });
                break;
        }
        
        p.cursor(p.ARROW);
    };
    
    function goBack() {
        switch(currentView) {
            case 'months':
                selectedYear = null;
                currentView = 'years';
                break;
            case 'weeks':
                selectedMonth = null;
                currentView = 'months';
                break;
            case 'days':
                selectedWeek = null;
                currentView = 'weeks';
                break;
        }
    }
  
  
    // p.windowResized = function() {
    //     p.resizeCanvas(p.windowWidth, p.windowHeight);
        
    //     // Recréer les clusters avec les nouvelles dimensions
    //     if (currentView === 'years') {
    //         createYearClusters();
    //     } else if (currentView === 'months') {
    //         createMonthClusters();
    //     } else if (currentView === 'weeks') {
    //         createWeekClusters();
    //     } else if (currentView === 'days') {
    //         createDayCards();
    //     }
    // };

}


// Fonction pour éclaircir une couleur (utilise pour drawPlat() par exemple)
function lightenColor(p, hexColor, amount) {
    let c = p.color(hexColor);
    let r = p.red(c) + amount;
    let g = p.green(c) + amount;
    let b = p.blue(c) + amount;
    return p.color(
        p.constrain(r, 0, 255),
        p.constrain(g, 0, 255),
        p.constrain(b, 0, 255)
    );
}

function getDateOfISOWeek(isoYear, isoWeek, isoWeekday) {
    // isoWeekday : 1=lundi → 7=dimanche
    let simple = new Date(isoYear, 0, 1 + (isoWeek - 1) * 7);
    let dow = simple.getDay();
    if (dow === 0) dow = 7;                         // dimanche → 7
    let diff = isoWeekday - dow;
    return new Date(simple.getFullYear(), simple.getMonth(), simple.getDate() + diff);
}