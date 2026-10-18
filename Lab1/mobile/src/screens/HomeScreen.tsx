import { useState } from 'react';
import { Text, StyleSheet, View, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
    const [name, setName] = useState('');
    const handleStartChat = async () => {
        const username = name.trim();

        console.log('Button clicked:', username);

        if (username === '') {
            return;
        }

        try {
            console.log('Start saving username');

            await AsyncStorage.setItem('username', username);

            console.log('Save successful');

            navigation.navigate('Group', {
                username: username,
            });

        } catch (error) {
            console.log('AsyncStorage Error:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.title}>
                <Text style={styles.big}>Your Name</Text>
                <Text style={styles.small}>Please enter your name to start a new chat</Text>
            </View>
            <View>
                <Text style={styles.smallTitle}>Your name</Text>
                <TextInput
                    style={styles.inputName}
                    onChangeText={setName}
                    value={name}
                    placeholder="Enter your name"
                    underlineColorAndroid="transparent"
                />
            </View>
            <View style={styles.but}>
                <Pressable style={styles.button} onPress={handleStartChat}>
                    <Text style={styles.buttonText}>Start Chat</Text>
                </Pressable>
            </View>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    title: {
        alignItems: 'center',
        flexDirection: 'column',
        gap: 20,
        marginTop: 100,

    },
    big: {
        fontSize: 20,
        fontWeight: '500',

    },
    small: {
        color: '#9A9A9A',
        marginBottom: 100,
    },
    smallTitle: {
        marginLeft: 60,
        color: '#3E766E',
        marginBottom: 5,

    },
    inputName: {
        marginLeft: 57,
        width: '73%',
        borderBottomWidth: 1,
        borderBottomColor: '#9A9A9A',
        paddingVertical: 8,
    },
    button: {
        marginTop: 40,
        backgroundColor: '#3E766E',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: 302,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
    },
    but: {
        alignItems: 'center',
    },
});

export default HomeScreen;