import {BaseModel} from "./BaseModel";
import {User} from "@models/User";

export interface Comment extends BaseModel {
    text: string;
    date: Date;
    author?: User;
}
