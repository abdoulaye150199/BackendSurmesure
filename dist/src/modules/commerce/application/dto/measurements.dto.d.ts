import { PageQueryDto } from '../../../../shared/application/page.dto';
export declare class MeasurementsQueryDto extends PageQueryDto {
    q?: string;
}
export declare class CreateMeasurementDto {
    clientId?: string;
    clientName: string;
    clientPhone: string;
    measurements: Record<string, number>;
    notes: string;
}
export declare class CreateEmployeeMeasurementDto {
    clientName: string;
    clientPhone: string;
    measurements: Record<string, number>;
    notes: string;
}
export declare class UpdateMeasurementDto {
    measurements?: Record<string, number>;
    notes?: string;
}
export declare class ValidateMeasurementDto {
    modelName: string;
    expectedUpdatedAt: string;
}
export declare class SaveClientMeasurementDto {
    measurementId?: string;
    stylistId: string;
    measurements: Record<string, number>;
    notes?: string;
}
export declare class CreateClientModelMeasurementDto {
    modelType?: string;
    stylistId: string;
    modelName: string;
    measurements: Record<string, number>;
    notes?: string;
}
