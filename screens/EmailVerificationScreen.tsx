import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { getPendingUser, clearPendingUser, setEmailVerified } from '../utils/userStorage';
import { sendConfirmationEmail } from '../utils/emailService';

interface EmailVerificationScreenProps {
  onVerificationComplete: () => void;
  onBack: () => void;
}

export default function EmailVerificationScreen({
  onVerificationComplete,
  onBack,
}: EmailVerificationScreenProps) {
  const [pendingUser, setPendingUser] = useState<{ email: string; password: string; confirmationToken: string } | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    loadPendingUser();
  }, []);

  const loadPendingUser = async () => {
    const user = await getPendingUser();
    setPendingUser(user);
  };

  const handleResendEmail = async () => {
    if (!pendingUser) return;

    setIsResending(true);
    try {
      const emailSent = await sendConfirmationEmail({
        email: pendingUser.email,
        confirmationToken: pendingUser.confirmationToken,
        userName: pendingUser.email.split('@')[0]
      });

      if (emailSent) {
        Alert.alert(
          'Email Inviata',
          'Abbiamo rinviato l\'email di verifica. Controlla la tua casella di posta.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Errore', 'Errore durante l\'invio dell\'email. Riprova più tardi.');
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante l\'invio dell\'email. Riprova più tardi.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!pendingUser) return;

    setIsVerifying(true);
    try {
      // Simulate email verification check
      // In a real app, you would check with your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark email as verified
      await setEmailVerified(pendingUser.email);
      
      // Clear pending user data
      await clearPendingUser();
      
      Alert.alert(
        'Email Verificata!',
        'La tua email è stata verificata con successo. Ora puoi completare la registrazione.',
        [
          {
            text: 'Continua',
            onPress: onVerificationComplete
          }
        ]
      );
    } catch (error) {
      Alert.alert('Errore', 'Errore durante la verifica. Riprova.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!pendingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#F44336" />
          <Text style={styles.errorText}>Nessun utente in attesa di verifica</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Torna al Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <Logo size="large" showBackground={false} />
        </View>

        <View style={styles.iconContainer}>
          <MaterialIcons name="email" size={80} color="#2196F3" />
        </View>

        <Text style={styles.title}>Verifica la tua Email</Text>
        
        <Text style={styles.subtitle}>
          Abbiamo inviato un link di verifica a:
        </Text>
        
        <Text style={styles.emailText}>{pendingUser.email}</Text>
        
        <Text style={styles.instructions}>
          Controlla la tua casella di posta e clicca sul link per attivare il tuo account.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.verifyButton, isVerifying && styles.buttonDisabled]} 
            onPress={handleVerifyEmail}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={24} color="#fff" />
                <Text style={styles.verifyButtonText}>Ho verificato l'email</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.resendButton, isResending && styles.buttonDisabled]} 
            onPress={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <>
                <MaterialIcons name="refresh" size={20} color="#2196F3" />
                <Text style={styles.resendButtonText}>Rinvia Email</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.helpText}>
          Non hai ricevuto l'email? Controlla anche la cartella spam.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 24,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 30,
  },
  verifyButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resendButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  resendButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  helpText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
});
