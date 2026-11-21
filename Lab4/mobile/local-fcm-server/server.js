
const {initializeApp, cert} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');
const {getMessaging} = require('firebase-admin/messaging');

const serviceAccount = require('./serviceAccountKey.json');

// Kết nối Firestore Emulator
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

// Khởi tạo Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore();

console.log('Firebase Admin initialized');
console.log('Connecting to Firestore Emulator...');

// Bỏ qua ghi chú cũ khi backend vừa khởi động
let initialized = false;

// Theo dõi collection notes
db.collection('notes').onSnapshot(
  snapshot => {
    if (!initialized) {
      initialized = true;
      console.log('Firestore listener ready!');
      console.log('Waiting for new notes...');
      return;
    }

    snapshot.docChanges().forEach(change => {
      if (change.type !== 'added') {
        return;
      }

      const note = change.doc.data();
      const noteId = change.doc.id;

      console.log('New note detected:', note.title);

      void sendNotification(noteId);
    });
  },
  error => {
    console.error('Firestore listener error:', error);
  },
);

// Gửi thông báo FCM thật
async function sendNotification(noteId) {
  const message = {
    topic: 'new_notes',
    notification: {
      title: 'New Note Added!',
      body: 'A new note has been created.',
    },
    data: {
      screen: 'notes',
      noteId: noteId,
    },
  };

  try {
    const response = await getMessaging().send(message);

    console.log('FCM notification sent!');
    console.log('Message ID:', response);
  } catch (error) {
    console.error('FCM send failed:', error);
  }
}
