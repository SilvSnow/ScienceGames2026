// DOM Elements
const rankingsContainer = document.getElementById('rankings-container');

// Initialize rankings display
function initRankings() {
    const standings = getStandings();
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

// Initialize
initRankings();
