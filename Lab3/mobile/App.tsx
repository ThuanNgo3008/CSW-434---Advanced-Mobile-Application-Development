import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native';

import NfcScreen from './NfcScreen';
import CompassScreen from './CompassScreen';

export default function App() {
    const [screen, setScreen] = useState<'nfc' | 'compass'>(
        'compass',
    );

    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                <Pressable
                    style={styles.button}
                    onPress={() => setScreen('nfc')}>
                    <Text style={styles.buttonText}>NFC</Text>
                </Pressable>

                <Pressable
                    style={styles.button}
                    onPress={() => setScreen('compass')}>
                    <Text style={styles.buttonText}>Compass</Text>
                </Pressable>
            </View>

            {screen === 'nfc' ? (
                <NfcScreen />
            ) : (
                <CompassScreen />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabs: {
        flexDirection: 'row',
        padding: 12,
        paddingTop: 35,
        backgroundColor: '#152541',
    },
    button: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
