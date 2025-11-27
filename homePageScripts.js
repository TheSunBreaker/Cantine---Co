// Scripts pour les animations entraînantes et ludiques de la page d'acceuille.


const words = [
    'MIAAAM', 'CCRUUNNCH', 'GRUNCHH', 'MMMM', 
    'GLOUGLOUGLOU', 'SLURP', 'YUM', 'NOMNOMNOM',
    'CRUNCH', 'MIAM', 'YUUMMYY', 'GNUMGNUM', 'CRUNCHCRUNCH'
];

// '<img src="carotte.png" style="width: 80px">',
// '<img src="tomate.png" style="width: 80px">', etc.
// const veggies = [
//     '🥕', '🥦', '🌽', '🍅', '🥬', 
//     '🫑', '🥒', '🍆', '🥔', '🧅',
//     '🥗', '🌶️', '🥑', '🍇', '🍓'
// ]; // Emojis pour du test

const veggies = [
    
    '<img src="Assets/Carotte.png" alt="carotte" width ="80px">',
    '<img src="Assets/Radis.png" alt="radis" width ="80px">',
    '<img src="Assets/Poireau.png" alt="poireau" width ="80px">',
    '<img src="Assets/Champignon.png" alt="chapignon" width ="80px">',
    '<img src="Assets/Orange.png" alt="orange" width ="80px">'

]

const animations = [
    'slideRight', 'slideLeft', 'slideDown', 'slideUp',
    'bounce', 'zoomIn'
];

const container = document.getElementById('overlay');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function createWord() {
    const word = getRandomItem(words);
    const animation = getRandomItem(animations);
    const duration = getRandomInt(2, 5);
    const size = getRandomInt(3, 6);
    
    const element = document.createElement('div');
    element.className = 'word';
    element.style.fontSize = `${size}rem`;
    element.style.animation = `${animation} ${duration}s ease-in-out`;
    
    // Position de départ selon l'animation
    if (animation.includes('Right')) {
        element.style.top = `${getRandomInt(10, 80)}%`;
        element.style.left = '0';
    } else if (animation.includes('Left')) {
        element.style.top = `${getRandomInt(10, 80)}%`;
        element.style.right = '0';
    } else if (animation.includes('Down')) {
        element.style.left = `${getRandomInt(10, 80)}%`;
        element.style.top = '0';
    } else if (animation.includes('Up')) {
        element.style.left = `${getRandomInt(10, 80)}%`;
        element.style.bottom = '0';
    } else {
        element.style.left = `${getRandomInt(10, 80)}%`;
        element.style.top = `${getRandomInt(10, 80)}%`;
    }

    // Couleurs variées
    // const colors = ['#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#3498db', '#1abc9c'];
    // const colors = ['#000'];
    // const colors = ['#1a1a1a', '#2d2d2d', '#404040', '#525252', '#666666'];
    // const colors = ['#2c2c2c', '#3a3a3a', '#4a4a3a', '#5a5a4a', '#6a6a5a'];
    // const colors = ['#1c1c1c', '#2a2f2a', '#333833', '#3d4a3d', '#4a5a4a'];
    // const colors = ['#212121', '#2f2f2f', '#3c3c3c', '#4f4f4f', '#636363'];
    // const colors = ['#1e1e1e', '#2e2b26', '#3d3730', '#4d443a', '#5d5244'];
    const colors = ['#0C5C03', '#BA0085'];

    element.style.color = getRandomItem(colors);

    // Décider si on écrit lettre par lettre (20% de chance)
    if (Math.random() < 0.2) {
        element.style.animation = 'none';
        writeLetterByLetter(element, word, duration);
    } else {
        element.textContent = word;
    }

    container.appendChild(element);

    // Supprimer l'élément après l'animation
    setTimeout(() => {
        element.remove();
    }, duration * 1000);
}

function writeLetterByLetter(element, word, duration) {
    const letters = word.split('');
    element.innerHTML = '';
    
    letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = letter;
        span.style.animationDelay = `${index * 0.1}s`;
        element.appendChild(span);
    });

    // Faire disparaître après affichage complet
    setTimeout(() => {
        element.style.transition = 'opacity 0.5s';
        element.style.opacity = '0';
    }, (duration - 0.5) * 1000);
}

function createVeggie() {
    // const veggie = getRandomItem(veggies);
    // const animation = getRandomItem(animations);
    // const duration = getRandomInt(2, 5);
    // const size = getRandomInt(3, 7);
    
    // const element = document.createElement('div');
    // element.className = 'veggie';
    // element.innerHTML = veggie; // Utiliser innerHTML pour supporter les balises <img>
    // element.style.fontSize = `${size}rem`;


    const veggie = getRandomItem(veggies);
    const animation = getRandomItem(animations);
    const duration = getRandomInt(2, 5);
    const size = getRandomInt(40, 300); // Taille en pixels maintenant (au lieu de rem)
    
    const element = document.createElement('div');
    element.className = 'veggie';
    element.innerHTML = veggie;
    
    // Modifier la taille de l'image
    const img = element.querySelector('img');
    if (img) {
        img.style.width = `${size}px`;
    }

    element.style.animation = `${animation} ${duration}s ease-in-out`;

    
    // Position de départ selon l'animation
    if (animation.includes('Right')) {
        element.style.top = `${getRandomInt(10, 80)}%`;
        element.style.left = '0';
    } else if (animation.includes('Left')) {
        element.style.top = `${getRandomInt(10, 80)}%`;
        element.style.right = '0';
    } else if (animation.includes('Down')) {
        element.style.left = `${getRandomInt(10, 80)}%`;
        element.style.top = '0';
    } else if (animation.includes('Up')) {
        element.style.left = `${getRandomInt(10, 80)}%`;
        element.style.bottom = '0';
    } else {
        element.style.left = `${getRandomInt(10, 80)}%`;
        element.style.top = `${getRandomInt(10, 80)}%`;
    }

    container.appendChild(element);

    // Supprimer l'élément après l'animation
    setTimeout(() => {
        element.remove();
    }, duration * 1000);
}

// Générer des mots et légumes aléatoirement
function startAnimation() {
    // Créer des éléments à intervalles variables
    setInterval(() => {
        if (Math.random() < 0.4) {
            createWord();
        }
    }, 900);

    setInterval(() => {
        if (Math.random() < 0.4) {
            createVeggie();
        }
    }, 1100);
}

// Démarrer l'animation
startAnimation();
