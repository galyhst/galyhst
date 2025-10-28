// --- Pengaturan Game ---
const GAME_LEVELS = [
    { name: "Level 1: Tata Surya", size: 12, rows: 3, cols: 4, pairs: 6 }, // 4x3
    { name: "Level 2: Galaksi Bima Sakti", size: 16, rows: 4, cols: 4, pairs: 8 }  // 4x4
    // Tambahkan level lain di sini
];

// Ikon Luar Angkasa (dari Font Awesome)
const SPACE_ICONS = [
    'fa-rocket',
    'fa-user-astronaut',
    'fa-meteor',
    'fa-globe-americas',
    'fa-satellite',
    'fa-star',
    'fa-moon',
    'fa-sun',
    'fa-space-shuttle',
    'fa-shuttle-space'
];

// --- Variabel State Game ---
let currentLevelIndex = 0;
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let lockBoard = false; // Mencegah klik saat jeda

// --- Elemen DOM ---
const gameBoard = document.getElementById('game-board');
const currentLevelSpan = document.getElementById('current-level');
const movesCountSpan = document.getElementById('moves-count');
const modal = document.getElementById('modal-game-over');
const modalMessage = document.getElementById('modal-message');
const modalNextBtn = document.getElementById('modal-next-btn');

// --- Fungsi Utama ---

/**
 * Mengacak array (Algoritma Fisher-Yates Shuffle).
 * @param {Array} array
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Mempersiapkan kartu untuk level saat ini.
 * @returns {Array} Array ikon yang sudah diacak (berpasangan).
 */
function createCardDeck() {
    const level = GAME_LEVELS[currentLevelIndex];
    const iconSet = SPACE_ICONS.slice(0, level.pairs); // Ambil ikon yang dibutuhkan
    const deck = [...iconSet, ...iconSet]; // Duplikasi untuk membuat pasangan
    shuffleArray(deck);
    return deck;
}

/**
 * Merender papan permainan di DOM.
 */
function renderBoard() {
    const deck = createCardDeck();
    const level = GAME_LEVELS[currentLevelIndex];

    gameBoard.innerHTML = ''; // Bersihkan papan
    gameBoard.className = ''; // Bersihkan kelas grid
    gameBoard.classList.add(`grid-${level.cols}x${level.rows}`); // Terapkan kelas grid yang sesuai

    deck.forEach((iconClass, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.icon = iconClass;
        cardElement.dataset.index = index;
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front"><i class="fas ${iconClass}"></i></div>
                <div class="card-back"><i class="fas fa-question"></i></div>
            </div>
        `;
        cardElement.addEventListener('click', () => handleCardClick(cardElement));
        gameBoard.appendChild(cardElement);
    });

    cards = document.querySelectorAll('.card');
}

/**
 * Menangani logika klik kartu.
 * @param {HTMLElement} clickedCard
 */
function handleCardClick(clickedCard) {
    // Abaikan jika papan terkunci, kartu sudah dicocokkan, atau kartu sudah terbuka
    if (lockBoard || clickedCard.classList.contains('matched') || clickedCard.classList.contains('flipped')) {
        return;
    }

    clickedCard.classList.add('flipped');
    flippedCards.push(clickedCard);

    // Jika sudah ada 2 kartu terbuka
    if (flippedCards.length === 2) {
        moves++;
        movesCountSpan.textContent = moves;
        lockBoard = true; // Kunci papan saat membandingkan
        checkForMatch();
    }
}

/**
 * Memeriksa apakah dua kartu yang terbuka cocok.
 */
function checkForMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.icon === card2.dataset.icon;

    if (isMatch) {
        disableCards(card1, card2);
    } else {
        unflipCards(card1, card2);
    }
}

/**
 * Menandai kartu sebagai cocok dan menghapus event listener.
 * @param {HTMLElement} card1
 * @param {HTMLElement} card2
 */
function disableCards(card1, card2) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    
    // Hapus event listener (walaupun tidak mutlak diperlukan karena ada cek 'matched' di handleCardClick)
    card1.removeEventListener('click', handleCardClick);
    card2.removeEventListener('click', handleCardClick);

    matchedPairs++;
    resetTurn();
    checkWinCondition();
}

/**
 * Membalik kembali kartu yang tidak cocok setelah jeda.
 * @param {HTMLElement} card1
 * @param {HTMLElement} card2
 */
function unflipCards(card1, card2) {
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        resetTurn();
    }, 1000); // Jeda 1 detik agar pemain bisa melihat
}

/**
 * Mereset status giliran.
 */
function resetTurn() {
    flippedCards = [];
    lockBoard = false;
}

/**
 * Memeriksa apakah semua pasangan telah ditemukan (Kondisi Menang).
 */
function checkWinCondition() {
    const level = GAME_LEVELS[currentLevelIndex];
    if (matchedPairs === level.pairs) {
        showWinModal();
    }
}

/**
 * Menampilkan modal kemenangan.
 */
function showWinModal() {
    modal.style.display = 'block';
    
    if (currentLevelIndex < GAME_LEVELS.length - 1) {
        modalMessage.textContent = `Hebat! Anda menyelesaikan ${GAME_LEVELS[currentLevelIndex].name} dalam ${moves} percobaan. Siap untuk level berikutnya?`;
        modalNextBtn.style.display = 'block';
        modalNextBtn.textContent = `Lanjut ke ${GAME_LEVELS[currentLevelIndex + 1].name}`;
    } else {
        modalMessage.textContent = `Luar Biasa! Anda menyelesaikan SEMUA level Memoriku Antariksa dalam total ${moves} percobaan!`;
        modalNextBtn.style.display = 'none'; // Sembunyikan tombol jika ini level terakhir
    }
}

/**
 * Memulai level berikutnya.
 */
function goToNextLevel() {
    modal.style.display = 'none';

    if (currentLevelIndex < GAME_LEVELS.length - 1) {
        currentLevelIndex++;
        initGame();
    } else {
        // Jika sudah level terakhir, bisa direset ke level 1 atau ditutup
        console.log("Game Selesai!");
        // initGame(); // Opsi: Reset ke Level 1
    }
}

/**
 * Inisialisasi atau Reset Game
 */
function initGame() {
    const level = GAME_LEVELS[currentLevelIndex];
    
    // Reset variabel
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    lockBoard = false;
    
    // Update tampilan
    currentLevelSpan.textContent = currentLevelIndex + 1;
    movesCountSpan.textContent = moves;
    
    renderBoard();
}

// --- Event Listener ---
modalNextBtn.addEventListener('click', goToNextLevel);

// --- Mulai Game ---
initGame();