let currentUser = null;

// Auth check
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  currentUser = user;
  loadTeacherData();
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await auth.signOut();
  window.location.href = 'index.html';
});

// Load teacher data
async function loadTeacherData() {
  const teacherDoc = await db.collection('teachers').doc(currentUser.uid).get();
  
  if (teacherDoc.exists) {
    const data = teacherDoc.data();
    document.getElementById('currentStatus').textContent = data.status || 'Available';
    document.getElementById('locationInput').value = data.location || '';
    document.getElementById('timetableInput').value = data.timetable || '';
  }
  
  // Listen to real-time status updates
  rtdb.ref(`status/${currentUser.uid}`).on('value', (snapshot) => {
    const status = snapshot.val() || 'available';
    document.getElementById('currentStatus').textContent = 
      status.charAt(0).toUpperCase() + status.slice(1);
  });
}

// Status update buttons
document.querySelectorAll('.status-btn').forEach(btn => {
  btn.addEventListener('click', async function() {
    const status = this.dataset.status;
    
    // Update in Realtime Database
    await rtdb.ref(`status/${currentUser.uid}`).set(status);
    
    // Update in Firestore
    await db.collection('teachers').doc(currentUser.uid).set({
      status: status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    document.getElementById('currentStatus').textContent = 
      status.charAt(0).toUpperCase() + status.slice(1);
  });
});

// Update location
document.getElementById('updateLocationBtn').addEventListener('click', async () => {
  const location = document.getElementById('locationInput').value;
  
  await db.collection('teachers').doc(currentUser.uid).set({
    location: location,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  
  alert('Location updated!');
});

// Upload timetable
document.getElementById('uploadTimetableBtn').addEventListener('click', async () => {
  const timetable = document.getElementById('timetableInput').value;
  
  await db.collection('teachers').doc(currentUser.uid).set({
    timetable: timetable,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  
  // Also store teacher name for student search
  const userDoc = await db.collection('users').doc(currentUser.uid).get();
  await db.collection('teachers').doc(currentUser.uid).set({
    email: userDoc.data().email,
    name: userDoc.data().email.split('@')[0] // Simple name extraction
  }, { merge: true });
  
  alert('Timetable saved!');
});