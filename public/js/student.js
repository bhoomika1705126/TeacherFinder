console.log('Student.js loaded');

// Auth check
auth.onAuthStateChanged((user) => {
  if (!user) {
    console.log('No user, redirecting to login');
    window.location.href = '/';
    return;
  }
  console.log('User logged in:', user.email);
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  console.log('Logging out');
  await auth.signOut();
  window.location.href = '/';
});

// Search teachers
document.getElementById('searchBtn').addEventListener('click', searchTeachers);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchTeachers();
});

async function searchTeachers() {
  console.log('Search button clicked');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const resultsDiv = document.getElementById('teacherResults');
  
  if (!searchTerm) {
    resultsDiv.innerHTML = '<div class="teacher-card"><p>Please enter a search term</p></div>';
    return;
  }
  
  console.log('Searching for:', searchTerm);
  resultsDiv.innerHTML = '<div class="teacher-card"><p>Searching...</p></div>';
  
  try {
    // Search in Firestore
    const snapshot = await db.collection('teachers').get();
    console.log('Found documents:', snapshot.size);
    
    const teachers = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Teacher data:', data);
      
      if (data.email && data.email.toLowerCase().includes(searchTerm)) {
        teachers.push({ id: doc.id, ...data });
      }
    });
    
    console.log('Matching teachers:', teachers.length);
    
    if (teachers.length === 0) {
      resultsDiv.innerHTML = '<div class="teacher-card"><p>No teachers found. Try searching for: teacher</p></div>';
      return;
    }
    
    // Display results
    resultsDiv.innerHTML = '';
    teachers.forEach(teacher => {
      displayTeacher(teacher);
    });
    
  } catch (error) {
    console.error('Search error:', error);
    resultsDiv.innerHTML = `<div class="teacher-card"><p>Error: ${error.message}</p></div>`;
  }
}

function displayTeacher(teacher) {
  console.log('Displaying teacher:', teacher.id);
  const resultsDiv = document.getElementById('teacherResults');
  const card = document.createElement('div');
  card.className = 'teacher-card';
  card.id = `teacher-${teacher.id}`;
  
  // Initial render
  card.innerHTML = `
    <h3>${teacher.name || teacher.email}</h3>
    <div class="status-indicator status-green" id="status-${teacher.id}">
      Loading...
    </div>
    <p><strong>Location:</strong> <span id="location-${teacher.id}">${teacher.location || 'Not specified'}</span></p>
    <details>
      <summary>View Timetable</summary>
      <pre>${teacher.timetable || 'No timetable uploaded'}</pre>
    </details>
  `;
  
  resultsDiv.appendChild(card);
  
  // Listen to real-time status updates
  rtdb.ref(`status/${teacher.id}`).on('value', (snapshot) => {
    const status = snapshot.val() || 'available';
    console.log(`Status update for ${teacher.id}:`, status);
    
    const statusElement = document.getElementById(`status-${teacher.id}`);
    if (statusElement) {
      // Remove old classes
      statusElement.className = 'status-indicator';
      
      // Add new class based on status
      if (status === 'available') {
        statusElement.classList.add('status-green');
      } else if (status === 'busy') {
        statusElement.classList.add('status-yellow');
      } else {
        statusElement.classList.add('status-red');
      }
      
      // Update text
      statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
  });
  
  // Listen to location updates
  db.collection('teachers').doc(teacher.id).onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      const locationElement = document.getElementById(`location-${teacher.id}`);
      if (locationElement && data.location) {
        locationElement.textContent = data.location;
      }
    }
  });
}

console.log('Student.js initialized');