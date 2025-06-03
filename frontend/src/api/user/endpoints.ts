// Read

// Получение пользователя по id - GET
export const GET_USER: string = '/api/users/{id}';

// Получение массива пользователей по id - GET
//export const GET_USERS_BY_ID: string = '';

// Получение пагинированного массива пользователей по параметрам - GET
export const GET_USERS: string = '/api/users/';

// Получение аватара пользователя по id - GET
export const GET_USER_AVATAR: string = '/api/users/{id}/avatar';

// Получение пагинированного массива субботников, в которых участвовал пользователь с id - GET
export const GET_USER_CLEANDAYS: string = '/api/users/{id}/cleandays';

// Получение пагинированного массива субботников, которые организовал пользователь с id - GET
export const GET_USER_ORGANIZED_CLEANDAYS: string = '/api/users/{id}/organized';


// Update

// Обновление пользователя по id в соответствии с RESTful - PATCH
export const UPDATE_USER: string = '/api/users/{id}';

// Обновление аватара пользователя по id - PUT
export const UPDATE_USER_AVATAR: string = '/api/users/{id}/avatar';
