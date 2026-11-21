
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  BackHandler,
  Platform,
  PermissionsAndroid
} from 'react-native';

import {
  getMessaging,
  getToken,
  subscribeToTopic,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';

import {
  Menu,
  Search,
  X,
  Plus,
  ArrowLeft,
  MoreVertical,
  Image as ImageIcon,
  AudioLines,
  Bold,
  Italic,
  Underline,
} from 'lucide-react-native';

import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from '@react-native-firebase/firestore';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

type Note = {
  id: string;
  title: string;
  content: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

const COLORS = [
  '#D0FCCE',
  '#C6CBFB',
  '#F6C7FB',
  '#ACF2F3',
  '#FBF3C4',
  '#F2C0CE',
];

const HEIGHTS = [132, 252, 160, 180, 242, 132];

const testDb = getFirestore();

if (__DEV__) {
  connectFirestoreEmulator(testDb, '10.0.2.2', 8080);
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [screen, setScreen] = useState<'list' | 'editor'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);

  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);

  // Lấy dữ liệu ghi chú realtime
  useEffect(() => {
    const db = getFirestore();
    const notesQuery = query(
      collection(db, 'notes'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      snapshot => {
        const result: Note[] = snapshot.docs.map(item => {
          const data = item.data();

          return {
            id: item.id,
            title: data.title ?? '',
            content: data.content ?? '',
            bold: data.bold === true,
            italic: data.italic === true,
            underline: data.underline === true,
          };
        });

        setNotes(result);
      },
      error => {
        console.error(error);
        Alert.alert('Error', 'Cannot load notes');
      },
    );

    return unsubscribe;
  }, []);

  // Mở màn hình tạo ghi chú
  const createNote = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setBold(false);
    setItalic(false);
    setUnderline(false);
    setScreen('editor');
  };

  // Mở màn hình sửa ghi chú
  const openNote = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setBold(note.bold);
    setItalic(note.italic);
    setUnderline(note.underline);
    setScreen('editor');
  };

  // Lưu ghi chú khi quay lại hoặc chọn Save
  const saveAndClose = useCallback(async () => {
    if (saving) {
      return;
    }

    if (!title.trim() && !content.trim() && !editingId) {
      Keyboard.dismiss();
      setScreen('list');
      return;
    }

    setSaving(true);

    try {
      const db = getFirestore();

      const noteData = {
        title: title.trim() || 'Untitled',
        content: content.trim(),
        bold,
        italic,
        underline,
      };

      if (editingId) {
        await updateDoc(doc(db, 'notes', editingId), {
          ...noteData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'notes'), {
          ...noteData,
          createdAt: serverTimestamp(),
        });
      }

      Keyboard.dismiss();
      setScreen('list');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Cannot save note');
    } finally {
      setSaving(false);
    }
  }, [
    title,
    content,
    editingId,
    bold,
    italic,
    underline,
    saving,
  ]);

  // Xử lý nút Back vật lý của Android
  useEffect(() => {
    if (screen !== 'editor') {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        void saveAndClose();
        return true;
      },
    );

    return () => subscription.remove();
  }, [screen, saveAndClose]);

  // Xóa ghi chú
  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(getFirestore(), 'notes', id));
              Keyboard.dismiss();
              setScreen('list');
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Cannot delete note');
            }
          },
        },
      ],
    );
  };

  // Menu màn hình chỉnh sửa
  const showEditMenu = () => {
    const actions: any[] = [
      {
        text: 'Save Note',
        onPress: () => void saveAndClose(),
      },
    ];

    if (editingId) {
      actions.push({
        text: 'Delete Note',
        style: 'destructive',
        onPress: () => confirmDelete(editingId),
      });
    }

    actions.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Note Options', 'Choose an action', actions);
  };

  // Menu sắp xếp
  const showListMenu = () => {
    Alert.alert('Sort Notes', 'Choose display order', [
      {
        text: 'Newest First',
        onPress: () => setNewestFirst(true),
      },
      {
        text: 'Oldest First',
        onPress: () => setNewestFirst(false),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Lọc và sắp xếp ghi chú
  const orderedNotes = newestFirst
    ? notes
    : [...notes].reverse();

  const filteredNotes = orderedNotes.filter(note => {
    const keyword = searchText.toLowerCase();

    return (
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword)
    );
  });

  // Chia ghi chú thành hai cột độc lập
  const columns = [
    filteredNotes.filter((_, index) => index % 2 === 0),
    filteredNotes.filter((_, index) => index % 2 === 1),
  ];

  // SCREEN 1 - RECENT NOTES
  const renderListScreen = () => (
    <View style={styles.listScreen}>
      <View style={styles.listHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={showListMenu}>
          <Menu size={27} color="#292929" strokeWidth={2.5} />
        </TouchableOpacity>

        {searching ? (
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        ) : (
          <Text style={styles.headerTitle}>Recent Notes</Text>
        )}

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            if (searching) {
              setSearchText('');
            }
            setSearching(!searching);
          }}>
          {searching ? (
            <X size={26} color="#292929" />
          ) : (
            <Search size={27} color="#292929" strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>

      {filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchText ? 'No matching notes' : 'No notes yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={[0, 1]}
          numColumns={2}
          keyExtractor={item => String(item)}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.notesContainer}
          renderItem={({ item: columnIndex }) => (
            <View style={styles.noteColumn}>
              {columns[columnIndex].map((note, index) => {
                const colorIndex = index * 2 + columnIndex;

                return (
                  <TouchableOpacity
                    key={note.id}
                    activeOpacity={0.85}
                    style={[
                      styles.noteCard,
                      {
                        backgroundColor:
                          COLORS[colorIndex % COLORS.length],
                        minHeight:
                          HEIGHTS[colorIndex % HEIGHTS.length],
                      },
                    ]}
                    onPress={() => openNote(note)}
                    onLongPress={() => confirmDelete(note.id)}>
                    <Text
                      style={styles.noteTitle}
                      numberOfLines={2}>
                      {note.title}
                    </Text>

                    <Text
                      numberOfLines={10}
                      style={[
                        styles.noteContent,
                        {
                          fontWeight: note.bold ? '700' : '400',
                          fontStyle: note.italic
                            ? 'italic'
                            : 'normal',
                          textDecorationLine: note.underline
                            ? 'underline'
                            : 'none',
                        },
                      ]}>
                      {note.content}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.85}
        onPress={createNote}>
        <Plus size={34} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );

  // SCREEN 2 - EDIT NOTE
  const renderEditorScreen = () => (
    <KeyboardAvoidingView
      style={styles.editorScreen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>

      <View style={styles.editorHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          disabled={saving}
          onPress={() => void saveAndClose()}>
          <ArrowLeft size={28} color="#313131" />
        </TouchableOpacity>

        <Text style={styles.editorHeaderTitle}>Edit Note</Text>

        <TouchableOpacity
          style={styles.headerButton}
          disabled={saving}
          onPress={showEditMenu}>
          <MoreVertical
            size={27}
            color="#313131"
            strokeWidth={2.7}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.editorContent}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          placeholderTextColor="#898374"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          multiline
          textAlign="center"
        />

        <TextInput
          style={[
            styles.bodyInput,
            {
              fontWeight: bold ? '700' : '400',
              fontStyle: italic ? 'italic' : 'normal',
              textDecorationLine: underline
                ? 'underline'
                : 'none',
            },
          ]}
          placeholder="Write your note here..."
          placeholderTextColor="#999381"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          autoFocus
        />
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolButton, bold && styles.activeTool]}
          onPress={() => setBold(!bold)}>
          <Bold size={23} color="#414141" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, italic && styles.activeTool]}
          onPress={() => setItalic(!italic)}>
          <Italic size={23} color="#414141" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, underline && styles.activeTool]}
          onPress={() => setUnderline(!underline)}>
          <Underline size={23} color="#414141" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={() =>
            Alert.alert(
              'Image',
              'Image attachments are not implemented in this lab.',
            )
          }>
          <ImageIcon size={24} color="#414141" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={() =>
            Alert.alert(
              'Audio',
              'Audio recording is not implemented in this lab.',
            )
          }>
          <AudioLines size={24} color="#414141" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );


  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );

          if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission denied');
            return;
          }
        }

        const messaging = getMessaging();

        const token = await getToken(messaging);
        console.log('FCM Token:', token);

        await subscribeToTopic(messaging, 'new_notes');
        console.log('Subscribed to new_notes');

      } catch (error) {
        console.error('FCM initialization error:', error);
      }
    };

    void initializeMessaging();
  }, []);



  useEffect(() => {
    const messaging = getMessaging();

    const openRecentNotes = () => {
      Keyboard.dismiss();
      setSearchText('');
      setSearching(false);
      setScreen('list');
    };

    // Khi nhấn thông báo lúc app đang chạy nền
    const unsubscribe = onNotificationOpenedApp(
      messaging,
      remoteMessage => {
        console.log('Notification opened:', remoteMessage.messageId);
        openRecentNotes();
      },
    );

    // Khi nhấn thông báo để khởi động app từ trạng thái tắt
    getInitialNotification(messaging)
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from notification');
          openRecentNotes();
        }
      })
      .catch(error => {
        console.error('Notification open error:', error);
      });

    return unsubscribe;
  }, []);


  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          styles.root,
          {
            backgroundColor:
              screen === 'editor' ? '#FFF4C5' : '#FFFFFF',
          },
        ]}
        edges={['top', 'bottom', 'left', 'right']}>

        <StatusBar barStyle="dark-content" />

        {screen === 'list'
          ? renderListScreen()
          : renderEditorScreen()}

      </SafeAreaView>
    </SafeAreaProvider>
  );

}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // RECENT NOTES
  listScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listHeader: {
    height: 76,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 42,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#344150',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 10,
  },
  notesContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 110,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noteColumn: {
    width: '48%',
  },
  noteCard: {
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 14,
    elevation: 1,
  },
  noteTitle: {
    fontSize: 16,
    color: '#626367',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 19,
    color: '#77777B',
    textAlign: 'left',
  },

  addButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#DF5963',
    justifyContent: 'center',
    alignItems: 'center',

    boxShadow: '0px 0px 16px 4px rgba(156, 152, 152, 0.35)',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },

  // EDIT NOTE
  editorScreen: {
    flex: 1,
    backgroundColor: '#FFF4C5',
  },
  editorHeader: {
    height: 76,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editorHeaderTitle: {
    fontSize: 17,
    color: '#424242',
    fontWeight: '700',
  },
  editorContent: {
    flex: 1,
    paddingHorizontal: 43,
    paddingTop: 8,
  },
  titleInput: {
    fontSize: 28,
    color: '#68645B',
    fontWeight: '700',
    marginBottom: 19,
    paddingVertical: 4,
    textAlign: 'center',
    maxHeight: 95,
  },
  bodyInput: {
    flex: 1,
    fontSize: 20,
    lineHeight: 31,
    color: '#747065',
    padding: 0,
    textAlignVertical: 'top',
  },
  toolbar: {
    height: 51,
    backgroundColor: '#DDDDDD',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#D1D1D1',
  },
  toolButton: {
    width: 46,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTool: {
    backgroundColor: '#BFBFBF',
  },
});
