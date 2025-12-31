// DOM Elements
const teamButtons = document.getElementById('team-buttons');
const teamSelection = document.getElementById('team-selection');
const scheduleView = document.getElementById('schedule-view');
const teamNameEl = document.getElementById('team-name');
const eventsList = document.getElementById('events-list');
const backBtn = document.getElementById('back-btn');
const dayTabs = document.querySelectorAll('.day-tab');
const infoToggle = document.getElementById('info-toggle');
const infoTitle = document.getElementById('info-title');
const infoContent = document.getElementById('info-content');

// State
let selectedTeam = null;
let selectedDay = 1;
let infoExpanded = false;
let currentTeams = teams; // Will be updated from Firebase if available
let currentSchedules = schedules; // Will be updated from Firebase if available
let currentDailyInfo = dailyInfo; // Will be updated from Firebase if available

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

// Load data from Firebase if configured
async function loadFromFirebase() {
    if (!isFirebaseConfigured()) {
        console.log('Firebase not configured, using local data');
        return false;
    }

    try {
        // Load teams
        const teamsData = await getTeamsFromDB();
        if (teamsData.length > 0) {
            currentTeams = teamsData;
        }

        // Set up real-time listener for teams
        db.collection('teams').onSnapshot((snapshot) => {
            currentTeams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Re-render if we're on the team selection screen
            if (!selectedTeam) {
                teamButtons.innerHTML = '';
                renderTeamButtons();
            }
        });

        console.log('Firebase connected, using live data');
        return true;
    } catch (e) {
        console.log('Firebase error, falling back to local data:', e);
        return false;
    }
}

// Initialize team buttons
async function initTeamButtons() {
    await loadFromFirebase();
    renderTeamButtons();
}

// Render team buttons
function renderTeamButtons() {
    const sortedTeams = [...currentTeams].sort((a, b) => a.name.localeCompare(b.name));
    sortedTeams.forEach(team => {
        const btn = document.createElement('button');
        btn.className = 'team-btn';
        btn.textContent = team.name;
        btn.style.backgroundColor = team.color;
        if (team.darkText) {
            btn.style.color = '#333';
            btn.style.textShadow = 'none';
        } else {
            btn.style.color = '#FFF';
        }
        btn.addEventListener('click', () => selectTeam(team));
        teamButtons.appendChild(btn);
    });
}

// Select a team and show schedule
function selectTeam(team) {
    selectedTeam = team;
    selectedDay = 1;

    teamNameEl.textContent = team.name;
    teamNameEl.style.color = team.color;

    // Reset day tabs
    dayTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.day === '1') {
            tab.classList.add('active');
        }
    });

    // Show schedule view
    teamSelection.classList.add('hidden');
    scheduleView.classList.remove('hidden');

    renderEvents();
}

// Render events for selected team and day
async function renderEvents() {
    let events = [];

    // Try Firebase first, fall back to local
    if (isFirebaseConfigured()) {
        try {
            const schedule = await getScheduleFromDB(String(selectedTeam.id));
            events = schedule[selectedDay] || [];
        } catch (e) {
            events = getSchedule(selectedTeam.id, selectedDay);
        }
    } else {
        events = getSchedule(selectedTeam.id, selectedDay);
    }

    if (events.length === 0) {
        eventsList.innerHTML = '<div class="no-events">No events scheduled for this day</div>';
    } else {
        eventsList.innerHTML = events.map(event => `
            <div class="event-item">
                <div class="event-time">${event.time}</div>
                <div class="event-details">
                    <h3>${event.name}</h3>
                    <p>${event.location}</p>
                </div>
            </div>
        `).join('');
    }

    // Update daily info
    renderDailyInfo();
}

// Render daily info section
async function renderDailyInfo() {
    let info = null;

    // Try Firebase first, fall back to local
    if (isFirebaseConfigured()) {
        try {
            info = await getDailyInfoFromDB(selectedDay);
        } catch (e) {
            info = getDailyInfo(selectedDay);
        }
    } else {
        info = getDailyInfo(selectedDay);
    }

    if (!info) {
        infoContent.innerHTML = '<p>No information available for this day.</p>';
        infoTitle.textContent = `Day ${selectedDay} Info`;
        return;
    }

    infoTitle.textContent = info.title;

    infoContent.innerHTML = `
        <div class="info-section">
            <h4>Announcements</h4>
            <ul>
                ${(info.announcements || []).map(a => `<li>${a}</li>`).join('')}
            </ul>
        </div>
        <div class="info-section">
            <h4>Tips</h4>
            <ul>
                ${(info.tips || []).map(t => `<li>${t}</li>`).join('')}
            </ul>
        </div>
        <div class="info-section">
            <h4>Locations</h4>
            <p>${info.locations || ''}</p>
        </div>
        <div class="info-section">
            <h4>Contact</h4>
            <p>${info.contact || ''}</p>
        </div>
    `;
}

// Toggle daily info expand/collapse
function toggleDailyInfo() {
    infoExpanded = !infoExpanded;
    infoContent.classList.toggle('hidden', !infoExpanded);
    infoToggle.querySelector('.toggle-icon').textContent = infoExpanded ? '▲' : '▼';
}

// Back button handler
backBtn.addEventListener('click', () => {
    scheduleView.classList.add('hidden');
    teamSelection.classList.remove('hidden');
    selectedTeam = null;
});

// Day tab handlers
dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        dayTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        selectedDay = parseInt(tab.dataset.day);
        renderEvents();
    });
});

// Info toggle handler
infoToggle.addEventListener('click', toggleDailyInfo);

// Initialize
initTeamButtons();
