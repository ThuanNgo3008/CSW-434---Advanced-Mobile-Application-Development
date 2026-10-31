import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  NativeModules,
  Pressable,
} from 'react-native';
import BatteryScreen from './src/screens/BatteryScreen';
import BrightnessScreen from './src/screens/BrightnessScreen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { BatteryModule, BrightnessModule } = NativeModules;

function App() {
  const [battery, setBattery] = useState<number | null>(null);
  const [brightness, setBrightness] = useState(0.5);
  const [error, setError] = useState('');
  const [activeScreen, setActiveScreen] = useState<'battery' | 'brightness'>('battery');

  useEffect(() => {
    const loadBattery = async () => {
      try {
        const level = await BatteryModule.getBatteryLevel();
        setBattery(level);
      } catch (err) {
        console.error(err);
        setError('Cannot read battery level');
      }
    };

    loadBattery();
  }, []);

  const handleBrightnessChange = (value: number) => {
    setBrightness(value);

    if (!BrightnessModule) {
      setError('BrightnessModule not found');
      return;
    }

    BrightnessModule.setBrightness(value).catch((err: unknown) => {
      console.error(err);
      setError('Cannot change brightness');
    });
  };


  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app}>
        <View style={styles.screenContainer}>
          {activeScreen === 'battery' ? (
            <BatteryScreen battery={battery} />
          ) : (
            <BrightnessScreen
              brightness={brightness}
              onBrightnessChange={handleBrightnessChange}
            />
          )}
        </View>

        <View style={styles.tabBar}>
          <Pressable
            style={styles.tabButton}
            onPress={() => setActiveScreen('brightness')}>
            <Text
              style={[
                styles.tabText,
                activeScreen === 'brightness' && styles.activeTab,
              ]}>
              Brightness
            </Text>
          </Pressable>

          <Pressable
            style={styles.tabButton}
            onPress={() => setActiveScreen('battery')}>
            <Text
              style={[
                styles.tabText,
                activeScreen === 'battery' && styles.activeTab,
              ]}>
              Battery
            </Text>
          </Pressable>
        </View>

        {error !== '' && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );

}


const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#fff',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  activeTab: {
    color: '#2d9dd1',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});


export default App;
