// Daily information - important info for each day
// This is shared across all teams
const dailyInfo = {
    1: {
        title: "Day 1 - Opening Day",
        announcements: [
            "Welcome to Science Games 2026!",
            "Please arrive 15 minutes early for the Opening Ceremony",
            "Collect your team badges at the registration desk"
        ],
        tips: [
            "Wear comfortable clothes and closed-toe shoes",
            "Bring a water bottle and snacks",
            "Check in with your team captain before each event"
        ],
        locations: "Main events will be held in the Science Building and Gymnasium",
        contact: "For questions, visit the Help Desk in the Main Lobby"
    },
    2: {
        title: "Day 2 - Competition Day",
        announcements: [
            "Competitions begin promptly - don't be late!",
            "Lunch will be provided in the cafeteria from 12-1 PM"
        ],
        tips: [
            "Review the rules for each competition beforehand",
            "Bring pencils and a calculator if needed",
            "Support your teammates between events"
        ],
        locations: "Check the event boards for room assignments",
        contact: "Event coordinators will be at each competition venue"
    },
    3: {
        title: "Day 3 - Mid-Week",
        announcements: [
            "Team photos will be taken today",
            "Check the leaderboard for current standings"
        ],
        tips: [
            "Pace yourself - it's a long week!",
            "Make sure to stay hydrated",
            "Connect with other teams during breaks"
        ],
        locations: "Photo sessions in Room 200",
        contact: "See your team captain for photo schedule"
    },
    4: {
        title: "Day 4 - Challenge Day",
        announcements: [
            "Today features some of the biggest point opportunities",
            "Evening social event at 7 PM in the courtyard"
        ],
        tips: [
            "Give it your all - every point counts!",
            "Rest up tonight for the final day",
            "Don't forget to attend the social event"
        ],
        locations: "Main competitions in the Gymnasium",
        contact: "Social event coordinator: Check bulletin board"
    },
    5: {
        title: "Day 5 - Finals & Closing",
        announcements: [
            "Final competitions in the morning",
            "Awards Ceremony at 4 PM - attendance mandatory",
            "Pack your belongings before the ceremony"
        ],
        tips: [
            "Finish strong!",
            "Cheer on all teams during the ceremony",
            "Exchange contact info with new friends"
        ],
        locations: "Awards Ceremony in the Main Auditorium",
        contact: "Lost & Found at the registration desk until 6 PM"
    }
};

// Get daily info for a specific day
function getDailyInfo(day) {
    return dailyInfo[day] || null;
}

// Schedule data - edit events here
// Format: schedules[teamId][dayNumber] = array of events
const schedules = {
    1: {
        1: [
            { time: "9:00 AM", name: "Opening Ceremony", location: "Main Hall" },
            { time: "10:30 AM", name: "Chemistry Lab", location: "Room 101" },
            { time: "2:00 PM", name: "Physics Challenge", location: "Lab B" }
        ],
        2: [
            { time: "9:00 AM", name: "Biology Quiz", location: "Room 202" },
            { time: "11:00 AM", name: "Math Olympiad", location: "Auditorium" }
        ],
        3: [
            { time: "10:00 AM", name: "Engineering Build", location: "Workshop" },
            { time: "3:00 PM", name: "Team Strategy Session", location: "Room 105" }
        ],
        4: [
            { time: "9:00 AM", name: "Science Trivia", location: "Main Hall" },
            { time: "1:00 PM", name: "Robotics Competition", location: "Gym" }
        ],
        5: [
            { time: "10:00 AM", name: "Final Challenge", location: "Auditorium" },
            { time: "4:00 PM", name: "Awards Ceremony", location: "Main Hall" }
        ]
    }
    // Add more team schedules here following the same format
    // Example for team 2:
    // 2: {
    //     1: [{ time: "9:00 AM", name: "Event Name", location: "Location" }],
    //     2: [...],
    //     ...
    // }
};

// Helper function to get schedule for a team and day
function getSchedule(teamId, day) {
    if (schedules[teamId] && schedules[teamId][day]) {
        return schedules[teamId][day];
    }
    return []; // Return empty array if no schedule exists
}
