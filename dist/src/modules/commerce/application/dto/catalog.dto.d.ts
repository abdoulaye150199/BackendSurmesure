export declare class CatalogLikeDto {
    visitorId: string;
    liked: boolean;
}
export declare class CreateCatalogItemDto {
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    currency: string;
    availableColors: string[];
}
export declare class UpdateCatalogItemDto {
    title?: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    availableColors?: string[];
}
export declare class UpdateStylistProfileDto {
    businessName?: string;
    about?: string;
    specialties?: string[];
    profileImage?: string;
}
