import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HelpCenterScreenProps {
  onNavigateBack: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function HelpCenterScreen({ onNavigateBack }: HelpCenterScreenProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'Come funziona il sistema di matching?',
      answer: 'Il sistema di matching funziona come Tinder: gli inquilini possono sfogliare le proprietà e "piacere" quelle che li interessano. Quando anche il proprietario "piace" l\'inquilino, si crea un match e potete iniziare a comunicare.',
      category: 'matching'
    },
    {
      id: '2',
      question: 'Come posso verificare la mia identità?',
      answer: 'Vai nella sezione Profilo > Verifica Identità e carica una foto del tuo documento d\'identità e un selfie. Il processo di verifica richiede 24-48 ore.',
      category: 'verification'
    },
    {
      id: '3',
      question: 'Come funzionano i pagamenti?',
      answer: 'Puoi pagare affitti e bollette direttamente dall\'app usando Pagopa o altri metodi di pagamento sicuri. Ricevi anche cashback su ogni pagamento effettuato.',
      category: 'payments'
    },
    {
      id: '4',
      question: 'Posso modificare le mie preferenze?',
      answer: 'Sì, puoi modificare le tue preferenze in qualsiasi momento dalla sezione Profilo > Impostazioni.',
      category: 'settings'
    },
    {
      id: '5',
      question: 'Come contatto il supporto?',
      answer: 'Puoi contattarci via email a support@tenantapp.com o chiamarci al +39 012 345 6789. Il supporto è disponibile dal lunedì al venerdì, 9:00-18:00.',
      category: 'support'
    },
    {
      id: '6',
      question: 'La mia privacy è protetta?',
      answer: 'Assolutamente sì. Utilizziamo crittografia end-to-end per proteggere i tuoi dati personali e non condividiamo mai le tue informazioni con terze parti senza il tuo consenso.',
      category: 'privacy'
    },
    {
      id: '7',
      question: 'Come funziona il cashback?',
      answer: 'Ricevi cashback su ogni pagamento effettuato attraverso l\'app. Il cashback viene accreditato automaticamente sul tuo wallet e può essere utilizzato per futuri pagamenti.',
      category: 'payments'
    },
    {
      id: '8',
      question: 'Posso cancellare il mio account?',
      answer: 'Sì, puoi cancellare il tuo account in qualsiasi momento dalla sezione Impostazioni > Zona Pericolosa > Elimina Account. Questa azione è irreversibile.',
      category: 'account'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tutti', icon: 'help' },
    { id: 'matching', name: 'Matching', icon: 'favorite' },
    { id: 'payments', name: 'Pagamenti', icon: 'payment' },
    { id: 'verification', name: 'Verifica', icon: 'verified-user' },
    { id: 'settings', name: 'Impostazioni', icon: 'settings' },
    { id: 'privacy', name: 'Privacy', icon: 'privacy-tip' },
    { id: 'support', name: 'Supporto', icon: 'support-agent' },
    { id: 'account', name: 'Account', icon: 'person' },
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contatta Supporto',
      'Come preferisci contattarci?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => {
            Alert.alert(
              'Contatto Email',
              'Per supporto via email, contattaci a: support@tenantapp.com\n\nRisponderemo entro 24 ore.',
              [{ text: 'OK' }]
            );
          },
        },
        {
          text: 'Telefono',
          onPress: () => {
            Alert.alert(
              'Contatto Telefonico',
              'Per supporto telefonico, chiamaci al: +39 02 1234 5678\n\nOrari: Lun-Ven 9:00-18:00',
              [{ text: 'OK' }]
            );
          },
        },
        {
          text: 'Chat',
          onPress: () => {
            Alert.alert('Chat', 'La chat di supporto sarà disponibile presto!');
          },
        },
      ]
    );
  };

  const handleVideoTutorials = () => {
    Alert.alert('Video Tutorial', 'I video tutorial saranno disponibili presto!');
  };

  const handleUserGuide = () => {
    Alert.alert('Guida Utente', 'La guida utente completa sarà disponibile presto!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Centro Assistenza</Text>
        <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
          <MaterialIcons name="support-agent" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Azioni Rapide</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleContactSupport}>
              <MaterialIcons name="support-agent" size={32} color="#2196F3" />
              <Text style={styles.quickActionText}>Contatta Supporto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton} onPress={handleVideoTutorials}>
              <MaterialIcons name="play-circle-filled" size={32} color="#4CAF50" />
              <Text style={styles.quickActionText}>Video Tutorial</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton} onPress={handleUserGuide}>
              <MaterialIcons name="book" size={32} color="#FF9800" />
              <Text style={styles.quickActionText}>Guida Utente</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton} onPress={() => Alert.alert('Feedback', 'Grazie per il tuo feedback!')}>
              <MaterialIcons name="feedback" size={32} color="#9C27B0" />
              <Text style={styles.quickActionText}>Invia Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <MaterialIcons 
                  name={category.icon as any} 
                  size={20} 
                  color={selectedCategory === category.id ? '#fff' : '#2196F3'} 
                />
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqContainer}>
          <Text style={styles.sectionTitle}>Domande Frequenti</Text>
          
          {filteredFAQs.map((item) => (
            <View key={item.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleExpanded(item.id)}
              >
                <Text style={styles.faqQuestionText}>{item.question}</Text>
                <MaterialIcons
                  name={expandedItems.has(item.id) ? 'expand-less' : 'expand-more'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
              
              {expandedItems.has(item.id) && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.contactContainer}>
          <Text style={styles.sectionTitle}>Informazioni di Contatto</Text>
          
          <View style={styles.contactItem}>
            <MaterialIcons name="email" size={24} color="#2196F3" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@tenantapp.com</Text>
            </View>
          </View>
          
          <View style={styles.contactItem}>
            <MaterialIcons name="phone" size={24} color="#2196F3" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Telefono</Text>
              <Text style={styles.contactValue}>+39 012 345 6789</Text>
            </View>
          </View>
          
          <View style={styles.contactItem}>
            <MaterialIcons name="schedule" size={24} color="#2196F3" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Orari</Text>
              <Text style={styles.contactValue}>Lun-Ven: 9:00-18:00</Text>
            </View>
          </View>
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
  supportButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  quickActionsContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 20,
  },
  categoriesScroll: {
    marginTop: -8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196F3',
    marginLeft: 6,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  faqContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactInfo: {
    marginLeft: 16,
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});