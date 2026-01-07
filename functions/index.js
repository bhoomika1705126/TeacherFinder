const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Auto-update status based on time
exports.autoUpdateStatus = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Auto lunch break: 1:00 PM - 2:00 PM
    if (hour === 13 && minute >= 0 && minute < 60) {
      await updateAllTeachersStatus('busy', 'Lunch Break');
    }
    
    // Auto stop after 4:30 PM
    if (hour >= 16 && minute >= 30) {
      await updateAllTeachersStatus('unavailable', 'After Hours');
    }
    
    return null;
  });

async function updateAllTeachersStatus(status, reason) {
  const snapshot = await admin.firestore().collection('teachers').get();
  const batch = admin.firestore().batch();
  
  snapshot.forEach(doc => {
    batch.update(doc.ref, {
      status: status,
      autoReason: reason,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update Realtime Database
    admin.database().ref(`status/${doc.id}`).set(status);
  });
  
  await batch.commit();
}

// HTTP function to manually trigger status update (for testing)
exports.updateStatus = functions.https.onRequest(async (req, res) => {
  await updateAllTeachersStatus('available', 'Manual Update');
  res.send('Status updated for all teachers');
});