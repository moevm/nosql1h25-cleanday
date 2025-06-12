import {BaseModel} from './BaseModel';
import {City} from "./City";

export interface Location extends BaseModel {
    address: string;
    instructions: string;
    city?: City;
}
