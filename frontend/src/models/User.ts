import {BaseModel} from "./BaseModel";

export enum Sex {
    male = "male",
    female = "female",
    other = "other",
}

export interface User extends BaseModel {
    firstName: string;
    lastName: string;
    login: string;
    sex: Sex;
    city: string;
    aboutMe: string;
    score: number;
    level: number;
    participantsCount: number;
    organizedCount: number;
    cleaned: number;
}
