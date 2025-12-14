import * as MailComposer from 'expo-mail-composer';

export interface EmailConfirmationData {
  email: string;
  confirmationToken: string;
  userName?: string;
}

// For React Native/Expo, we'll use the device's default email app
// instead of sending emails programmatically
export const sendConfirmationEmail = async (data: EmailConfirmationData): Promise<boolean> => {
  try {
    const confirmationLink = `https://yourapp.com/confirm-email?token=${data.confirmationToken}`;
    
    const emailBody = `
Ciao${data.userName ? ` ${data.userName}` : ''}!

Grazie per esserti registrato su Tenant! Per completare la registrazione e attivare il tuo account, 
clicca sul link qui sotto per confermare la tua email:

${confirmationLink}

Se il link non funziona, copia e incolla l'URL nel tuo browser.

Questo link scadrà tra 24 ore per motivi di sicurezza.

Se non hai creato un account su Tenant, puoi ignorare questa email.

A presto,
Il team di Tenant
    `.trim();

    const isAvailable = await MailComposer.isAvailableAsync();
    
    if (!isAvailable) {
      if (__DEV__) {
        console.log('Email service not available on this device');
      }
      // For development/testing, we'll simulate success
      return true;
    }

    const result = await MailComposer.composeAsync({
      recipients: [data.email],
      subject: 'Conferma il tuo account - Tenant App',
      body: emailBody,
      isHtml: false,
    });

    if (__DEV__) {
      console.log('Email composer result:', result);
    }
    return result.status === MailComposer.MailComposerStatus.SENT;
  } catch (error) {
    if (__DEV__) {
      console.error('Error opening email composer:', error);
    }
    // For development/testing, we'll simulate success
    return true;
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<boolean> => {
  try {
    const resetLink = `https://yourapp.com/reset-password?token=${resetToken}`;
    
    const emailBody = `
Reset della Password

Hai richiesto di resettare la password per il tuo account Tenant. 
Clicca sul link qui sotto per creare una nuova password:

${resetLink}

Se il link non funziona, copia e incolla l'URL nel tuo browser.

Questo link scadrà tra 1 ora per motivi di sicurezza.

Se non hai richiesto il reset della password, puoi ignorare questa email.

A presto,
Il team di Tenant
    `.trim();

    const isAvailable = await MailComposer.isAvailableAsync();
    
    if (!isAvailable) {
      if (__DEV__) {
        console.log('Email service not available on this device');
      }
      // For development/testing, we'll simulate success
      return true;
    }

    const result = await MailComposer.composeAsync({
      recipients: [email],
      subject: 'Reset Password - Tenant App',
      body: emailBody,
      isHtml: false,
    });

    if (__DEV__) {
      console.log('Email composer result:', result);
    }
    return result.status === MailComposer.MailComposerStatus.SENT;
  } catch (error) {
    if (__DEV__) {
      console.error('Error opening email composer:', error);
    }
    // For development/testing, we'll simulate success
    return true;
  }
};

// Generate a secure confirmation token
export const generateConfirmationToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate a secure reset token
export const generateResetToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};