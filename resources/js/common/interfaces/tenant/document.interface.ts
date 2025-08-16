export interface ValidationResponse {
    success: boolean;
    message?: string;
    // Campos de DNI
    dni?: string;
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    codVerifica?: number;
    codVerificaLetra?: string;
    // Campos de RUC
    ruc?: string;
    razonSocial?: string;
    nombreComercial?: string | null;
    telefonos?: string[] | null;
    tipo?: string | null;
    estado?: string;
    condicion?: string;
    direccion?: string | null;
    departamento?: string | null;
    provincia?: string | null;
    distrito?: string | null;
    fechaInscripcion?: string | null;
    sistEmsion?: string | null;
    sistContabilidad?: string | null;
    actExterior?: string | null;
    actEconomicas?: Array<Record<string, unknown>> | null;
    cpPago?: Array<Record<string, unknown>> | null;
    sistElectronica?: Array<Record<string, unknown>> | null;
    fechaEmisorFe?: string | null;
    cpeElectronico?: Array<Record<string, unknown>> | null;
    fechaPle?: string | null;
    padrones?: Array<Record<string, unknown>> | null;
    fechaBaja?: string | null;
    profesion?: string | null;
    ubigeo?: string | null;
    capital?: string | null;
    // Campos antiguos para compatibilidad
    data?: {
        name?: string;
        businessName?: string;
        address?: string;
    };
}