import { Alert, Linking, Platform } from 'react-native';

export const showPermissionDeniedAlert = (
  permissionType: 'camera' | 'photos',
  onRetry?: () => void
) => {
  const permissionName = permissionType === 'camera' ? 'fotocamera' : 'libreria foto';
  
  Alert.alert(
    'Permesso Negato',
    `È necessario il permesso per accedere alla ${permissionName}. Puoi modificare le impostazioni per concedere l'accesso.`,
    [
      {
        text: 'Annulla',
        style: 'cancel',
      },
      {
        text: 'Modifica',
        onPress: () => openAppSettings(),
      },
      ...(onRetry ? [{
        text: 'Riprova',
        onPress: onRetry,
      }] : []),
    ]
  );
};

const openAppSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

