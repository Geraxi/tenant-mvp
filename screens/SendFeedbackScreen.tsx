import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MailComposer from 'expo-mail-composer';
import { showPermissionDeniedAlert } from '../utils/permissionUtils';

interface SendFeedbackScreenProps {
  onBack: () => void;
}

export default function SendFeedbackScreen({ onBack }: SendFeedbackScreenProps) {
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { id: 'bug', title: 'Segnala Bug', icon: 'bug-report', color: '#F44336' },
    { id: 'feature', title: 'Richiedi Funzionalità', icon: 'lightbulb', color: '#FF9800' },
    { id: 'improvement', title: 'Miglioramento', icon: 'trending-up', color: '#2196F3' },
    { id: 'general', title: 'Feedback Generale', icon: 'chat', color: '#2196F3' },
  ];

  const handleTypeSelect = (typeId: string) => {
    setFeedbackType(typeId);
  };

  const handleAddAttachment = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showPermissionDeniedAlert('photos', () => handleAddAttachment());
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAttachments(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile selezionare l\'immagine');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!feedbackType || !subject.trim() || !message.trim()) {
      Alert.alert('Errore', 'Compila tutti i campi obbligatori');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedType = feedbackTypes.find(type => type.id === feedbackType);
      const emailSubject = `[${selectedType?.title}] ${subject}`;
      const emailBody = `
Tipo di Feedback: ${selectedType?.title}
Oggetto: ${subject}

Messaggio:
${message}

${attachments.length > 0 ? `\nAllegati: ${attachments.length} file` : ''}
      `;

      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: ['feedback@tenantapp.com'],
          subject: emailSubject,
          body: emailBody,
          attachments: attachments,
        });
        
        // Reset form
        setFeedbackType('');
        setSubject('');
        setMessage('');
        setAttachments([]);
        
        Alert.alert('Successo', 'Feedback inviato con successo!');
      } else {
        Alert.alert(
          'Email non disponibile',
          'Invia una email a feedback@tenantapp.com',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile inviare il feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invia Feedback</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo di Feedback</Text>
          <View style={styles.typeGrid}>
            {feedbackTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  feedbackType === type.id && styles.typeButtonSelected,
                  { borderColor: type.color }
                ]}
                onPress={() => handleTypeSelect(type.id)}
              >
                <MaterialIcons
                  name={type.icon as any}
                  size={24}
                  color={feedbackType === type.id ? '#fff' : type.color}
                />
                <Text style={[
                  styles.typeText,
                  feedbackType === type.id && styles.typeTextSelected
                ]}>
                  {type.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dettagli</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Oggetto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Breve descrizione del problema o suggerimento"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Messaggio *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrivi in dettaglio il tuo feedback..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allegati (Opzionale)</Text>
          <Text style={styles.attachmentDescription}>
            Aggiungi screenshot o immagini per aiutare a spiegare il problema
          </Text>
          
          <TouchableOpacity style={styles.addAttachmentButton} onPress={handleAddAttachment}>
            <MaterialIcons name="add-photo-alternate" size={24} color="#2196F3" />
            <Text style={styles.addAttachmentText}>Aggiungi Immagine</Text>
          </TouchableOpacity>

          {attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              {attachments.map((uri, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <Image source={{ uri }} style={styles.attachmentImage} />
                  <TouchableOpacity
                    style={styles.removeAttachmentButton}
                    onPress={() => handleRemoveAttachment(index)}
                  >
                    <MaterialIcons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <MaterialIcons name="send" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Invio...' : 'Invia Feedback'}
          </Text>
        </TouchableOpacity>
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
  placeholder: {
    width: 28,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#fff',
    gap: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#2196F3',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  typeTextSelected: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 120,
  },
  attachmentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  addAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    gap: 8,
  },
  addAttachmentText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  attachmentItem: {
    position: 'relative',
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
