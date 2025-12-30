// Team configuration - reusable across the project
// Colors sourced from colors.txt

const TEAM_COLORS = {
    FIRST_YEAR: "#F1C231",
    NURSING: "#D9D9D9",
    MIMM: "#1255CC",
    BIOLOGY: "#37B600",
    MATH_PHYSICS: "#990001",
    NEUROSCIENCE: "#361C75",
    ENVIRONMENT: "#F2E1AF",
    CHEMISTRY: "#FF70BA",
    BIOCHEM: "#8BCBFF",
    COMPSCI_PSYCH: "#FF0000",
    PHARMACOLOGY: "#000000",
    PHGY_ANAT: "#C9DBF8",
    MAC: "#D9EAD3",
    ARTSCI: "#CEC1EB",
    SOCIAL_SCIENCE: "#CEC1EB",
    PTOT: "#FFB2DD"
};

// Helper function to determine if text should be dark based on background color
function shouldUseDarkText(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

const teams = [
    { id: 1, name: "First Year", color: TEAM_COLORS.FIRST_YEAR, points: 282.65 },
    { id: 2, name: "MIMM", color: TEAM_COLORS.MIMM, points: 2963.9 },
    { id: 3, name: "Math/Physics", color: TEAM_COLORS.MATH_PHYSICS, points: 2875 },
    { id: 4, name: "Environment", color: TEAM_COLORS.ENVIRONMENT, points: 2054.15 },
    { id: 5, name: "Biochem", color: TEAM_COLORS.BIOCHEM, points: 2326.1 },
    { id: 6, name: "Pharmacology", color: TEAM_COLORS.PHARMACOLOGY, points: 5013.4 },
    { id: 7, name: "Mac", color: TEAM_COLORS.MAC, points: 1555.9 },
    { id: 8, name: "Social Science", color: TEAM_COLORS.SOCIAL_SCIENCE, points: 2148.41 },
    { id: 9, name: "Nursing", color: TEAM_COLORS.NURSING, points: 390.15 },
    { id: 10, name: "Biology", color: TEAM_COLORS.BIOLOGY, points: 4171.15 },
    { id: 11, name: "Neuroscience", color: TEAM_COLORS.NEUROSCIENCE, points: 1077.55 },
    { id: 12, name: "Chemistry", color: TEAM_COLORS.CHEMISTRY, points: 4958 },
    { id: 13, name: "CompSci/Psych", color: TEAM_COLORS.COMPSCI_PSYCH, points: 3299.3 },
    { id: 14, name: "PHGY/ANAT", color: TEAM_COLORS.PHGY_ANAT, points: 1903.1 },
    { id: 15, name: "ArtSci", color: TEAM_COLORS.ARTSCI, points: 2607.2 },
    { id: 16, name: "PTOT", color: TEAM_COLORS.PTOT, points: 443.4 }
].map(team => ({
    ...team,
    darkText: shouldUseDarkText(team.color)
}));

// ============================================
// STANDINGS & POINTS HELPER FUNCTIONS
// ============================================

// Get teams sorted by points (descending)
function getStandings() {
    return [...teams].sort((a, b) => b.points - a.points);
}

// Find a team by ID
function getTeamById(teamId) {
    return teams.find(team => team.id === teamId);
}

// Find a team by name (case-insensitive)
function getTeamByName(teamName) {
    return teams.find(team => team.name.toLowerCase() === teamName.toLowerCase());
}

// Add points to a team by ID
function addPoints(teamId, amount) {
    const team = getTeamById(teamId);
    if (team) {
        team.points += amount;
        return team;
    }
    return null;
}

// Remove points from a team by ID
function removePoints(teamId, amount) {
    const team = getTeamById(teamId);
    if (team) {
        team.points = Math.max(0, team.points - amount);
        return team;
    }
    return null;
}

// Set points for a team by ID
function setPoints(teamId, amount) {
    const team = getTeamById(teamId);
    if (team) {
        team.points = Math.max(0, amount);
        return team;
    }
    return null;
}

// Add points to a team by name
function addPointsByName(teamName, amount) {
    const team = getTeamByName(teamName);
    if (team) {
        team.points += amount;
        return team;
    }
    return null;
}

// Remove points from a team by name
function removePointsByName(teamName, amount) {
    const team = getTeamByName(teamName);
    if (team) {
        team.points = Math.max(0, team.points - amount);
        return team;
    }
    return null;
}

// Get a team's current rank
function getTeamRank(teamId) {
    const standings = getStandings();
    const index = standings.findIndex(team => team.id === teamId);
    return index >= 0 ? index + 1 : null;
}
