const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

// Trigger khi có ghi chú mới trong Firestore
exports.sendNoteNotification = onDocumentCreated(
    'notes/{noteId}',
    async (event) => {
        const snapshot = event.data;

        if (!snapshot) {
            console.log('No document data');
            return;
        }

        const note = snapshot.data();

        console.log('New note created:', event.params.noteId);

        const message = {
            topic: 'new_notes',

            notification: {
                title: 'New Note Added!',
                body: `A new note "${note.title || 'Untitled'}" was created.`,
            },

            data: {
                screen: 'notes',
                noteId: event.params.noteId,
            },
        };

        if (process.env.FIRESTORE_EMULATOR_HOST) {
            console.log('TEST MODE - New note:', note.title);
            console.log('FCM message prepared:', message);
            return;
        }

        try {
            const messageId = await getMessaging().send(message);

            console.log('Notification sent:', messageId);
        } catch (error) {
            console.error('FCM send error:', error);
            throw error;
        }
    },
);
