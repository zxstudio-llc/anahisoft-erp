import { ValidationResponse } from '@/common/interfaces/tenant/document.interface';
import axios from 'axios';

/**
 * Servicio para validar documentos de identidad peruanos
 * Este servicio se conecta a APIs externas para validar DNI y RUC
 */
export const DocumentValidationService = {
    /**
     * Valida un documento según su tipo
     * @param type Tipo de documento ('01' para DNI, '06' para RUC)
     * @param number Número de documento
     */
    async validateDocument(type: string, number: string): Promise<ValidationResponse> {
        if (!type || !number) {
            return {
                success: false,
                message: 'Tipo y número de documento son requeridos',
            };
        }

        try {
            // Llamar a nuestra API de validación
            const response = await axios.post('/validate-document', {
                document_type: type,
                document_number: number,
            });

            return response.data;
        } catch (error) {
            console.error('Error al validar documento:', error);

            // Si hay un error de validación específico del servidor
            if (axios.isAxiosError(error) && error.response) {
                return {
                    success: false,
                    message: error.response.data.message || 'Error al validar el documento',
                };
            }

            // Error genérico
            return {
                success: false,
                message: 'Error al conectar con el servicio de validación',
            };
        }
    },
};
