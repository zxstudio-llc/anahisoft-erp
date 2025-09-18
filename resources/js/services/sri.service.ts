// src/services/sri.service.ts
import axios from 'axios';
import { SriApiResponse } from '@/common/interfaces/tenant/sri-validation.interface';

export interface SriValidationResult {
  success: boolean;
  data?: {
    ruc: string;
    business_name: string;
    legal_name: string;
    commercial_name: string | null;
    address: string;
    province: string;
    canton: string;
    parish: string;
    establishment_code: string;
    emission_point_code: string;
    company_status: string;
    company_type: string;
    main_activity: string;
  };
  error?: string;
}

export class SriService {
  static async validateRuc(ruc: string): Promise<SriValidationResult> {
    try {
      const response = await axios.get<SriApiResponse>(`/v1/sris/${ruc}`, {
        withCredentials: true,
        headers: { 
          'Accept': 'application/json', 
          'X-Requested-With': 'XMLHttpRequest' 
        }
      });
      
      // La respuesta completa es del tipo SriApiResponse
      const apiData: SriApiResponse = response.data;
      
      if (apiData.success && apiData.data) {
        const addressData = this.parseAddress(apiData.data.head_office_address);
        const mainEstablishment = apiData.data.establishments?.find(est => est.is_headquarters) || apiData.data.establishments?.[0];
        
        return {
          success: true,
          data: {
            ruc: apiData.data.identification,
            business_name: apiData.data.business_name,
            legal_name: apiData.data.legal_name,
            commercial_name: apiData.data.commercial_name,
            address: apiData.data.head_office_address,
            province: addressData.province,
            canton: addressData.canton,
            parish: addressData.parish,
            establishment_code: mainEstablishment?.number || '001',
            emission_point_code: '001',
            company_status: this.mapStatus(apiData.data.status),
            company_type: this.mapCompanyType(apiData.data.taxpayer_type),
            main_activity: apiData.data.main_activity
          }
        };
      }
      
      return {
        success: false,
        error: 'No se pudo obtener datos del RUC'
      };
      
    } catch (error) {
      console.error('Error validating RUC:', error);
      
      if (axios.isAxiosError(error)) {
        // Manejar diferentes estructuras de error
        const errorData = error.response?.data;
        let errorMessage = 'Error al consultar el RUC';
        
        if (typeof errorData === 'object' && errorData !== null) {
          if ('error' in errorData) {
            errorMessage = errorData.error;
          } else if ('message' in errorData) {
            errorMessage = errorData.message;
          } else if ('data' in errorData && typeof errorData.data === 'object' && errorData.data !== null && 'error' in errorData.data) {
            errorMessage = errorData.data.error;
          }
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
      
      return {
        success: false,
        error: 'Error al consultar el RUC en el SRI'
      };
    }
  }

  private static mapStatus(status: string | null): string {
    if (!status) return 'ACTIVE';
    
    const statusMap: Record<string, string> = {
      'ACTIVO': 'ACTIVE',
      'SUSPENSO': 'SUSPENDED',
      'BAJA': 'INACTIVE',
      'INACTIVO': 'INACTIVE',
      'SUSPENDIDO': 'SUSPENDED'
    };
    
    return statusMap[status.toUpperCase()] || 'ACTIVE';
  }

  private static mapCompanyType(taxpayerType: string): string {
    if (!taxpayerType) return 'NATURAL';
    
    const typeMap: Record<string, string> = {
      'PERSONA NATURAL': 'NATURAL',
      'PERSONA JURIDICA': 'JURIDICA',
      'SOCIEDAD': 'JURIDICA',
      'EMPRESA': 'JURIDICA',
      'JURÍDICA': 'JURIDICA',
      'NATURAL': 'NATURAL'
    };
    
    return typeMap[taxpayerType.toUpperCase()] || 'NATURAL';
  }

  static parseAddress(addressString: string): {
    province: string;
    canton: string;
    parish: string;
  } {
    if (!addressString) {
      return {
        province: '',
        canton: '',
        parish: ''
      };
    }

    // Ejemplo: "GUAYAS / DURAN / ELOY ALFARO (DURAN) / SOLAR 4"
    const parts = addressString.split('/').map(part => part.trim()).filter(part => part.length > 0);

    const cleanText = (text: string) => {
      if (!text) return '';
      return text.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const removeParentheses = (text: string) => {
      return text.replace(/\([^)]*\)/g, '').trim();
    };

    return {
      province: parts[0] ? cleanText(parts[0]) : '',
      canton: parts[1] ? cleanText(parts[1]) : '',
      parish: parts[2] ? cleanText(removeParentheses(parts[2])) : parts[2] ? cleanText(parts[2]) : ''
    };
  }
}