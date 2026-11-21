import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';

import NativeNfc, {
  type NfcTagInfo,
} from './specs/NativeNfc';

function NfcScreen() {
  const [status, setStatus] = useState('Đang kiểm tra NFC...');
  const [tag, setTag] = useState<NfcTagInfo | null>(null);

  useEffect(() => {
    // Đăng ký listener khi màn hình khởi tạo
    const subscription = NativeNfc.onTagDiscovered(
      (data: NfcTagInfo) => {
        setTag(data);
        setStatus('Đọc thẻ thành công!');
      },
    );

    const nfcStatus = NativeNfc.getNfcStatus();

    if (nfcStatus === 'READY') {
      setStatus('Đưa thẻ NFC lại gần điện thoại');
      NativeNfc.startScanning();
    } else if (nfcStatus === 'DISABLED') {
      setStatus('Hãy bật NFC trong cài đặt điện thoại');
    } else {
      setStatus('Thiết bị không hỗ trợ NFC');
    }

    // Dọn dẹp khi màn hình bị hủy
    return () => {
      subscription.remove();
      NativeNfc.stopScanning();
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.title}>NFC Reader</Text>

      <Text style={styles.subtitle}>
        Lab 3 - Exercise 1
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Trạng thái</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      {tag && (
        <View style={styles.card}>
          <Text style={styles.heading}>
            Thông tin thẻ NFC
          </Text>

          <Text style={styles.label}>Tag ID</Text>
          <Text style={styles.value}>{tag.id}</Text>

          <Text style={styles.label}>Technologies</Text>
          <Text style={styles.value}>
            {tag.technologies}
          </Text>

          <Text style={styles.label}>NDEF Data</Text>
          <Text style={styles.value}>{tag.text}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#F3F6FB',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#152541',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#66748A',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#152541',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 10,
  },
  value: {
    fontSize: 17,
    color: '#152541',
    marginTop: 4,
  },
  status: {
    fontSize: 17,
    color: '#2563EB',
    marginTop: 8,
    fontWeight: '600',
  },
});

export default NfcScreen;
