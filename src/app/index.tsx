import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from './_layout';

type Truck = {
  id: number;
  name: string;
  capacity: string;
  price: number;
  icon: string;
};

const trucks: Truck[] = [
  {
    id: 1,
    name: 'Pickup',
    capacity: '± 1 Ton',
    price: 200000,
    icon: '🚚',
  },
  {
    id: 2,
    name: 'Colt Diesel',
    capacity: '± 4 Ton',
    price: 350000,
    icon: '🚛',
  },
  {
    id: 3,
    name: 'Fuso',
    capacity: '± 8 Ton',
    price: 600000,
    icon: '🚛',
  },
  {
    id: 4,
    name: 'Tronton',
    capacity: '± 15 Ton',
    price: 900000,
    icon: '🚚',
  },
];

export default function HomeScreen() {
  const { themeMode } = useAppTheme();
  const isDark = themeMode === 'dark';

  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [statusPilihan, setStatusPilihan] = useState(
    'Pilih truk yang sesuai dengan kebutuhan Anda.',
  );

  useEffect(() => {
    if (selectedTruck) {
      setStatusPilihan(
        `${selectedTruck.name} dipilih. Silakan lanjutkan ke detail pesanan.`,
      );
    }
  }, [selectedTruck]);

  const colors = {
    background: isDark ? '#121212' : '#F5F7FA',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#222222',
    secondaryText: isDark ? '#BBBBBB' : '#666666',
    primary: '#C62828',
    border: isDark ? '#383838' : '#E5E7EB',
    soft: isDark ? '#2A2020' : '#FCE8E8',
  };

  const formatRupiah = (nominal: number) =>
    `Rp${nominal.toLocaleString('id-ID')}`;

  const bukaDetail = (truck: Truck) => {
    setSelectedTruck(truck);

    router.push({
      pathname: '/detail',
      params: {
        name: truck.name,
        capacity: truck.capacity,
        price: String(truck.price),
      },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <Text style={styles.logo}>🚚 TrukKita</Text>

        <Text style={styles.heroTitle}>
          Solusi Sewa Truk untuk Kebutuhan Material Anda
        </Text>

        <Text style={styles.heroDescription}>
          Pilih kendaraan yang sesuai untuk mengangkut pasir, semen, batu,
          tanah, dan berbagai material lainnya.
        </Text>

        <Pressable
          style={styles.heroButton}
          onPress={() => bukaDetail(trucks[0])}
        >
          <Text style={styles.heroButtonText}>Pesan Sekarang</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Pilihan Armada
        </Text>

        <Text style={[styles.sectionDescription, { color: colors.secondaryText }]}>
          Pilih jenis truk sesuai kapasitas muatan.
        </Text>

        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.soft,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.statusTitle, { color: colors.primary }]}>
            Status Pilihan
          </Text>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {statusPilihan}
          </Text>
        </View>

        {trucks.map((truck) => (
          <View
            key={truck.id}
            style={[
              styles.truckCard,
              {
                backgroundColor: colors.surface,
                borderColor:
                  selectedTruck?.id === truck.id
                    ? colors.primary
                    : colors.border,
              },
            ]}
          >
            <View style={styles.truckHeader}>
              <View
                style={[
                  styles.truckIconContainer,
                  { backgroundColor: colors.soft },
                ]}
              >
                <Text style={styles.truckIcon}>{truck.icon}</Text>
              </View>

              <View style={styles.truckInfo}>
                <Text style={[styles.truckName, { color: colors.text }]}>
                  {truck.name}
                </Text>

                <Text
                  style={[
                    styles.truckCapacity,
                    { color: colors.secondaryText },
                  ]}
                >
                  Kapasitas {truck.capacity}
                </Text>
              </View>
            </View>

            <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

            <View style={styles.truckFooter}>
              <View>
                <Text
                  style={[
                    styles.priceLabel,
                    { color: colors.secondaryText },
                  ]}
                >
                  Harga per pesanan
                </Text>

                <Text style={[styles.truckPrice, { color: colors.primary }]}>
                  {formatRupiah(truck.price)}
                </Text>
              </View>

              <Pressable
                style={styles.chooseButton}
                onPress={() => bukaDetail(truck)}
              >
                <Text style={styles.chooseButtonText}>Pilih</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Pressable
          style={[
            styles.historyButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.push('/riwayat')}
        >
          <Text style={[styles.historyButtonText, { color: colors.text }]}>
            📋  Lihat Riwayat Pesanan
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerTitle, { color: colors.text }]}>
          TrukKita
        </Text>
        <Text style={[styles.footerText, { color: colors.secondaryText }]}>
          Solusi transportasi material yang praktis dan mudah.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 12,
  },
  heroDescription: {
    color: '#FDECEC',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 22,
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  heroButtonText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  statusCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 13,
    lineHeight: 20,
  },
  truckCard: {
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 14,
  },
  truckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  truckIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  truckIcon: {
    fontSize: 30,
  },
  truckInfo: {
    flex: 1,
  },
  truckName: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  truckCapacity: {
    fontSize: 13,
  },
  cardDivider: {
    height: 1,
    marginVertical: 15,
  },
  truckFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  truckPrice: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  chooseButton: {
    backgroundColor: '#C62828',
    paddingVertical: 11,
    paddingHorizontal: 23,
    borderRadius: 9,
  },
  chooseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 5,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 28,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
  },
});