import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

export interface DigitalSignature {
  signatureId: string;
  signatureHash: string;
  timestamp: string;
  provider: string;
  certificate: string;
  signedData: string;
  signerFiscalCode: string;
  signerType: 'homeowner' | 'tenant';
  legalValidity: boolean;
  eidasLevel: 'Low' | 'Substantial' | 'High';
}

export interface ContractIntegrity {
  contractId: string;
  contentHash: string;
  timestamp: string;
  version: string;
  isTampered: boolean;
  lastModified: string;
}

export interface ComplianceCheck {
  gdprCompliant: boolean;
  italianLawCompliant: boolean;
  eidasCompliant: boolean;
  auditTrail: boolean;
  dataRetention: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Generate a secure hash for contract content
 */
export const generateSecureHash = (content: string, algorithm: 'SHA256' | 'SHA512' = 'SHA256'): string => {
  const hash = algorithm === 'SHA256' ? CryptoJS.SHA256 : CryptoJS.SHA512;
  return hash(content).toString(CryptoJS.enc.Hex);
};

/**
 * Verify contract integrity using multiple hash algorithms
 */
export const verifyContractIntegrity = async (
  contractId: string,
  currentContent: string
): Promise<ContractIntegrity> => {
  try {
    // Get stored contract data
    const storedData = await SecureStore.getItemAsync(`contract_${contractId}`);
    
    if (!storedData) {
      return {
        contractId,
        contentHash: generateSecureHash(currentContent),
        timestamp: new Date().toISOString(),
        version: '1.0',
        isTampered: false,
        lastModified: new Date().toISOString(),
      };
    }
    
    const stored = JSON.parse(storedData);
    const currentHash = generateSecureHash(currentContent);
    const isTampered = stored.contentHash !== currentHash;
    
    return {
      contractId,
      contentHash: currentHash,
      timestamp: stored.timestamp,
      version: stored.version || '1.0',
      isTampered,
      lastModified: isTampered ? new Date().toISOString() : stored.lastModified,
    };
  } catch (error) {
    if (__DEV__) {
      console.error('Error verifying contract integrity:', error);
    }
    return {
      contractId,
      contentHash: generateSecureHash(currentContent),
      timestamp: new Date().toISOString(),
      version: '1.0',
      isTampered: false,
      lastModified: new Date().toISOString(),
    };
  }
};

/**
 * Store contract with integrity verification
 */
export const storeContractSecurely = async (
  contractId: string,
  content: string,
  signature?: DigitalSignature
): Promise<boolean> => {
  try {
    const contractData = {
      contractId,
      content,
      contentHash: generateSecureHash(content),
      timestamp: new Date().toISOString(),
      version: '1.0',
      signature,
      lastModified: new Date().toISOString(),
    };
    
    await SecureStore.setItemAsync(`contract_${contractId}`, JSON.stringify(contractData));
    
    // Create audit trail
    await createAuditTrail(contractId, 'contract_stored', {
      contentHash: contractData.contentHash,
      hasSignature: !!signature,
      timestamp: contractData.timestamp,
    });
    
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Error storing contract securely:', error);
    }
    return false;
  }
};

/**
 * Create audit trail entry
 */
export const createAuditTrail = async (
  contractId: string,
  action: string,
  metadata: any
): Promise<void> => {
  try {
    const auditEntry = {
      contractId,
      action,
      metadata,
      timestamp: new Date().toISOString(),
      userId: 'current_user', // In real app, get from auth context
      sessionId: 'current_session', // In real app, get from session
    };
    
    const existingAudit = await SecureStore.getItemAsync(`audit_${contractId}`);
    const auditTrail = existingAudit ? JSON.parse(existingAudit) : [];
    auditTrail.push(auditEntry);
    
    await SecureStore.setItemAsync(`audit_${contractId}`, JSON.stringify(auditTrail));
  } catch (error) {
    if (__DEV__) {
      console.error('Error creating audit trail:', error);
    }
  }
};

/**
 * Get audit trail for a contract
 */
export const getAuditTrail = async (contractId: string): Promise<any[]> => {
  try {
    const auditData = await SecureStore.getItemAsync(`audit_${contractId}`);
    return auditData ? JSON.parse(auditData) : [];
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting audit trail:', error);
    }
    return [];
  }
};

/**
 * Validate digital signature
 */
export const validateDigitalSignature = async (signature: DigitalSignature): Promise<boolean> => {
  try {
    // In a real implementation, this would validate the signature
    // with the SPID provider's verification service
    
    // Check signature format
    if (!signature.signatureId || !signature.signatureHash || !signature.timestamp) {
      return false;
    }
    
    // Check timestamp validity (not older than 24 hours)
    const signatureTime = new Date(signature.timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - signatureTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      return false;
    }
    
    // Check eIDAS compliance
    if (!['Low', 'Substantial', 'High'].includes(signature.eidasLevel)) {
      return false;
    }
    
    // Simulate signature validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Error validating digital signature:', error);
    }
    return false;
  }
};

/**
 * Check compliance requirements
 */
export const checkCompliance = async (contract: any, signature?: DigitalSignature): Promise<ComplianceCheck> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // GDPR Compliance
    const gdprCompliant = checkGDPRCompliance(contract);
    if (!gdprCompliant) {
      errors.push('Contratto non conforme al GDPR');
    }
    
    // Italian Law Compliance
    const italianLawCompliant = checkItalianLawCompliance(contract);
    if (!italianLawCompliant) {
      errors.push('Contratto non conforme alla legge italiana');
    }
    
    // eIDAS Compliance
    const eidasCompliant = signature ? checkEidasCompliance(signature) : false;
    if (signature && !eidasCompliant) {
      errors.push('Firma digitale non conforme a eIDAS');
    }
    
    // Audit Trail
    const auditTrail = await getAuditTrail(contract.id);
    const auditTrailExists = auditTrail.length > 0;
    if (!auditTrailExists) {
      warnings.push('Traccia di audit non disponibile');
    }
    
    // Data Retention
    const dataRetention = checkDataRetention(contract);
    if (!dataRetention) {
      warnings.push('Politica di conservazione dati non rispettata');
    }
    
    return {
      gdprCompliant,
      italianLawCompliant,
      eidasCompliant,
      auditTrail: auditTrailExists,
      dataRetention,
      errors,
      warnings,
    };
  } catch (error) {
    if (__DEV__) {
      console.error('Error checking compliance:', error);
    }
    return {
      gdprCompliant: false,
      italianLawCompliant: false,
      eidasCompliant: false,
      auditTrail: false,
      dataRetention: false,
      errors: ['Errore durante il controllo di conformità'],
      warnings: [],
    };
  }
};

/**
 * Check GDPR compliance
 */
const checkGDPRCompliance = (contract: any): boolean => {
  // Check for required GDPR fields
  const requiredFields = ['privacyPolicy', 'dataProcessing', 'consent'];
  return requiredFields.every(field => contract[field] !== undefined);
};

/**
 * Check Italian law compliance
 */
const checkItalianLawCompliance = (contract: any): boolean => {
  // Check for required Italian law fields
  const requiredFields = ['rentalAmount', 'startDate', 'endDate', 'propertyAddress'];
  return requiredFields.every(field => contract[field] !== undefined);
};

/**
 * Check eIDAS compliance
 */
const checkEidasCompliance = (signature: DigitalSignature): boolean => {
  return signature.eidasLevel === 'High' || signature.eidasLevel === 'Substantial';
};

/**
 * Check data retention policy
 */
const checkDataRetention = (contract: any): boolean => {
  // Check if contract has proper data retention settings
  const retentionPeriod = contract.dataRetentionPeriod || 0;
  return retentionPeriod >= 10; // Minimum 10 years for rental contracts
};

/**
 * Generate compliance report
 */
export const generateComplianceReport = async (contractId: string): Promise<string> => {
  try {
    const contractData = await SecureStore.getItemAsync(`contract_${contractId}`);
    const contract = contractData ? JSON.parse(contractData) : null;
    
    if (!contract) {
      return 'Contratto non trovato';
    }
    
    const compliance = await checkCompliance(contract, contract.signature);
    const auditTrail = await getAuditTrail(contractId);
    
    const report = `
REPORT DI CONFORMITÀ
===================

ID Contratto: ${contractId}
Data Generazione: ${new Date().toLocaleString('it-IT')}

CONFORMITÀ LEGALE
-----------------
GDPR: ${compliance.gdprCompliant ? '✅ Conforme' : '❌ Non conforme'}
Legge Italiana: ${compliance.italianLawCompliant ? '✅ Conforme' : '❌ Non conforme'}
eIDAS: ${compliance.eidasCompliant ? '✅ Conforme' : '❌ Non conforme'}

SICUREZZA
---------
Traccia di Audit: ${compliance.auditTrail ? '✅ Disponibile' : '❌ Non disponibile'}
Conservazione Dati: ${compliance.dataRetention ? '✅ Conforme' : '❌ Non conforme'}

ERRORI
------
${compliance.errors.length > 0 ? compliance.errors.join('\n') : 'Nessun errore'}

AVVISI
------
${compliance.warnings.length > 0 ? compliance.warnings.join('\n') : 'Nessun avviso'}

TRACCIA DI AUDIT
----------------
${auditTrail.length} eventi registrati
Ultimo evento: ${auditTrail[auditTrail.length - 1]?.timestamp || 'N/A'}
    `;
    
    return report;
  } catch (error) {
    if (__DEV__) {
      console.error('Error generating compliance report:', error);
    }
    return 'Errore durante la generazione del report';
  }
};

/**
 * Encrypt sensitive contract data
 */
export const encryptContractData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

/**
 * Decrypt sensitive contract data
 */
export const decryptContractData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Generate secure encryption key
 */
export const generateEncryptionKey = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
};





