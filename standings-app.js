// DOM Elements
const rankingsContainer = document.getElementById('rankings-container');

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

// Render rankings
function renderRankings(standings) {
    const maxPoints = standings[0]?.points || 1;

    rankingsContainer.innerHTML = standings.map((team, index) => {
        const barWidth = (team.points / maxPoints) * 100;
        const rank = index + 1;

        return `
            <div class="rank-row">
                <div class="rank-position">${rank}</div>
                <div class="rank-team-info">
                    <div class="rank-team-name" style="background-color: ${team.color}; color: ${team.darkText ? '#333' : '#FFF'};">
                        ${team.name}
                    </div>
                </div>
                <div class="rank-bar-container">
                    <div class="rank-bar" style="width: ${barWidth}%; background-color: ${team.color};"></div>
                </div>
                <div class="rank-points">${team.points.toLocaleString()} pts</div>
            </div>
        `;
    }).join('');
}

// Initialize rankings display
async function initRankings() {
    // Try Firebase first
    if (isFirebaseConfigured()) {
        try {
            // Set up real-time listener for live updates
            db.collection('teams').orderBy('points', 'desc').onSnapshot((snapshot) => {
                const standings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderRankings(standings);
            });
            console.log('Firebase connected, live standings enabled');
            return;
        } catch (e) {
            console.log('Firebase error, using local data:', e);
        }
    }

    // Fall back to local data
    console.log('Using local data for standings');
    const standings = getStandings();
    renderRankings(standings);
}

// Initialize
initRankings();
