import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface AccountDeletionScreenProps {
  onBack: () => void;
  onConfirmDeletion: (feedback: DeletionFeedback) => void;
}

interface DeletionFeedback {
  reason: string;
  improvements: string;
  additionalComments: string;
}

export default function AccountDeletionScreen({ onBack, onConfirmDeletion }: AccountDeletionScreenProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [improvements, setImprovements] = useState<string>('');
  const [additionalComments, setAdditionalComments] = useState<string>('');

  const deletionReasons = [
    'Found a better platform',
    'Too many bugs or technical issues',
    'Not finding suitable matches',
    'Privacy concerns',
    'Too expensive',
    'Poor user experience',
    'Lack of features I need',
    'Customer service issues',
    'Other',
  ];

  const handleConfirmDeletion = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for deletion');
      return;
    }

    Alert.alert(
      'Confirm Account Deletion',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            onConfirmDeletion({
              reason: selectedReason,
              improvements,
              additionalComments,
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warningBox}>
          <MaterialIcons name="warning" size={48} color="#F44336" />
          <Text style={styles.warningTitle}>Account Deletion</Text>
          <Text style={styles.warningText}>
            We're sorry to see you go! Before you delete your account, please help us improve by sharing your feedback.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why are you leaving? *</Text>
          <View style={styles.reasonsContainer}>
            {deletionReasons.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonButton,
                  selectedReason === reason && styles.reasonButtonSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <View style={[
                  styles.radioButton,
                  selectedReason === reason && styles.radioButtonSelected,
                ]}>
                  {selectedReason === reason && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason && styles.reasonTextSelected,
                ]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What could we improve? (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={improvements}
            onChangeText={setImprovements}
            placeholder="Tell us what features or improvements would make you stay..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional comments (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={additionalComments}
            onChangeText={setAdditionalComments}
            placeholder="Any other feedback you'd like to share..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.deleteButton, !selectedReason && styles.deleteButtonDisabled]} 
            onPress={handleConfirmDeletion}
            disabled={!selectedReason}
          >
            <MaterialIcons name="delete-forever" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  warningBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reasonsContainer: {
    gap: 8,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reasonButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E8F9F7',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#2196F3',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  reasonTextSelected: {
    color: '#2196F3',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
    color: '#333',
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F44336',
    gap: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: '#CCC',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

