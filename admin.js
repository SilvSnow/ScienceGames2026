// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Points tab elements
const teamsList = document.getElementById('teams-list');
const quickBtns = document.querySelectorAll('.quick-btn');

// Schedule tab elements
const scheduleTeamSelect = document.getElementById('schedule-team-select');
const scheduleDaySelect = document.getElementById('schedule-day-select');
const eventsContainer = document.getElementById('events-container');
const addEventBtn = document.getElementById('add-event-btn');
const saveScheduleBtn = document.getElementById('save-schedule-btn');

// Announcements tab elements
const announcementDaySelect = document.getElementById('announcement-day-select');
const dayTitle = document.getElementById('day-title');
const dayAnnouncements = document.getElementById('day-announcements');
const dayTips = document.getElementById('day-tips');
const dayLocations = document.getElementById('day-locations');
const dayContact = document.getElementById('day-contact');
const saveAnnouncementBtn = document.getElementById('save-announcement-btn');

// State
let currentTeams = [];
let selectedQuickAmount = 0;

// ============================================
// AUTHENTICATION
// ============================================

// Check auth state on load
onAuthStateChange((user) => {
    if (user) {
        showDashboard();
        loadTeams();
    } else {
        showLogin();
    }
});

// Login form submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const result = await signIn(email, password);
    if (result.success) {
        loginError.classList.add('hidden');
    } else {
        loginError.textContent = result.error;
        loginError.classList.remove('hidden');
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    await signOut();
});

function showLogin() {
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
}

// ============================================
// NAVIGATION
// ============================================

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // Update nav buttons
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update tab content
        tabContents.forEach(content => {
            content.classList.add('hidden');
            if (content.id === `${tab}-tab`) {
                content.classList.remove('hidden');
            }
        });
    });
});

// ============================================
// POINTS MANAGEMENT
// ============================================

async function loadTeams() {
    currentTeams = await getStandingsFromDB();
    renderTeamsList();
    populateTeamSelect();
}

function renderTeamsList() {
    teamsList.innerHTML = currentTeams.map((team, index) => `
        <div class="team-row" data-team-id="${team.id}">
            <span class="team-rank">#${index + 1}</span>
            <span class="team-name" style="background-color: ${team.color}; color: ${team.darkText ? '#333' : '#FFF'};">
                ${team.name}
            </span>
            <div class="team-points-control">
                <button class="points-btn minus" data-team-id="${team.id}">−</button>
                <input type="number" class="points-input" value="${team.points}" data-team-id="${team.id}">
                <button class="points-btn plus" data-team-id="${team.id}">+</button>
            </div>
            <button class="btn-save-points" data-team-id="${team.id}">Save</button>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.points-btn.plus').forEach(btn => {
        btn.addEventListener('click', () => adjustPoints(btn.dataset.teamId, selectedQuickAmount || 1));
    });

    document.querySelectorAll('.points-btn.minus').forEach(btn => {
        btn.addEventListener('click', () => adjustPoints(btn.dataset.teamId, -(selectedQuickAmount || 1)));
    });

    document.querySelectorAll('.btn-save-points').forEach(btn => {
        btn.addEventListener('click', () => saveTeamPoints(btn.dataset.teamId));
    });
}

function adjustPoints(teamId, amount) {
    const input = document.querySelector(`.points-input[data-team-id="${teamId}"]`);
    const currentValue = parseFloat(input.value) || 0;
    input.value = Math.max(0, currentValue + amount);
}

async function saveTeamPoints(teamId) {
    const input = document.querySelector(`.points-input[data-team-id="${teamId}"]`);
    const newPoints = parseFloat(input.value) || 0;

    const success = await updateTeamPoints(teamId, newPoints);
    if (success) {
        showToast('Points updated!');
        loadTeams(); // Refresh to show new rankings
    } else {
        showToast('Error updating points', true);
    }
}

// Quick amount buttons
quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        quickBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedQuickAmount = parseInt(btn.dataset.amount);
    });
});

// ============================================
// SCHEDULE MANAGEMENT
// ============================================

function populateTeamSelect() {
    scheduleTeamSelect.innerHTML = '<option value="">Select a team...</option>' +
        currentTeams.map(team => `<option value="${team.id}">${team.name}</option>`).join('');
}

scheduleTeamSelect.addEventListener('change', loadSchedule);
scheduleDaySelect.addEventListener('change', loadSchedule);

async function loadSchedule() {
    const teamId = scheduleTeamSelect.value;
    const day = scheduleDaySelect.value;

    if (!teamId) {
        eventsContainer.innerHTML = '<p class="hint">Select a team to edit their schedule</p>';
        return;
    }

    const schedule = await getScheduleFromDB(teamId);
    const events = schedule[day] || [];

    renderEvents(events);
}

function renderEvents(events) {
    if (events.length === 0) {
        eventsContainer.innerHTML = '<p class="hint">No events for this day. Click "Add Event" to create one.</p>';
        return;
    }

    eventsContainer.innerHTML = events.map((event, index) => `
        <div class="event-row" data-index="${index}">
            <input type="text" class="event-time" value="${event.time}" placeholder="Time (e.g., 9:00 AM)">
            <input type="text" class="event-name" value="${event.name}" placeholder="Event name">
            <input type="text" class="event-location" value="${event.location}" placeholder="Location">
            <button class="btn-remove-event" data-index="${index}">×</button>
        </div>
    `).join('');

    document.querySelectorAll('.btn-remove-event').forEach(btn => {
        btn.addEventListener('click', () => removeEvent(parseInt(btn.dataset.index)));
    });
}

addEventBtn.addEventListener('click', () => {
    const eventRow = document.createElement('div');
    eventRow.className = 'event-row';
    eventRow.innerHTML = `
        <input type="text" class="event-time" placeholder="Time (e.g., 9:00 AM)">
        <input type="text" class="event-name" placeholder="Event name">
        <input type="text" class="event-location" placeholder="Location">
        <button class="btn-remove-event">×</button>
    `;

    const removeBtn = eventRow.querySelector('.btn-remove-event');
    removeBtn.addEventListener('click', () => eventRow.remove());

    eventsContainer.appendChild(eventRow);
});

function removeEvent(index) {
    const rows = eventsContainer.querySelectorAll('.event-row');
    if (rows[index]) {
        rows[index].remove();
    }
}

saveScheduleBtn.addEventListener('click', async () => {
    const teamId = scheduleTeamSelect.value;
    const day = scheduleDaySelect.value;

    if (!teamId) {
        showToast('Please select a team', true);
        return;
    }

    const eventRows = eventsContainer.querySelectorAll('.event-row');
    const events = Array.from(eventRows).map(row => ({
        time: row.querySelector('.event-time').value,
        name: row.querySelector('.event-name').value,
        location: row.querySelector('.event-location').value
    })).filter(e => e.time && e.name); // Filter out empty events

    const success = await updateScheduleInDB(teamId, day, events);
    if (success) {
        showToast('Schedule saved!');
    } else {
        showToast('Error saving schedule', true);
    }
});

// ============================================
// ANNOUNCEMENTS MANAGEMENT
// ============================================

announcementDaySelect.addEventListener('change', loadAnnouncements);

async function loadAnnouncements() {
    const day = announcementDaySelect.value;
    const info = await getDailyInfoFromDB(day);

    if (info) {
        dayTitle.value = info.title || '';
        dayAnnouncements.value = (info.announcements || []).join('\n');
        dayTips.value = (info.tips || []).join('\n');
        dayLocations.value = info.locations || '';
        dayContact.value = info.contact || '';
    } else {
        dayTitle.value = '';
        dayAnnouncements.value = '';
        dayTips.value = '';
        dayLocations.value = '';
        dayContact.value = '';
    }
}

saveAnnouncementBtn.addEventListener('click', async () => {
    const day = announcementDaySelect.value;

    const info = {
        title: dayTitle.value,
        announcements: dayAnnouncements.value.split('\n').filter(a => a.trim()),
        tips: dayTips.value.split('\n').filter(t => t.trim()),
        locations: dayLocations.value,
        contact: dayContact.value
    };

    const success = await updateDailyInfoInDB(day, info);
    if (success) {
        showToast('Announcements saved!');
    } else {
        showToast('Error saving announcements', true);
    }
});

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.toggle('error', isError);

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Load announcements for day 1 on init
setTimeout(loadAnnouncements, 500);
