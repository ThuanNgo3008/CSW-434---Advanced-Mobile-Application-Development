import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
    battery: number | null;
};

const BatteryScreen = ({ battery }: Props) => {
    const percent = Math.max(0, Math.min(100, battery ?? 0));

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Battery</Text>

                <View style={styles.battery}>
                    <View
                        style={[
                            styles.batteryFill,
                            { height: percent * 1.7 },
                        ]}
                    />

                    <View style={styles.batteryContent}>
                        <Text style={styles.number}>
                            {battery === null ? '...' : percent}
                        </Text>
                        <Text style={styles.percent}>%</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: 190,
        height: 330,
        backgroundColor: '#172824',
        borderRadius: 18,
        alignItems: 'center',
        paddingTop: 20,
        elevation: 8,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 35,
    },
    battery: {
        width: 115,
        height: 170,
        borderWidth: 1,
        borderColor: '#8CA59E',
        borderRadius: 18,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    batteryFill: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#00D9AE',
    },
    batteryContent: {
        alignItems: 'center',
    },
    number: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    percent: {
        fontSize: 18,
        color: '#FFFFFF',
    },
});

export default BatteryScreen;
