import { BaseModel } from './BaseModel';

export interface Image extends BaseModel {
    description: string;
    photo: string;
}
