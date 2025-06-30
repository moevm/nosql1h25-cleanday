// Create

// Создание субботника - POST
export const CREATE_CLEANDAY: string = '/api/cleandays/';

// Добавление массива фото субботника с id - POST
export const CREATE_CLEANDAY_IMAGES: string = '/api/cleandays/{id}/images';

// Принятие участие в субботнике с id - POST
export const JOIN_CLEANDAY: string = '/api/cleandays/{id}/members';

// Создание комментария к субботнику с id - POST
export const CREATE_CLEANDAY_COMMENT: string = '/api/cleandays/{id}/comments';


// Read

// Получение субботника по id - GET
export const GET_CLEANDAY: string = '/api/cleandays/{id}';

// Получение требований к участию в субботнике - GET
export const GET_CLEANDAY_REQUIREMENTS: string = '/api/cleandays/{id}/requirements';

// Получение массива субботников по id - GET
//export const GET_CLEANDAYS_BY_ID: string = '';

// Получение пагинированного массива субботников по параметрам - GET
export const GET_CLEANDAYS: string = '/api/cleandays/';

// Получение массива фото субботника по id - GET
export const GET_CLEANDAY_IMAGES: string = '/api/cleandays/{id}/images';

// Получение массива пользователей, принявших участие в субботнике с id - GET
export const GET_CLEANDAY_MEMBERS: string = '/api/cleandays/{id}/members';

// Получение всех логов, связанных с субботником с id - GET
export const GET_CLEANDAY_LOGS: string = '/api/cleandays/{id}/logs';

// Получение всех комментариев субботника с id - GET
export const GET_CLEANDAY_COMMENTS: string = '/api/cleandays/{id}/comments';


// Update

// Обновление субботника по id в соответствии с RESTful - PATCH
export const UPDATE_CLEANDAY: string = '/api/cleandays/{id}';

// Изменение участия в субботнике с id - PATCH
export const UPDATE_PARTICIPATION: string = '/api/cleandays/{id}/members/me';

// Завершение субботника с id - POST
export const END_CLEANDAY: string = '/api/cleandays/{id}/end';
