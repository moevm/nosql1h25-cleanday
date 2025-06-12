import {BaseModel} from "./BaseModel";
import {Location} from "@models/Location";

export enum CleandayTag {
    trashCollecting = "Сбор мусора",
    trashSorting = "Сортировка мусора",
    planting = "Посадка растений",
    flowerbedSetup = "Разбитие клумб",
    lawnSetup = "Разбитие газонов",
    poundCleaning = "Очистка водоемов",
    snowRemoval = "Уборка снега",
    LeafHarvesting = "Уборка листьев",
    plantCare = "Уход за растениями",
    repair = "Ремонт",
    painting = "Покраска",
    feedersInstallation = "Установка кормушек",
    masterClasses = "Мастер-классы",
    gamesAndContests = "Игры и конкурсы",
    picnic = "Пикник",
}

export enum CleandayStatus {
    planned = 'Запланирован',
    onGoing = 'Проходит',
    completed = 'Завершен',
    cancelled = 'Отменен',
    rescheduled = 'Перенесён',
}

export interface Requirement extends BaseModel {
    name: string;
    usersAmount: number;
}

export interface Cleanday extends BaseModel {
    name: string;
    description: string;
    participantsCount: number;
    recommendedParticipantsCount: number;
    city: string;
    location: Location;
    beginDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    organization: string;
    organizer: string;
    organizerKey: string;
    area: number;
    status: CleandayStatus;
    tags: Array<CleandayTag>;
    requirements: Array<Requirement>;
    results: Array<string>;
}
