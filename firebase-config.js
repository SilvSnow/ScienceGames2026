// Firebase Configuration
// Replace these values with your Firebase project config
// Get these from: Firebase Console → Project Settings → Your Apps → Web App

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyB63nG1G0KLuSW0kREmcbRgufnXXnCdxSo",
    authDomain: "mcgill-science-games.firebaseapp.com",
    projectId: "mcgill-science-games",
    storageBucket: "mcgill-science-games.firebasestorage.app",
    messagingSenderId: "616487727490",
    appId: "1:616487727490:web:bdd902ed2a3cd01c845f9b",
    measurementId: "G-CY6GCRF1MZ"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();

// ============================================
// DATABASE HELPER FUNCTIONS
// ============================================

// Get all teams from Firebase
async function getTeamsFromDB() {
    try {
        const snapshot = await db.collection('teams').orderBy('name').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting teams:', error);
        return [];
    }
}

// Get teams sorted by points
async function getStandingsFromDB() {
    try {
        const snapshot = await db.collection('teams').orderBy('points', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting standings:', error);
        return [];
    }
}

// Update team points
async function updateTeamPoints(teamId, newPoints) {
    try {
        await db.collection('teams').doc(teamId).update({ points: newPoints });
        return true;
    } catch (error) {
        console.error('Error updating points:', error);
        return false;
    }
}

// Add points to a team
async function addPointsToDB(teamId, amount) {
    try {
        const teamRef = db.collection('teams').doc(teamId);
        await db.runTransaction(async (transaction) => {
            const teamDoc = await transaction.get(teamRef);
            const currentPoints = teamDoc.data().points || 0;
            transaction.update(teamRef, { points: currentPoints + amount });
        });
        return true;
    } catch (error) {
        console.error('Error adding points:', error);
        return false;
    }
}

// Get schedule for a team
async function getScheduleFromDB(teamId) {
    try {
        const doc = await db.collection('schedules').doc(teamId).get();
        return doc.exists ? doc.data() : {};
    } catch (error) {
        console.error('Error getting schedule:', error);
        return {};
    }
}

// Update schedule for a team and day
async function updateScheduleInDB(teamId, day, events) {
    try {
        await db.collection('schedules').doc(teamId).set(
            { [day]: events },
            { merge: true }
        );
        return true;
    } catch (error) {
        console.error('Error updating schedule:', error);
        return false;
    }
}

// Get daily info
async function getDailyInfoFromDB(day) {
    try {
        const doc = await db.collection('dailyInfo').doc(String(day)).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error('Error getting daily info:', error);
        return null;
    }
}

// Update daily info
async function updateDailyInfoInDB(day, info) {
    try {
        await db.collection('dailyInfo').doc(String(day)).set(info);
        return true;
    } catch (error) {
        console.error('Error updating daily info:', error);
        return false;
    }
}

// ============================================
// AUTHENTICATION HELPERS
// ============================================

// Sign in with email/password
async function signIn(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign out
async function signOut() {
    try {
        await auth.signOut();
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        return false;
    }
}

// Check if user is logged in
function onAuthStateChange(callback) {
    return auth.onAuthStateChanged(callback);
}
