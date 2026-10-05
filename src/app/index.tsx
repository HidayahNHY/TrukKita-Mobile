import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

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
    icon: '🚚',
  },
  {
    id: 4,
    name: 'Tronton',
    capacity: '± 15 Ton',
    price: 900000,
    icon: '🚛',
  },
];

function formatRupiah(price: number): string {
  return `Rp${price.toLocaleString('id-ID')}`;
}

export default function HomeScreen() {
  function handleOrder() {
    console.log('Tombol Pesan Truk ditekan');
  }

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🚚 TrukKita</Text>
          <Text style={styles.subtitle}>
            Jasa Sewa Truk
          </Text>
        </View>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            Maluku Tenggara
          </Text>
        </View>
      </View>

      {/* HERO */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🚛</Text>

        <Text style={styles.heroTitle}>
          Solusi Sewa Truk
        </Text>

        <Text style={styles.heroTitle}>
          untuk Kebutuhan Anda
        </Text>

        <Text style={styles.heroDescription}>
          TrukKita menyediakan layanan sewa truk
          untuk mengangkut pasir, semen, batu,
          tanah, dan berbagai material lainnya.
        </Text>

        <Pressable
          onPress={handleOrder}
          style={{
            backgroundColor: '#dc2626',
            paddingVertical: 15,
            paddingHorizontal: 28,
            borderRadius: 10,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Pesan Truk Sekarang
          </Text>
        </Pressable>
      </View>

      {/* DAFTAR TRUK */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Pilihan Truk
        </Text>

        <Text style={styles.sectionDescription}>
          Pilih jenis truk sesuai kebutuhan muatan Anda.
        </Text>

        {trucks.map((truck) => (
          <View key={truck.id} style={styles.truckCard}>
            <Text style={styles.truckIcon}>
              {truck.icon}
            </Text>

            <View style={styles.truckInfo}>
              <Text style={styles.truckName}>
                {truck.name}
              </Text>

              <Text style={styles.truckCapacity}>
                Kapasitas {truck.capacity}
              </Text>

              <Text style={styles.truckPrice}>
                Mulai dari {formatRupiah(truck.price)}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                console.log(`Memilih ${truck.name}`)
              }
              style={styles.chooseButton}
            >
              <Text style={styles.chooseButtonText}>
                Pilih
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      {/* INFORMASI */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>
          Kenapa TrukKita?
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📍</Text>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>
              Area Pelayanan
            </Text>

            <Text style={styles.infoDescription}>
              Melayani kebutuhan pengangkutan
              material di wilayah Kei dan
              Kabupaten Maluku Tenggara.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📦</Text>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>
              Berbagai Jenis Material
            </Text>

            <Text style={styles.infoDescription}>
              Pasir, semen, batu, tanah,
              dan berbagai material lainnya.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>⚡</Text>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>
              Pemesanan Mudah
            </Text>

            <Text style={styles.infoDescription}>
              Pilih jenis truk dan lakukan
              pemesanan dengan mudah.
            </Text>
          </View>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerLogo}>
          🚚 TrukKita
        </Text>

        <Text style={styles.footerText}>
          Jasa Sewa Truk - Kei, Maluku Tenggara
        </Text>

        <Text style={styles.footerCopyright}>
          © 2026 TrukKita
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  logo: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#dc2626',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748b',
  },

  headerBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  headerBadgeText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: 'bold',
  },

  hero: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 25,
    paddingVertical: 45,
    alignItems: 'center',
  },

  heroIcon: {
    fontSize: 65,
    marginBottom: 15,
  },

  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  heroDescription: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 15,
    maxWidth: 360,
  },

  section: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 5,
    marginBottom: 18,
  },

  truckCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  truckIcon: {
    fontSize: 42,
    marginRight: 14,
  },

  truckInfo: {
    flex: 1,
  },

  truckName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  truckCapacity: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 3,
  },

  truckPrice: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: 'bold',
    marginTop: 5,
  },

  chooseButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 8,
  },

  chooseButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  infoSection: {
    padding: 20,
    backgroundColor: '#f1f5f9',
  },

  infoCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    flexDirection: 'row',
  },

  infoIcon: {
    fontSize: 28,
    marginRight: 14,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  infoDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748b',
    marginTop: 4,
  },

  footer: {
    backgroundColor: '#0f172a',
    padding: 30,
    alignItems: 'center',
  },

  footerLogo: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: 'bold',
  },

  footerText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },

  footerCopyright: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 15,
  },
});