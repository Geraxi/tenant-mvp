export interface EmailConfirmationData {
  email: string;
  confirmationToken: string;
  userName?: string;
}

// Email delivery handled server-side (Resend). Client helpers removed.
export const sendConfirmationEmail = async (data: EmailConfirmationData): Promise<boolean> => {
  try {
    const { getApiBaseUrl } = await import('../src/utils/apiBaseUrl');
    const apiBaseUrl = getApiBaseUrl();
    console.log('sendConfirmationEmail baseUrl:', apiBaseUrl);
    const response = await fetch(`${apiBaseUrl}/api/auth/pending-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        confirmationToken: data.confirmationToken,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('sendConfirmationEmail failed:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (_email: string, _resetToken: string): Promise<boolean> => {
  return false;
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
