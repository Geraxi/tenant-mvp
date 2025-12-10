import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
// import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import Logo from '../components/Logo';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { FadeIn, ScaleIn, AnimatedButton, GradientCard } from '../components/AnimatedComponents';
import GoogleLogo from '../components/GoogleLogo';

import { logger } from '../src/utils/logger';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onSignupSuccess?: () => void;
  onNavigateToSignup: () => void;
}

export default function LoginScreen({ onLoginSuccess, onSignupSuccess, onNavigateToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [ruolo, setRuolo] = useState<'tenant' | 'landlord'>('tenant');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [signupEmailFocused, setSignupEmailFocused] = useState(false);
  const [signupPasswordFocused, setSignupPasswordFocused] = useState(false);
  const [signupNameFocused, setSignupNameFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  const { signIn, signUp, checkExistingUsers, signInWithApple } = useSupabaseAuth();

  // Configure Google Sign In - temporarily disabled
  // React.useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // You'll need to get this from Google Console
  //     offlineAccess: true,
  //     hostedDomain: '',
  //     forceCodeForRefreshToken: true,
  //   });
  // }, []);

  const handleGoogleLogin = () => {
    Alert.alert('Info', 'Login con Google sarà disponibile presto');
  };

  const handleAppleLogin = async () => {
    try {
      logger.debug('Starting Apple Sign In...');
      
      // Check if Apple Sign In is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Errore', 'Apple Sign In non è disponibile su questo dispositivo. Potrebbe essere necessario un development build.');
        return;
      }

      // Request Apple Sign In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      logger.debug('Apple Sign In successful:', credential);

      if (credential.identityToken) {
        // Create user object for authentication
        const appleUser = {
          id: credential.user,
          email: credential.email || `${credential.user}@privaterelay.appleid.com`,
          name: credential.fullName ? 
            `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() : 
            'Apple User',
          provider: 'apple'
        };

        logger.debug('Apple user data:', appleUser);
        
        // Use the signInWithApple function from the auth hook
        const result = await signInWithApple(credential.identityToken, appleUser);
        
        if (result.success) {
          logger.debug('Apple Sign In successful!');
          
          // Add a longer delay to ensure user state is properly set and persisted
          setTimeout(() => {
            if (result.isNewUser) {
              logger.debug('New Apple user - triggering onboarding');
              if (onSignupSuccess) {
                onSignupSuccess();
              } else {
                onLoginSuccess();
              }
              Alert.alert('Benvenuto!', 'Account creato con successo. Completa la configurazione del tuo profilo.');
            } else {
              logger.debug('Existing Apple user - direct login');
              onLoginSuccess();
              Alert.alert('Successo', 'Bentornato! Login completato.');
            }
          }, 1500);
        } else {
          logger.debug('Apple Sign In failed:', result.error);
          Alert.alert('Errore', result.error || 'Errore durante il login con Apple');
        }
      }
    } catch (error: any) {
      console.error('Apple Sign In error:', error);
      
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in flow
        logger.debug('User canceled Apple Sign In');
      } else if (error.code === 'ERR_REQUEST_NOT_HANDLED') {
        Alert.alert('Errore', 'Apple Sign In non supportato in Expo Go. È necessario un development build.');
      } else if (error.code === 'ERR_REQUEST_NOT_INTERACTIVE') {
        Alert.alert('Errore', 'Apple Sign In non disponibile in questo momento. Riprova più tardi.');
      } else {
        Alert.alert('Errore', `Errore durante il login con Apple: ${error.message || 'Errore sconosciuto'}`);
      }
    }
  };

  const handleLoginWithAccount = () => {
    setShowLoginForm(true);
  };

  const handleCreateAccount = () => {
    setShowSignupForm(true);
  };


  const handleEmailSignup = async () => {
    if (!email.trim() || !password.trim() || !nome.trim()) {
      Alert.alert('Errore', 'Inserisci tutti i campi richiesti');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Errore', 'La password deve essere di almeno 6 caratteri');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp(email.trim(), password, nome.trim(), ruolo);
      
      if (result.success) {
        // For new signups, go directly to onboarding
        if (onSignupSuccess) {
          onSignupSuccess();
        } else {
          onLoginSuccess();
        }
      } else {
        Alert.alert('Errore', result.error || 'Errore durante la registrazione');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Errore', 'Errore durante la registrazione. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Errore', 'Inserisci email e password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn(email.trim(), password);
      
      if (result.success) {
        onLoginSuccess();
      } else {
        Alert.alert('Errore', result.error || 'Credenziali non valide');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Errore', 'Errore durante il login. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1e40af', '#3b82f6', '#60a5fa']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Logo */}
        <FadeIn delay={200} from="top">
          <View style={styles.logoContainer}>
            <ScaleIn delay={400}>
              <Logo size="large" />
            </ScaleIn>
            <FadeIn delay={600}>
              <Text style={styles.appName}>Tenant</Text>
            </FadeIn>
          </View>
        </FadeIn>

        {/* Welcome Text */}
        <FadeIn delay={800} from="bottom">
          <Text style={styles.welcomeTitle}>Benvenuto su Tenant</Text>
        </FadeIn>
        <FadeIn delay={1000} from="bottom">
          <Text style={styles.welcomeSubtitle}>
            Trova la tua corrispondenza perfetta nel mercato degli affitti
          </Text>
        </FadeIn>


        {/* Login Form */}
        {showLoginForm && (
          <FadeIn delay={200} from="bottom">
            <GradientCard 
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.loginForm}
            >
              <FadeIn delay={400}>
                <Text style={styles.formTitle}>Accedi al tuo account</Text>
              </FadeIn>
          
              <FadeIn delay={600}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={[styles.textInput, emailFocused && styles.textInputFocused]}
                    placeholder="Inserisci la tua email"
                    placeholderTextColor="#B0B0B0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    selectionColor="#1A1A2E"
                  />
                </View>
              </FadeIn>

              <FadeIn delay={800}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.textInput, styles.passwordInput, passwordFocused && styles.textInputFocused]}
                      placeholder="Inserisci la tua password"
                      placeholderTextColor="#B0B0B0"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      selectionColor="#1A1A2E"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons
                        name={showPassword ? "visibility-off" : "visibility"}
                        size={20}
                        color="#B0B0B0"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </FadeIn>

              <FadeIn delay={1000}>
                <AnimatedButton
                  title={isLoading ? "Accedendo..." : "Accedi"}
                  onPress={handleEmailLogin}
                  variant="primary"
                  disabled={isLoading}
                  style={styles.mainButton}
                />
              </FadeIn>

              <FadeIn delay={1200}>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => setShowLoginForm(false)}
                >
                  <Text style={styles.backButtonText}>← Torna indietro</Text>
                </TouchableOpacity>
              </FadeIn>
            </GradientCard>
          </FadeIn>
        )}

        {/* Signup Form */}
        {showSignupForm && (
          <FadeIn delay={200} from="bottom">
            <GradientCard 
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.loginForm}
            >
              <FadeIn delay={400}>
                <Text style={styles.formTitle}>Crea un nuovo account</Text>
              </FadeIn>
              
              <FadeIn delay={600}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nome</Text>
                  <TextInput
                    style={[styles.textInput, signupNameFocused && styles.textInputFocused]}
                    placeholder="Inserisci il tuo nome"
                    placeholderTextColor="#B0B0B0"
                    value={nome}
                    onChangeText={setNome}
                    autoCapitalize="words"
                    autoCorrect={false}
                    onFocus={() => setSignupNameFocused(true)}
                    onBlur={() => setSignupNameFocused(false)}
                    selectionColor="#1A1A2E"
                  />
                </View>
              </FadeIn>

              <FadeIn delay={800}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={[styles.textInput, signupEmailFocused && styles.textInputFocused]}
                    placeholder="Inserisci la tua email"
                    placeholderTextColor="#B0B0B0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setSignupEmailFocused(true)}
                    onBlur={() => setSignupEmailFocused(false)}
                    selectionColor="#1A1A2E"
                  />
                </View>
              </FadeIn>

              <FadeIn delay={1000}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.textInput, styles.passwordInput, signupPasswordFocused && styles.textInputFocused]}
                      placeholder="Inserisci la tua password (min. 6 caratteri)"
                      placeholderTextColor="#B0B0B0"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showSignupPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setSignupPasswordFocused(true)}
                      onBlur={() => setSignupPasswordFocused(false)}
                      selectionColor="#1A1A2E"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      <MaterialIcons
                        name={showSignupPassword ? "visibility-off" : "visibility"}
                        size={20}
                        color="#B0B0B0"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </FadeIn>

              <FadeIn delay={1200}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Ruolo</Text>
                  <View style={styles.roleContainer}>
                    <TouchableOpacity 
                      style={[styles.roleButton, ruolo === 'tenant' && styles.roleButtonActive]}
                      onPress={() => setRuolo('tenant')}
                    >
                      <Text style={[styles.roleButtonText, ruolo === 'tenant' && styles.roleButtonTextActive]}>
                        Inquilino
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.roleButton, ruolo === 'landlord' && styles.roleButtonActive]}
                      onPress={() => setRuolo('landlord')}
                    >
                      <Text style={[styles.roleButtonText, ruolo === 'landlord' && styles.roleButtonTextActive]}>
                        Proprietario
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </FadeIn>

              <FadeIn delay={1400}>
                <AnimatedButton
                  title={isLoading ? "Registrando..." : "Registrati"}
                  onPress={handleEmailSignup}
                  variant="primary"
                  disabled={isLoading}
                  style={styles.mainButton}
                />
              </FadeIn>

              <FadeIn delay={1600}>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => setShowSignupForm(false)}
                >
                  <Text style={styles.backButtonText}>← Torna indietro</Text>
                </TouchableOpacity>
              </FadeIn>
            </GradientCard>
          </FadeIn>
        )}

        {/* Social Sign In - Top - Only show when no forms are open */}
        {!showLoginForm && !showSignupForm && (
          <FadeIn delay={1400}>
            <View style={styles.socialContainer}>
              <FadeIn delay={1500}>
                <AnimatedButton
                  title="Accedi con Google Account"
                  onPress={handleGoogleLogin}
                  variant="primary"
                  style={styles.socialButton}
                  icon={<GoogleLogo size={20} />}
                />
              </FadeIn>
              
              <FadeIn delay={1600}>
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                  cornerRadius={12}
                  style={styles.appleButton}
                  onPress={handleAppleLogin}
                />
              </FadeIn>
            </View>
          </FadeIn>
        )}

        {/* Login Options - Only show when no forms are open */}
        {!showLoginForm && !showSignupForm && (
          <FadeIn delay={1600}>
            <View style={styles.optionsContainer}>
              <FadeIn delay={1800}>
                <Text style={styles.promptText}>Hai già un account?</Text>
              </FadeIn>
              
              <FadeIn delay={2000} from="left">
                <AnimatedButton
                  title="Accedi al tuo account"
                  onPress={handleLoginWithAccount}
                  variant="primary"
                  style={styles.mainButton}
                />
              </FadeIn>

              <FadeIn delay={2200}>
                <Text style={styles.promptText}>Oppure registrati:</Text>
              </FadeIn>
              
              <FadeIn delay={2400} from="right">
                <AnimatedButton
                  title="Crea un nuovo account"
                  onPress={handleCreateAccount}
                  variant="primary"
                  style={styles.mainButton}
                />
              </FadeIn>
            </View>
          </FadeIn>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 55,
    lineHeight: 22,
  },
  socialContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  socialButton: {
    marginBottom: 20,
  },
  optionsContainer: {
    alignItems: 'center',
  },
  appleButton: {
    width: 280,
    height: 50,
  },
  mainButton: {
    marginBottom: 30,
  },
  promptText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 23,
    textAlign: 'center',
  },
  // Login Form Styles
  loginForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 23,
  },
  inputContainer: {
    marginBottom: 23,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A2E',
  },
  textInputFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50, // Make space for the eye button
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 23,
  },
  backButtonText: {
    fontSize: 14,
    color: 'white',
  },
  // Role Selection Styles
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  roleButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  roleButtonTextActive: {
    color: 'white',
  },
});