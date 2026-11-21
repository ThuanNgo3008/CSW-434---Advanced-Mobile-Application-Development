import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    BackHandler,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';

import NativeCompass, { type CompassData } from './specs/NativeCompass';


type CompassScreenProps = {
    onBack?: () => void;
};

const BACKGROUND = '#F5F8FD';
const TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

function normalizeDegrees(value: number): number {
    return ((value % 360) + 360) % 360;
}

function directionFor(degrees: number): string {
    const names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return names[Math.round(normalizeDegrees(degrees) / 45) % 8];
}

function makeStyles(scale: number, screenHeight: number) {
    // Sizes are based on a ~390dp-wide phone and scale down on smaller devices.
    const s = (number: number) => number * scale;
    const ring = s(448);
    const dial = s(300);
    const groove = s(204);
    const center = s(120);
    const ball = s(20);
    const orbitRadius = s(74);
    const armWidth = s(42);
    const armHeight = orbitRadius * 2 + ball;
    const topPadding = Platform.OS === 'android' ? s(12) : s(46);
    const headerHeight = s(54);
    // Visually position the compass center near 48% of the screen height.
    const stageMarginTop = Math.max(
        s(18),
        screenHeight * 0.48 - (topPadding + headerHeight + ring / 2),
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            backgroundColor: BACKGROUND,
            paddingTop: topPadding,
            overflow: 'hidden',
        },
        header: {
            height: headerHeight,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        title: {
            color: '#272C34',
            fontSize: s(18),
            fontWeight: '700',
        },
        backTab: {
            position: 'absolute',
            left: 0,
            top: s(2),
            width: s(41),
            height: s(51),
            borderTopRightRadius: s(27),
            borderBottomRightRadius: s(27),
            backgroundColor: '#2F353C',
            alignItems: 'center',
            justifyContent: 'center',
            paddingRight: s(5),
        },
        backIcon: {
            fontSize: s(33),
            fontWeight: '300',
            lineHeight: s(37),
            color: '#FFFFFF',
            marginTop: -s(2),
        },
        stage: {
            width: ring,
            height: ring,
            marginTop: stageMarginTop,
            alignItems: 'center',
            justifyContent: 'center',
        },
        ambientGlow: {
            position: 'absolute',
            width: ring - s(16),
            height: ring - s(16),
            borderRadius: ring / 2,
            borderWidth: s(14),
            borderColor: 'rgba(255,255,255,0.24)',
        },
        ambientRing: {
            position: 'absolute',
            width: ring,
            height: ring,
            borderRadius: ring / 2,
            borderWidth: s(3),
            borderTopColor: '#FFFFFF',
            borderRightColor: '#ECF3FD',
            borderBottomColor: '#DEEAFC',
            borderLeftColor: '#F8FBFF',
        },
        // The subtle shadow/halo under the white dial is essential to the reference.
        dialHalo: {
            position: 'absolute',
            width: dial + s(38),
            height: dial + s(38),
            borderRadius: (dial + s(38)) / 2,
            backgroundColor: 'rgba(225,236,255,0.18)',
        },
        dial: {
            width: dial,
            height: dial,
            borderRadius: dial / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F8FBFF',
            borderWidth: s(1),
            borderColor: '#F6FAFF',
            shadowColor: '#7A9AC8',
            shadowOffset: { width: 0, height: s(12) },
            shadowOpacity: 0.18,
            shadowRadius: s(23),
            elevation: 8,
        },
        tickArm: {
            position: 'absolute',
            left: (dial - armWidth) / 2,
            top: 0,
            width: armWidth,
            height: dial,
            alignItems: 'center',
        },
        tickBase: {
            marginTop: s(12),
            borderRadius: s(2),
        },
        northTick: {
            height: s(14),
            width: s(2.5),
            backgroundColor: '#EF4947',
        },
        cardinalTick: {
            height: s(13),
            width: s(2.5),
            backgroundColor: '#EF8568',
        },
        majorTick: {
            height: s(10),
            width: s(1.6),
            backgroundColor: '#96A8BF',
        },
        minorTick: {
            height: s(6),
            width: s(1.3),
            backgroundColor: '#C7D4E5',
        },
        degreeLabel: {
            marginTop: s(3),
            color: '#8191A6',
            fontSize: s(10),
            fontWeight: '600',
            includeFontPadding: false,
            textAlign: 'center',
        },
        cardinal: {
            position: 'absolute',
            color: '#59677B',
            fontSize: s(17),
            fontWeight: '700',
            textAlign: 'center',
            includeFontPadding: false,
            zIndex: 3,
        },
        north: {
            top: (ring - dial) / 2 - s(17),
            color: '#E84646',
            fontSize: s(19),
            fontWeight: '800',
        },
        south: { bottom: (ring - dial) / 2 - s(18) },
        east: { right: (ring - dial) / 2 - s(20) },
        west: { left: (ring - dial) / 2 - s(20) },
        // Two layered pale-blue tracks mimic the recessed ring in the reference.
        grooveOuter: {
            position: 'absolute',
            width: groove,
            height: groove,
            borderRadius: groove / 2,
            backgroundColor: '#E6EFFB',
            borderWidth: s(6),
            borderColor: '#EFF5FD',
            shadowColor: '#7EA5DA',
            shadowOffset: { width: 0, height: s(2) },
            shadowOpacity: 0.20,
            shadowRadius: s(10),
            elevation: 2,
        },
        grooveInner: {
            position: 'absolute',
            width: groove - s(28),
            height: groove - s(28),
            borderRadius: groove / 2,
            borderWidth: s(5),
            borderColor: 'rgba(255,255,255,0.54)',
            backgroundColor: '#ECF3FD',
        },
        ballArm: {
            position: 'absolute',
            height: armHeight,
            width: ball,
            top: (dial - armHeight) / 2,
            left: (dial - ball) / 2,
            alignItems: 'center',
            zIndex: 4,
        },
        orangeBall: {
            height: ball,
            width: ball,
            borderRadius: ball / 2,
            backgroundColor: '#FF781C',
            borderWidth: s(2),
            borderColor: '#FFAA61',
            shadowColor: '#FF6F12',
            shadowOffset: { width: 0, height: s(2) },
            shadowOpacity: 0.6,
            shadowRadius: s(5),
            elevation: 6,
        },
        centerHalo: {
            position: 'absolute',
            width: center + s(15),
            height: center + s(15),
            borderRadius: (center + s(15)) / 2,
            backgroundColor: '#DCEAFB',
            borderWidth: s(4),
            borderColor: '#EDF5FE',
            elevation: 3,
        },
        centerDisc: {
            position: 'absolute',
            width: center,
            height: center,
            borderRadius: center / 2,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 5,
            borderWidth: s(1),
            borderColor: '#FAFCFF',
            shadowColor: '#86A9DA',
            shadowOffset: { width: 0, height: s(5) },
            shadowOpacity: 0.19,
            shadowRadius: s(13),
            elevation: 7,
        },
        number: {
            color: '#36414F',
            fontSize: s(34),
            fontWeight: '800',
            letterSpacing: -s(0.8),
            includeFontPadding: false,
            lineHeight: s(40),
        },
        direction: {
            color: '#748395',
            fontSize: s(13),
            fontWeight: '700',
            letterSpacing: s(0.45),
            includeFontPadding: false,
            marginTop: s(1),
        },
        debugPanel: {
            marginTop: s(8),
            backgroundColor: '#FFFFFF',
            borderRadius: s(14),
            paddingHorizontal: s(24),
            paddingVertical: s(13),
            alignItems: 'center',
            maxWidth: '90%',
            elevation: 2,
        },
        debugText: {
            color: '#52647C',
            fontSize: s(12),
            marginVertical: s(2),
        },
    });

    return styles;
}

export default function CompassScreen({ onBack }: CompassScreenProps) {
    const { width, height } = useWindowDimensions();
    const scale = Math.min(width / 390, 1.08);
    const styles = useMemo(() => makeStyles(scale, height), [scale, height]);

    // The reference uses 260° as its preview; real sensor data replaces it.
    const [heading, setHeading] = useState<number>(260);
    const [hasReading, setHasReading] = useState(false);
    const [status, setStatus] = useState('Đang kiểm tra cảm biến...');
    const [sensor, setSensor] = useState<CompassData | null>(null);
    const [showDebug, setShowDebug] = useState(false);

    const rotation = useRef(new Animated.Value(260)).current;
    const lastHeading = useRef(260);
    const continuousRotation = useRef(260);

    const ballRotation = rotation.interpolate({
        inputRange: [-360, 0, 360],
        outputRange: ['-360deg', '0deg', '360deg'],
        extrapolate: 'extend',
    });

    useEffect(() => {
        const subscription = NativeCompass.onCompassChanged((data: CompassData) => {
            if (!Number.isFinite(data.heading)) return;
            const nextHeading = normalizeDegrees(data.heading);
            const delta = ((nextHeading - lastHeading.current + 540) % 360) - 180;
            continuousRotation.current += delta;
            lastHeading.current = nextHeading;
            setHeading(nextHeading);
            setSensor(data);
            setHasReading(true);
            Animated.timing(rotation, {
                toValue: continuousRotation.current,
                duration: 125,
                useNativeDriver: true,
            }).start();
        });

        const availability = NativeCompass.getCompassStatus();
        if (availability === 'READY') {
            setStatus('Cảm biến đã sẵn sàng');
            NativeCompass.startListening();
        } else {
            setStatus('Thiết bị không hỗ trợ cảm biến la bàn');
        }

        return () => {
            subscription.remove();
            NativeCompass.stopListening();
            rotation.stopAnimation();
        };
    }, [rotation]);

    // Screenshot preview: 260° / NE. These labels are only a visual mockup
    // until an actual sensor event arrives (260° is really W, not NE).
    const displayValue = `${Math.round(heading)}°`;
    const displayDirection = hasReading ? directionFor(heading) : 'NE';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <Pressable
                    style={styles.backTab}
                    accessibilityRole="button"
                    accessibilityLabel="Quay lại"
                    onPress={onBack ?? (() => BackHandler.exitApp())}>
                    <Text style={styles.backIcon}>‹</Text>
                </Pressable>
                <Pressable onPress={() => setShowDebug(value => !value)}>
                    <Text style={styles.title}>Compass</Text>
                </Pressable>
            </View>

            <View style={styles.stage}>
                <View pointerEvents="none" style={styles.ambientGlow} />
                <View pointerEvents="none" style={styles.ambientRing} />
                <View pointerEvents="none" style={styles.dialHalo} />

                <Text style={[styles.cardinal, styles.north]}>N</Text>
                <Text style={[styles.cardinal, styles.south]}>S</Text>
                <Text style={[styles.cardinal, styles.east]}>E</Text>
                <Text style={[styles.cardinal, styles.west]}>W</Text>

                <View style={styles.dial}>
                    {TICKS.map(deg => {
                        const isCardinal = deg % 90 === 0;
                        const isMajor = deg % 30 === 0;
                        return (
                            <View
                                key={deg}
                                pointerEvents="none"
                                style={[styles.tickArm, { transform: [{ rotate: `${deg}deg` }] }]}>
                                <View
                                    style={[
                                        styles.tickBase,
                                        isCardinal
                                            ? deg === 0
                                                ? styles.northTick
                                                : styles.cardinalTick
                                            : isMajor
                                                ? styles.majorTick
                                                : styles.minorTick,
                                    ]}
                                />
                                {isMajor && <Text
                                    style={[
                                        styles.degreeLabel,
                                        isCardinal && {
                                            fontWeight: '900',
                                            fontSize: 12,
                                            color: '#334155',
                                        },
                                    ]}>
                                    {deg}°
                                </Text>}
                            </View>
                        );
                    })}

                    <View pointerEvents="none" style={styles.grooveOuter} />
                    <View pointerEvents="none" style={styles.grooveInner} />

                    <Animated.View
                        pointerEvents="none"
                        style={[styles.ballArm, { transform: [{ rotate: ballRotation }] }]}>
                        <View style={styles.orangeBall} />
                    </Animated.View>

                    <View pointerEvents="none" style={styles.centerHalo} />
                    <View pointerEvents="none" style={styles.centerDisc}>
                        <Text style={styles.number}>{displayValue}</Text>
                        <Text style={styles.direction}>{displayDirection}</Text>
                    </View>
                </View>
            </View>

            {showDebug && (
                <View style={styles.debugPanel}>
                    <Text style={styles.debugText}>{status}</Text>
                    <Text style={styles.debugText}>
                        {hasReading ? 'Dữ liệu cảm biến trực tiếp' : '260° là góc minh họa ban đầu'}
                    </Text>
                    {sensor && (
                        <>
                            <Text style={styles.debugText}>X: {sensor.x.toFixed(2)} µT</Text>
                            <Text style={styles.debugText}>Y: {sensor.y.toFixed(2)} µT</Text>
                            <Text style={styles.debugText}>Z: {sensor.z.toFixed(2)} µT</Text>
                        </>
                    )}
                </View>
            )}
        </View>
    );
}
