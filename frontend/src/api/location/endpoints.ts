// Create

// Создание локации - POST
export const CREATE_LOCATION: string = "/api/locations/";

// Добавление массива фото к локации с id - POST
export const CREATE_LOCATION_IMAGES: string = "/api/locations/{id}/images";

// Read

// Получение локации по id - GET
export const GET_LOCATION: string = "/api/locations/{id}";

// Получение пагинированного массива локаций по параметрам - GET
export const GET_LOCATIONS: string = "/api/locations/";

// Получение массива фото локации с id - GET
export const GET_LOCATION_IMAGES: string = "/api/locations/{id}/images";
