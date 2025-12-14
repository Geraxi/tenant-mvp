import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { Documento } from '../src/types';

interface DocumentiScreenProps {
  onBack: () => void;
}

export default function DocumentiScreen({ onBack }: DocumentiScreenProps) {
  const { user } = useSupabaseAuth();
  const [documenti, setDocumenti] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('tutti');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadDocumenti();
    }
  }, [user?.id, selectedCategory]);

  const loadDocumenti = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual Supabase query
      const mockDocumenti: Documento[] = [
        {
          id: '1',
          utente_id: user?.id || '',
          tipo: 'contratto',
          nome_file: 'contratto_affitto_2024.pdf',
          url: 'https://via.placeholder.com/800x600/2196F3/FFFFFF?text=Contratto+PDF',
          dimensione: 1024000,
          mime_type: 'application/pdf',
          verificato: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          utente_id: user?.id || '',
          tipo: 'ricevuta',
          nome_file: 'ricevuta_affitto_gennaio.jpg',
          url: 'https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=Ricevuta+JPG',
          dimensione: 512000,
          mime_type: 'image/jpeg',
          verificato: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          utente_id: user?.id || '',
          tipo: 'identita',
          nome_file: 'carta_identita.pdf',
          url: 'https://via.placeholder.com/800x600/FF9800/FFFFFF?text=Documento+Identita',
          dimensione: 2048000,
          mime_type: 'application/pdf',
          verificato: true,
          created_at: new Date().toISOString(),
        },
      ];
      
      const filtered = selectedCategory === 'tutti' 
        ? mockDocumenti 
        : mockDocumenti.filter(d => d.tipo === selectedCategory);
      
      setDocumenti(filtered);
    } catch (error) {
      console.error('Error loading documenti:', error);
      Alert.alert('Errore', 'Impossibile caricare i documenti');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocumenti();
    setRefreshing(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getDocumentIcon = (tipo: string) => {
    switch (tipo) {
      case 'contratto':
        return 'description';
      case 'ricevuta':
        return 'receipt';
      case 'identita':
        return 'badge';
      case 'selfie':
        return 'face';
      case 'altro':
        return 'insert-drive-file';
      default:
        return 'description';
    }
  };

  const getDocumentColor = (tipo: string) => {
    switch (tipo) {
      case 'contratto':
        return '#2196F3';
      case 'ricevuta':
        return '#4CAF50';
      case 'identita':
        return '#FF9800';
      case 'selfie':
        return '#9C27B0';
      case 'altro':
        return '#607D8B';
      default:
        return '#666';
    }
  };

  const getDocumentTypeText = (tipo: string) => {
    switch (tipo) {
      case 'contratto':
        return 'Contratto';
      case 'ricevuta':
        return 'Ricevuta';
      case 'identita':
        return 'Documento Identità';
      case 'selfie':
        return 'Selfie';
      case 'altro':
        return 'Altro';
      default:
        return tipo;
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Errore', 'Impossibile aprire il documento');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Errore', 'Impossibile aprire il documento');
    }
  };

  const handleEditDocument = (documento: Documento) => {
    Alert.alert(
      'Modifica Documento',
      `Vuoi modificare il documento "${documento.nome_file}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Modifica', 
          onPress: () => {
            // Basic edit functionality - show input dialog for filename
            Alert.prompt(
              'Modifica Nome',
              'Inserisci il nuovo nome per il documento:',
              [
                { text: 'Annulla', style: 'cancel' },
                { 
                  text: 'Salva', 
                  onPress: (newName) => {
                    if (newName && newName.trim()) {
                      // Update the document name
                      setDocumenti(prev => prev.map(d => 
                        d.id === documento.id 
                          ? { ...d, nome_file: newName.trim() }
                          : d
                      ));
                      Alert.alert('Successo', 'Documento modificato con successo!');
                    } else {
                      Alert.alert('Errore', 'Nome non valido');
                    }
                  }
                }
              ],
              'plain-text',
              documento.nome_file
            );
          }
        }
      ]
    );
  };

  const handleDeleteDocument = (documento: Documento) => {
    Alert.alert(
      'Elimina Documento',
      `Sei sicuro di voler eliminare il documento "${documento.nome_file}"? Questa azione non può essere annullata.`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: () => {
            // Remove document from state
            setDocumenti(prev => prev.filter(doc => doc.id !== documento.id));
            Alert.alert('Successo', 'Documento eliminato con successo!');
          }
        }
      ]
    );
  };

  const handleUpload = async (tipo: string) => {
    try {
      setUploading(true);
      
      let result;
      if (tipo === 'selfie') {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Errore', 'Permessi camera non concessi');
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        // Request media library permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Errore', 'Permessi libreria non concessi');
          return;
        }

        if (tipo === 'contratto' || tipo === 'identita') {
          // For PDFs, use document picker
          result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
            copyToCacheDirectory: true,
          });
        } else {
          // For images, use image picker
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });
        }
      }

      if (!result.canceled) {
        // In a real app, upload to Supabase Storage
        const mockDocument: Documento = {
          id: Date.now().toString(),
          utente_id: user?.id || '',
          tipo: tipo as any,
          nome_file: result.assets?.[0]?.fileName || `documento_${tipo}_${Date.now()}`,
          url: 'https://via.placeholder.com/800x600/9C27B0/FFFFFF?text=Documento+Caricato',
          dimensione: result.assets?.[0]?.fileSize || 0,
          mime_type: result.assets?.[0]?.mimeType || 'application/pdf',
          verificato: false,
          created_at: new Date().toISOString(),
        };

        setDocumenti(prev => [mockDocument, ...prev]);
        Alert.alert('Successo', 'Documento caricato con successo');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Errore', 'Impossibile caricare il documento');
    } finally {
      setUploading(false);
      setShowUploadModal(false);
    }
  };

  const categoryOptions = [
    { value: 'tutti', label: 'Tutti', icon: 'folder' },
    { value: 'contratto', label: 'Contratti', icon: 'description' },
    { value: 'ricevuta', label: 'Ricevute', icon: 'receipt' },
    { value: 'identita', label: 'Identità', icon: 'badge' },
    { value: 'selfie', label: 'Selfie', icon: 'face' },
    { value: 'altro', label: 'Altri', icon: 'insert-drive-file' },
  ];

  const uploadOptions = [
    { value: 'contratto', label: 'Contratto', icon: 'description', color: '#2196F3' },
    { value: 'ricevuta', label: 'Ricevuta', icon: 'receipt', color: '#4CAF50' },
    { value: 'identita', label: 'Documento Identità', icon: 'badge', color: '#FF9800' },
    { value: 'selfie', label: 'Selfie', icon: 'face', color: '#9C27B0' },
    { value: 'altro', label: 'Altro Documento', icon: 'insert-drive-file', color: '#607D8B' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>I Miei Documenti</Text>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => setShowUploadModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categoryOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.categoryButton,
              selectedCategory === option.value && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(option.value)}
          >
            <MaterialIcons 
              name={option.icon as any} 
              size={16} 
              color={selectedCategory === option.value ? '#fff' : '#374151'} 
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === option.value && styles.categoryButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Documents List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Caricamento...</Text>
          </View>
        ) : documenti.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="folder-open" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>Nessun Documento</Text>
            <Text style={styles.emptyStateText}>
              {selectedCategory === 'tutti' 
                ? 'Non hai ancora documenti caricati'
                : `Nessun documento di tipo "${categoryOptions.find(c => c.value === selectedCategory)?.label}"`
              }
            </Text>
            <TouchableOpacity 
              style={styles.uploadEmptyButton}
              onPress={() => setShowUploadModal(true)}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.uploadEmptyButtonGradient}
              >
                <MaterialIcons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.uploadEmptyButtonText}>Carica Documento</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          documenti.map((documento) => (
            <TouchableOpacity
              key={documento.id}
              style={styles.documentCard}
              onPress={() => handleDownload(documento.url, documento.nome_file)}
            >
              <View style={styles.documentIcon}>
                <MaterialIcons 
                  name={getDocumentIcon(documento.tipo)} 
                  size={24} 
                  color={getDocumentColor(documento.tipo)} 
                />
              </View>
              
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{documento.nome_file}</Text>
                <Text style={styles.documentType}>
                  {getDocumentTypeText(documento.tipo)}
                </Text>
                <View style={styles.documentMeta}>
                  <Text style={styles.documentSize}>
                    {formatFileSize(documento.dimensione)}
                  </Text>
                  <Text style={styles.documentDate}>
                    {formatDate(documento.created_at)}
                  </Text>
                </View>
              </View>

              <View style={styles.documentActions}>
                <View style={[
                  styles.verificationBadge,
                  { backgroundColor: documento.verificato ? '#4CAF50' : '#FF9800' }
                ]}>
                  <MaterialIcons 
                    name={documento.verificato ? 'verified' : 'schedule'} 
                    size={16} 
                    color="#fff" 
                  />
                  <Text style={styles.verificationText}>
                    {documento.verificato ? 'Verificato' : 'In attesa'}
                  </Text>
                </View>
                
                <View style={styles.documentActionButtons}>
                  <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => handleDownload(documento.url, documento.nome_file)}
                  >
                    <MaterialIcons name="download" size={18} color="#2196F3" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.editDocumentButton}
                    onPress={() => handleEditDocument(documento)}
                  >
                    <MaterialIcons name="edit" size={18} color="#2196F3" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteDocumentButton}
                    onPress={() => handleDeleteDocument(documento)}
                  >
                    <MaterialIcons name="delete" size={18} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Carica Documento</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Seleziona il tipo di documento da caricare:</Text>

            {uploadOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.uploadOption}
                onPress={() => handleUpload(option.value)}
                disabled={uploading}
              >
                <View style={[styles.uploadOptionIcon, { backgroundColor: option.color }]}>
                  <MaterialIcons name={option.icon as any} size={24} color="#fff" />
                </View>
                <Text style={styles.uploadOptionText}>{option.label}</Text>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#666" />
              </TouchableOpacity>
            ))}

            {uploading && (
              <View style={styles.uploadingContainer}>
                <Text style={styles.uploadingText}>Caricamento in corso...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  uploadButton: {
    padding: 8,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  categoryContent: {
    paddingHorizontal: 20,
    paddingBottom: 0,
    marginBottom: 0,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 32,
  },
  categoryButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingTop: 0,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    marginBottom: 24,
  },
  uploadEmptyButton: {
    borderRadius: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadEmptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  uploadEmptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  documentMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  documentSize: {
    fontSize: 12,
    color: '#999',
  },
  documentDate: {
    fontSize: 12,
    color: '#999',
  },
  documentActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  downloadButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editDocumentButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteDocumentButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  uploadOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  uploadOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  uploadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  uploadingText: {
    fontSize: 16,
    color: '#666',
  },
});
