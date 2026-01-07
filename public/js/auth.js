let selectedRole = 'teacher';

// Role selection
document.querySelectorAll('.role-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    selectedRole = this.dataset.role;
  });
});

// Login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error');
  
  try {
    // Sign in
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Get user role from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      // New user - create profile
      await db.collection('users').doc(user.uid).set({
        email: email,
        role: selectedRole,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Redirect based on selected role
      redirectUser(selectedRole);
    } else {
      // Existing user - redirect based on stored role
      const userData = userDoc.data();
      redirectUser(userData.role);
    }
    
  } catch (error) {
    errorDiv.textContent = error.message;
  }
});

// Check if user is already logged in
auth.onAuthStateChanged(async (user) => {
  if (user && window.location.pathname === '/index.html') {
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      redirectUser(userData.role);
    }
  }
});

function redirectUser(role) {
  if (role === 'teacher') {
    window.location.href = 'teacher.html';
  } else {
    window.location.href = 'student.html';
  }
}

// Signup toggle (simplified for hackathon)
document.getElementById('signupToggle').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    document.getElementById('error').textContent = 'Please enter email and password';
    return;
  }
  
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    await db.collection('users').doc(user.uid).set({
      email: email,
      role: selectedRole,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    redirectUser(selectedRole);
  } catch (error) {
    document.getElementById('error').textContent = error.message;
  }
});