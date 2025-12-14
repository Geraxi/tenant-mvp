import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';

interface ManageEmailScreenProps {
  onNavigateBack: () => void;
}

export default function ManageEmailScreen({ onNavigateBack }: ManageEmailScreenProps) {
  const { user, updateEmail } = useSupabaseAuth();
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [confirmEmail, setConfirmEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleVerifyEmail = () => {
    const targetEmail = (newEmail || user?.email || '').trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      Alert.alert('Info', 'Aggiorna prima il tuo indirizzo email.');
      return;
    }

    Alert.alert(
      'Verifica Email',
      `Ti abbiamo inviato un link di verifica a ${targetEmail}. Controlla la tua casella di posta per completare il processo.`,
      [{ text: 'OK' }]
    );
  };

  const handleSave = async () => {
    if (!newEmail.trim() || !confirmEmail.trim()) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }

    if (newEmail.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      Alert.alert('Errore', 'Le email non coincidono');
      return;
    }

    try {
      setLoading(true);
      const result = await updateEmail(newEmail);
      if (result.success) {
        const formatted = newEmail.trim().toLowerCase();
        setNewEmail(formatted);
        setConfirmEmail(formatted);
        Alert.alert('Successo', 'Email aggiornata con successo', [
          { text: 'OK', onPress: onNavigateBack },
        ]);
      } else {
        Alert.alert('Errore', result.error || 'Impossibile aggiornare l\'email');
      }
    } catch (error) {
      console.error('Update email error:', error);
      Alert.alert('Errore', 'Si è verificato un errore inatteso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestisci Email</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Indirizzo attuale</Text>
          <Text style={styles.currentEmail}>{user?.email || '—'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nuovo indirizzo email</Text>
          <Text style={styles.sectionSubtitle}>
            Inserisci il nuovo indirizzo email che desideri utilizzare per il tuo account.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Nuova email</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="esempio@email.com"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Conferma nuova email</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={confirmEmail}
              onChangeText={setConfirmEmail}
              placeholder="Ripeti il nuovo indirizzo"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Salva Email</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Verifica email</Text>
          <Text style={styles.sectionSubtitle}>
            Conferma il tuo indirizzo email per proteggere l'accesso al tuo account e ricevere aggiornamenti importanti.
          </Text>

          <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyEmail}>
            <MaterialIcons name="verified" size={20} color="#fff" />
            <Text style={styles.verifyButtonText}>Verifica indirizzo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
  },
  currentEmail: {
    fontSize: 16,
    color: '#1f2937',
    marginTop: 12,
    fontWeight: '600',
  },
  field: {
    marginTop: 18,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 14,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
