export type CreateUser = {
    firstname: string,
    lastname: string,
    login: string,
    city: string,
    gender: string,
    password: string,
};

export type LogIn = {
    login: string,
    password: string,
};