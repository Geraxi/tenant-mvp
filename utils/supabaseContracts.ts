import { supabase } from '../client/supabase';
import { uploadDocument, getFileUrl } from './supabaseUpload';

export interface ContractData {
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  document_url?: string;
}

export interface ContractWithDetails extends Contract {
  property: {
    id: string;
    title?: string;
    location?: string;
    rent?: number;
  };
  tenant: {
    id: string;
    full_name?: string;
    email: string;
  };
  landlord: {
    id: string;
    full_name?: string;
    email: string;
  };
}

// Create new contract
export async function createContract(contractData: ContractData): Promise<{ success: boolean; contract?: Contract; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .insert(contractData)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, contract: data };
  } catch (error) {
    console.error('Create contract error:', error);
    return { success: false, error: 'Errore durante la creazione del contratto' };
  }
}

// Get user's contracts
export async function getUserContracts(userId: string): Promise<ContractWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        property:properties!contracts_property_id_fkey(
          id,
          title,
          location,
          rent
        ),
        tenant:profiles!contracts_tenant_id_fkey(
          id,
          full_name,
          email
        ),
        landlord:profiles!contracts_landlord_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user contracts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get user contracts error:', error);
    return [];
  }
}

// Get contract by ID
export async function getContractById(contractId: string, userId: string): Promise<ContractWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        property:properties!contracts_property_id_fkey(
          id,
          title,
          location,
          rent
        ),
        tenant:profiles!contracts_tenant_id_fkey(
          id,
          full_name,
          email
        ),
        landlord:profiles!contracts_landlord_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('id', contractId)
      .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
      .single();

    if (error) {
      console.error('Error fetching contract:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get contract by ID error:', error);
    return null;
  }
}

// Upload contract document
export async function uploadContractDocument(
  contractId: string,
  userId: string,
  documentUri: string
): Promise<{ success: boolean; documentUrl?: string; error?: string }> {
  try {
    // Upload document to contracts bucket
    const uploadResult = await uploadDocument(userId, 'contract', {
      type: ['application/pdf'],
    });

    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }

    // Update contract with document URL
    const { error: updateError } = await supabase
      .from('contracts')
      .update({ document_url: uploadResult.url })
      .eq('id', contractId)
      .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, documentUrl: uploadResult.url };
  } catch (error) {
    console.error('Upload contract document error:', error);
    return { success: false, error: 'Errore durante il caricamento del documento' };
  }
}

// Mark contract as signed
export async function signContract(contractId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('contracts')
      .update({ signed: true })
      .eq('id', contractId)
      .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign contract error:', error);
    return { success: false, error: 'Errore durante la firma del contratto' };
  }
}

// Get contract document URL
export function getContractDocumentUrl(contract: Contract): string | null {
  if (!contract.document_url) return null;
  
  // Extract bucket and path from the full URL
  const url = new URL(contract.document_url);
  const pathParts = url.pathname.split('/');
  const bucket = pathParts[2]; // contracts
  const filePath = pathParts.slice(3).join('/');
  
  return getFileUrl(bucket, filePath);
}

// Generate contract between tenant and landlord
export async function generateContract(
  propertyId: string,
  tenantId: string,
  landlordId: string
): Promise<{ success: boolean; contract?: Contract; error?: string }> {
  try {
    // Check if property exists and belongs to landlord
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, owner_id')
      .eq('id', propertyId)
      .eq('owner_id', landlordId)
      .single();

    if (propertyError || !property) {
      return { success: false, error: 'Proprietà non trovata o non autorizzata' };
    }

    // Check if contract already exists
    const { data: existingContract } = await supabase
      .from('contracts')
      .select('id')
      .eq('property_id', propertyId)
      .eq('tenant_id', tenantId)
      .eq('landlord_id', landlordId)
      .single();

    if (existingContract) {
      return { success: false, error: 'Contratto già esistente per questa proprietà' };
    }

    // Create new contract
    return await createContract({
      property_id: propertyId,
      tenant_id: tenantId,
      landlord_id: landlordId,
    });
  } catch (error) {
    console.error('Generate contract error:', error);
    return { success: false, error: 'Errore durante la generazione del contratto' };
  }
}

// Get contract statistics
export async function getContractStats(userId: string): Promise<{
  totalContracts: number;
  signedContracts: number;
  pendingContracts: number;
}> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('signed')
      .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`);

    if (error) {
      console.error('Error fetching contract stats:', error);
      return {
        totalContracts: 0,
        signedContracts: 0,
        pendingContracts: 0,
      };
    }

    const contracts = data || [];
    const totalContracts = contracts.length;
    const signedContracts = contracts.filter(c => c.signed).length;
    const pendingContracts = totalContracts - signedContracts;

    return {
      totalContracts,
      signedContracts,
      pendingContracts,
    };
  } catch (error) {
    console.error('Get contract stats error:', error);
    return {
      totalContracts: 0,
      signedContracts: 0,
      pendingContracts: 0,
    };
  }
}

// Integration with external signing services
export interface SigningService {
  name: 'docusign' | 'spid' | 'aruba';
  url: string;
  parameters?: { [key: string]: string };
}

// Get signing service URL for contract
export function getSigningServiceUrl(
  contract: Contract,
  service: SigningService['name']
): string {
  const baseUrl = 'https://your-app.com/signing';
  const contractId = contract.id;
  
  switch (service) {
    case 'docusign':
      return `${baseUrl}/docusign?contract=${contractId}`;
    case 'spid':
      return `${baseUrl}/spid?contract=${contractId}`;
    case 'aruba':
      return `${baseUrl}/aruba?contract=${contractId}`;
    default:
      return `${baseUrl}?contract=${contractId}`;
  }
}

// Available signing services
export const SIGNING_SERVICES: SigningService[] = [
  {
    name: 'docusign',
    url: 'https://demo.docusign.net',
  },
  {
    name: 'spid',
    url: 'https://spid.gov.it',
  },
  {
    name: 'aruba',
    url: 'https://firma.aruba.it',
  },
];
