// DOM Elements
const gameButtons = document.getElementById('game-buttons');
const gameSelection = document.getElementById('game-selection');
const bracketView = document.getElementById('bracket-view');
const gameTitle = document.getElementById('game-title');
const bracketContainer = document.getElementById('bracket-container');
const backToGames = document.getElementById('back-to-games');

// Sample games data (will be loaded from Firebase)
const defaultGames = [
    { id: 'mario-kart', name: 'Mario Kart', status: 'In Progress' },
    { id: 'smash-bros', name: 'Super Smash Bros', status: 'Not Started' },
    { id: 'mario-party', name: 'Mario Party', status: 'Not Started' },
    { id: 'splatoon', name: 'Splatoon', status: 'Not Started' },
    { id: 'pokemon', name: 'Pokemon Battle', status: 'Not Started' },
    { id: 'trivia', name: 'Science Trivia', status: 'Not Started' }
];

// State
let currentGames = defaultGames;
let currentBrackets = {};
let selectedGame = null;

// Check if Firebase is configured
function isFirebaseConfigured() {
    try {
        return typeof firebaseConfig !== 'undefined' &&
               firebaseConfig.apiKey &&
               !firebaseConfig.apiKey.includes('YOUR_');
    } catch (e) {
        return false;
    }
}

// Load games from Firebase
async function loadGames() {
    if (isFirebaseConfigured()) {
        try {
            const snapshot = await db.collection('games').get();
            if (!snapshot.empty) {
                currentGames = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        } catch (e) {
            console.log('Using default games:', e);
        }
    }
    renderGameButtons();
}

// Render game selection buttons
function renderGameButtons() {
    gameButtons.innerHTML = currentGames.map(game => `
        <button class="game-btn" data-game-id="${game.id}">
            ${game.name}
            <span class="game-status">${game.status || 'Not Started'}</span>
        </button>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.game-btn').forEach(btn => {
        btn.addEventListener('click', () => selectGame(btn.dataset.gameId));
    });
}

// Select a game and show bracket
async function selectGame(gameId) {
    selectedGame = currentGames.find(g => g.id === gameId);
    if (!selectedGame) return;

    gameTitle.textContent = selectedGame.name;
    gameSelection.classList.add('hidden');
    bracketView.classList.remove('hidden');

    await loadBracket(gameId);
}

// Load bracket data from Firebase
async function loadBracket(gameId) {
    let bracketData = null;

    if (isFirebaseConfigured()) {
        try {
            const doc = await db.collection('brackets').doc(gameId).get();
            if (doc.exists) {
                bracketData = doc.data();
            }

            // Set up real-time listener
            db.collection('brackets').doc(gameId).onSnapshot((doc) => {
                if (doc.exists) {
                    renderBracket(doc.data());
                }
            });
        } catch (e) {
            console.log('Error loading bracket:', e);
        }
    }

    if (bracketData) {
        renderBracket(bracketData);
    } else {
        renderEmptyBracket();
    }
}

// Render empty bracket state
function renderEmptyBracket() {
    bracketContainer.innerHTML = `
        <div class="bracket-empty">
            <h3>Bracket Not Set Up Yet</h3>
            <p>The bracket for this game hasn't been created.</p>
            <p>Admins can set it up in the admin dashboard.</p>
        </div>
    `;
}

// Render bracket
function renderBracket(data) {
    const rounds = data.rounds || [];

    if (rounds.length === 0) {
        renderEmptyBracket();
        return;
    }

    const roundNames = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Finals', 'Champion'];

    let html = '';

    rounds.forEach((round, roundIndex) => {
        const isLastRound = roundIndex === rounds.length - 1;
        const isSemifinals = roundIndex === rounds.length - 2;

        if (isLastRound) {
            // Finals column - Finals and 3rd Place close together in center
            html += `
                <div class="round finals-round">
                    <div class="finals-game-block">
                        <div class="game-label">Finals</div>
                        ${renderFinalMatch(round.matches[0])}
                    </div>
                    ${data.thirdPlace ? `
                    <div class="finals-game-block third-place-block">
                        <div class="game-label">3rd Place</div>
                        ${renderFinalMatch(data.thirdPlace)}
                    </div>
                    ` : ''}
                </div>
            `;
        } else {
            // For semifinals, don't use regular connector classes
            const skipConnectors = isSemifinals;
            html += `
                <div class="round ${isSemifinals ? 'semifinals-round' : ''}">
                    <div class="round-title">${roundNames[roundIndex] || `Round ${roundIndex + 1}`}</div>
                    ${round.matches.map((match, matchIndex) => renderMatch(match, roundIndex, matchIndex, skipConnectors)).join('')}
                </div>
            `;
        }
    });

    bracketContainer.innerHTML = html;
}

// Render a single match with wrapper for connectors
function renderMatch(match, roundIndex, matchIndex, isLastRound = false) {
    const team1 = match.team1 ? (getTeamById(match.team1) || { name: 'TBD', color: '#999' }) : { name: 'TBD', color: '#999' };
    const team2 = match.team2 ? (getTeamById(match.team2) || { name: 'TBD', color: '#999' }) : { name: 'TBD', color: '#999' };

    const team1Class = match.winner === match.team1 ? 'winner' : (match.winner === match.team2 ? 'loser' : '');
    const team2Class = match.winner === match.team2 ? 'winner' : (match.winner === match.team1 ? 'loser' : '');

    // Determine connector class based on match position (odd matches connect down, even connect up)
    const connectorClass = !isLastRound ? (matchIndex % 2 === 0 ? 'connector-down' : 'connector-up') : '';

    return `
        <div class="match-wrapper ${connectorClass}">
            <div class="match" data-round="${roundIndex}" data-match="${matchIndex}">
                ${match.time ? `<div class="match-time">${match.time}</div>` : ''}
                <div class="match-teams">
                    <div class="match-team ${team1Class} ${!match.team1 ? 'tbd' : ''}" data-team="${match.team1 || ''}">
                        <span class="team-name" style="background-color: ${team1.color}; color: ${team1.darkText ? '#333' : '#FFF'};">
                            ${team1.name}
                        </span>
                        <span class="team-score">${match.score1 !== null && match.score1 !== undefined ? match.score1 : '-'}</span>
                    </div>
                    <div class="match-team ${team2Class} ${!match.team2 ? 'tbd' : ''}" data-team="${match.team2 || ''}">
                        <span class="team-name" style="background-color: ${team2.color}; color: ${team2.darkText ? '#333' : '#FFF'};">
                            ${team2.name}
                        </span>
                        <span class="team-score">${match.score2 !== null && match.score2 !== undefined ? match.score2 : '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render finals/3rd place match (no outgoing connector lines)
function renderFinalMatch(match) {
    const team1 = match.team1 ? (getTeamById(match.team1) || { name: 'TBD', color: '#999' }) : { name: 'TBD', color: '#999' };
    const team2 = match.team2 ? (getTeamById(match.team2) || { name: 'TBD', color: '#999' }) : { name: 'TBD', color: '#999' };

    const team1Class = match.winner === match.team1 ? 'winner' : (match.winner === match.team2 ? 'loser' : '');
    const team2Class = match.winner === match.team2 ? 'winner' : (match.winner === match.team1 ? 'loser' : '');

    return `
        <div class="match final-match">
            ${match.time ? `<div class="match-time">${match.time}</div>` : ''}
            <div class="match-teams">
                <div class="match-team ${team1Class} ${!match.team1 ? 'tbd' : ''}" data-team="${match.team1 || ''}">
                    <span class="team-name" style="background-color: ${team1.color}; color: ${team1.darkText ? '#333' : '#FFF'};">
                        ${team1.name}
                    </span>
                    <span class="team-score">${match.score1 !== null && match.score1 !== undefined ? match.score1 : '-'}</span>
                </div>
                <div class="match-team ${team2Class} ${!match.team2 ? 'tbd' : ''}" data-team="${match.team2 || ''}">
                    <span class="team-name" style="background-color: ${team2.color}; color: ${team2.darkText ? '#333' : '#FFF'};">
                        ${team2.name}
                    </span>
                    <span class="team-score">${match.score2 !== null && match.score2 !== undefined ? match.score2 : '-'}</span>
                </div>
            </div>
        </div>
    `;
}

// Get team by ID (from teams-config.js)
function getTeamById(teamId) {
    return teams.find(t => String(t.id) === String(teamId));
}

// Back button handler
backToGames.addEventListener('click', () => {
    bracketView.classList.add('hidden');
    gameSelection.classList.remove('hidden');
    selectedGame = null;
});

// Initialize
loadGames();
