import { Octicons } from '@react-native-vector-icons/octicons/static';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Circle, Path } from 'react-native-svg';
type Props = {
    brightness: number;
    onBrightnessChange: (value: number) => void;
};

const BrightnessScreen = ({
    brightness,
    onBrightnessChange,
}: Props) => {
    const percent = Math.round(brightness * 100);

    return (
        <View style={styles.container}>
            <View style={styles.indicatorCard}>
                <View style={styles.sunContainer}>
                    <View style={styles.sunContainer}>
                        <Svg width={150} height={150} viewBox="0 0 160 160">
                            <Circle
                                cx={80}
                                cy={80}
                                r={50}
                                stroke="#7B7B7B"
                                strokeWidth={3.5}
                                fill="none"
                            />

                            <Path
                                d="
                                M80 4 V14
                                M80 146 V156
                                M4 80 H14
                                M146 80 H156
                                M22 22 L30 30
                                M130 130 L138 138
                                M22 138 L30 130
                                M130 30 L138 22     
                            "
                                stroke="#7B7B7B"
                                strokeWidth={3}
                                strokeLinecap="round"
                            />
                        </Svg>

                        <View style={styles.percentOverlay}>
                            <Text style={styles.percent}>{percent}%</Text>
                        </View>
                    </View>

                    <View style={styles.percentOverlay}>
                        <Text style={styles.percent}>{percent}%</Text>
                    </View>
                </View>
            </View>

            <View style={styles.sliderCard}>
                <Text style={styles.title}>Brightness</Text>

                <View style={styles.sliderRow}>
                    <Octicons name="sun" size={22} color="#999999" />

                    <View style={styles.sliderWrapper}>
                        <View style={styles.customTrack} pointerEvents="none">
                            <View style={styles.blueTrack} />
                            <View style={styles.pinkTrack} />
                        </View>

                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={1}
                            value={brightness}
                            onValueChange={onBrightnessChange}
                            minimumTrackTintColor="transparent"
                            maximumTrackTintColor="transparent"
                            thumbTintColor="#1F74EF"
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F1F7',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    indicatorCard: {
        width: '90%',
        height: 260,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    sunContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    percentOverlay: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
    },

    percent: {
        fontSize: 20,
        color: '#7B7B7B',
    },
    sun: {
        fontSize: 28,
        color: '#777777',
    },
    sliderCard: {
        width: '90%',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
    },
    title: {
        fontSize: 18,
        color: '#555555',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 24,
        color: '#999999',
    },

    sliderWrapper: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        marginLeft: 10,
    },

    customTrack: {
        position: 'absolute',
        left: 15,
        right: 15,
        height: 3,
        flexDirection: 'row',
    },

    blueTrack: {
        width: '80%',
        backgroundColor: '#BCD4F4',
        borderTopLeftRadius: 3,
        borderBottomLeftRadius: 3,
    },

    pinkTrack: {
        width: '20%',
        backgroundColor: '#F5BFC5',
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
    },

    slider: {
        width: '100%',
        height: 40,
    },
});

export default BrightnessScreen;
