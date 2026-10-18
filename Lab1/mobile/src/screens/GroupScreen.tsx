import { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Appbar, IconButton, MD3Colors } from 'react-native-paper';
import { socket } from '../services/socket';

type Props = NativeStackScreenProps<RootStackParamList, 'Group'>;

const GroupScreen = ({ route, navigation }: Props) => {
    const { username } = route.params;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<{
        id: string;
        username: string;
        text: string;
        createdAt: string;
    }[]>([]);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const handleConnect = () => {
            console.log('Connected to server:', socket.id);
            socket.emit('join', username);
        };

        const handleConnectError = (error: Error) => {
            console.log('Socket connection error:', error.message);
        };

        const handleReceiveMessage = (newMessage: {
            id: string;
            username: string;
            text: string;
            createdAt: string;
        }) => {
            setMessages(prev => [...prev, newMessage]);
        };
        socket.on('connect', handleConnect);
        socket.on('connect_error', handleConnectError);
        socket.on('receiveMessage', handleReceiveMessage);

        if (!socket.connected) {
            socket.connect();
        } else {
            handleConnect();
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('connect_error', handleConnectError);
            socket.off('receiveMessage', handleReceiveMessage);
            socket.disconnect();
        };
    }, [username]);


    const handleSendMessage = () => {
        if (message.trim() === '') {
            return;
        }

        if (!socket.connected) {
            console.log('Not connected to server');
            return;
        }

        socket.emit('sendMessage', message.trim());
        setMessage('');
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);

        if (isNaN(date.getTime())) return '';

        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Appbar.Header style={{ height: 80 }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />

                <Text style={styles.headTitle}>Group CSE 434</Text>
            </Appbar.Header>
            <FlatList
                ref={flatListRef}
                style={styles.chatContainer}
                contentContainerStyle={{
                    paddingTop: 10,
                    paddingBottom: 60,
                }}
                data={messages}
                keyExtractor={item => item.id}
                onContentSizeChange={() => {
                    requestAnimationFrame(() => {
                        flatListRef.current?.scrollToEnd({ animated: false });
                    });
                }}
                onLayout={() => {
                    requestAnimationFrame(() => {
                        flatListRef.current?.scrollToEnd({ animated: false });
                    });
                }}
                renderItem={({ item, index }) => {
                    const isMyMessage = item.username === username;

                    const prevMessage = messages[index - 1];
                    const nextMessage = messages[index + 1];

                    const isFirstMessageOfGroup =
                        !prevMessage || prevMessage.username !== item.username;

                    const isLastMessageOfGroup =
                        !nextMessage || nextMessage.username !== item.username;

                    return (
                        <View
                            style={[
                                styles.messageRow,
                                isMyMessage ? styles.myRow : styles.otherRow,
                            ]}
                        >
                            {!isMyMessage && (
                                isFirstMessageOfGroup ? (
                                    <Image
                                        source={{
                                            uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username)}&background=random&color=fff&size=128`,
                                        }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={styles.avatarPlaceholder} />
                                )
                            )}

                            <View style={styles.messageContent}>
                                {!isMyMessage && isFirstMessageOfGroup && (
                                    <Text style={styles.senderName}>
                                        {item.username}
                                    </Text>
                                )}

                                <View
                                    style={[
                                        styles.messageBubble,
                                        isMyMessage ? styles.myMessage : styles.otherMessage,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.messageText,
                                            isMyMessage && { color: '#FFFFFF' },
                                        ]}
                                    >
                                        {item.text}
                                    </Text>
                                </View>

                                {isLastMessageOfGroup && (
                                    <Text
                                        style={[
                                            styles.timeText,
                                            isMyMessage ? styles.myTime : styles.otherTime,
                                        ]}
                                    >
                                        {formatTime(item.createdAt)}
                                    </Text>
                                )}
                            </View>
                        </View>
                    );
                }}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.messageInput}
                    placeholder="Type a message..."
                    value={message}
                    onChangeText={setMessage}
                />
                <IconButton
                    icon="send"
                    mode="contained"
                    containerColor="#20A091"
                    iconColor="#FFFFFF"
                    size={25}
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                    }}
                    onPress={handleSendMessage}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'

    },
    headTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    chatContainer: {
        flex: 1,
        paddingLeft: 20,
        paddingRight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        gap: 10,
        backgroundColor: '#FFFFFF',
        elevation: 4,
        paddingLeft: 20,
        paddingRight: 20,
    },
    messageInput: {
        flex: 1,
        backgroundColor: '#F2F6F7',
        borderRadius: 20,
        paddingHorizontal: 15,
    },

    sendText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 3,
        paddingHorizontal: 12,
    },

    myRow: {
        justifyContent: 'flex-end',
    },

    otherRow: {
        justifyContent: 'flex-start',
    },

    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 8,
    },

    messageContent: {
        maxWidth: '80%',
        alignItems: 'flex-start',
    },

    messageBubble: {
        padding: 12,
        borderRadius: 15,
    },

    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#2FA79B',
        borderTopRightRadius: 0,
    },

    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#F2F7FB',
        borderTopLeftRadius: 0,
    },

    senderName: {
        fontWeight: '600',
        color: '#222',
        marginBottom: 4,
        marginLeft: 4,
    },

    messageText: {
        fontSize: 15,
        color: '#222222',
    },

    timeText: {
        fontSize: 11,
        color: '#A2A2A2',
        marginTop: 5,
    },

    myTime: {
        alignSelf: 'flex-end',
    },

    otherTime: {
        alignSelf: 'flex-start',
    },
    avatarPlaceholder: {
        width: 36,
        marginRight: 8,
    },
});

export default GroupScreen;
