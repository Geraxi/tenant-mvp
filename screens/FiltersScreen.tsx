import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { User } from '../types';
import { t } from '../utils/translations';
import Slider from '../components/Slider';

interface FiltersScreenProps {
  currentUser: User;
  onBack: () => void;
  onApplyFilters: (filters: any) => void;
}

export default function FiltersScreen({ currentUser, onBack, onApplyFilters }: FiltersScreenProps) {
  const [maxDistance, setMaxDistance] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [availableNow, setAvailableNow] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [nearAirport, setNearAirport] = useState(false);

  const handleApplyFilters = () => {
    const filters = {
      maxDistance,
      verifiedOnly,
      availableNow,
      petFriendly,
      furnished,
      nearAirport,
    };
    onApplyFilters(filters);
    onBack();
  };

  const getFilterTitle = () => {
    if (currentUser.userType === 'tenant') {
      return 'Property Filters';
    } else if (currentUser.userType === 'homeowner') {
      return 'Tenant Filters';
    }
    return 'Search Filters';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getFilterTitle()}</Text>
        <TouchableOpacity onPress={handleApplyFilters}>
          <Text style={styles.applyButton}>Apply</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Maximum Distance</Text>
            <Slider
              label=""
              value={maxDistance}
              minValue={1}
              maxValue={100}
              step={5}
              unit="km"
              onValueChange={setMaxDistance}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification</Text>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="verified" size={24} color="#2196F3" />
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Verified Only</Text>
                <Text style={styles.switchDescription}>
                  Show only verified {currentUser.userType === 'tenant' ? 'properties' : 'tenants'}
                </Text>
              </View>
            </View>
            <Switch
              value={verifiedOnly}
              onValueChange={setVerifiedOnly}
              trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="schedule" size={24} color="#2196F3" />
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Available Now</Text>
                <Text style={styles.switchDescription}>
                  {currentUser.userType === 'tenant' 
                    ? 'Show only properties available immediately'
                    : 'Show only tenants looking now'
                  }
                </Text>
              </View>
            </View>
            <Switch
              value={availableNow}
              onValueChange={setAvailableNow}
              trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="pets" size={24} color="#2196F3" />
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Pet Friendly</Text>
                <Text style={styles.switchDescription}>
                  {currentUser.userType === 'tenant' 
                    ? 'Show only pet-friendly properties'
                    : 'Show only tenants with pets'
                  }
                </Text>
              </View>
            </View>
            <Switch
              value={petFriendly}
              onValueChange={setPetFriendly}
              trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="weekend" size={24} color="#2196F3" />
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Furnished</Text>
                <Text style={styles.switchDescription}>
                  {currentUser.userType === 'tenant' 
                    ? 'Show only furnished properties'
                    : 'Show only tenants looking for furnished'
                  }
                </Text>
              </View>
            </View>
            <Switch
              value={furnished}
              onValueChange={setFurnished}
              trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <MaterialIcons name="flight" size={24} color="#2196F3" />
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Near Airport</Text>
                <Text style={styles.switchDescription}>
                  {currentUser.userType === 'tenant' 
                    ? 'Show only properties near airport'
                    : 'Show only tenants who work at airport'
                  }
                </Text>
              </View>
            </View>
            <Switch
              value={nearAirport}
              onValueChange={setNearAirport}
              trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  applyButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sliderContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchContent: {
    marginLeft: 12,
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});

