export type CreateUser = {
    firstname: string,
    lastname: string,
    login: string,
    city: string,
    gender: string,
    password: string,
};

export type User = {
    key: string;
    first_name: string;
    last_name: string;
    login: string;
    city: string;
    cleanday_count: number;
    organized_count: number;
    level: number;
}

export interface UserProfile {
    key: string;
    login: string;
    first_name: string;
    last_name: string;
    sex: "female" | "male" | "other";
    city: string;
    about_me?: string;
    score: number;
    level: number;
    cleanday_count: number;
    organized_count: number;
    stat: number;
    created_at: string;
    updated_at: string;
}

export interface UserProfileEdit {
    login: string;
    password?: string;
    first_name: string;
    last_name: string;
    sex: "female" | "male" | "other";
    city: string;
    about_me?: string;
}

export interface StatisticData {
    totalUsers: number;
    usersParticipatedInCleanup: number;
    totalSubbotniks: number;
    pastSubbotniks: number;
    areaCleaned: string;
}

export type LogIn = {
    login: string,
    password: string,
};

export type CreateCleanday = {
    name: string;
    beginDate: Date;
    endDate: Date;
    organization?: string;
    area: number;
    description: string;
    tags: CleanDayTag[];
    recommendedCount: number;
};

export interface Cleanday {
    key: string;
    name: string;
    description: string;
    participant_count: number;
    recommended_count: number;
    city: string;
    location: Location;
    begin_date: string;
    end_date: string;
    organizer: string;
    organization: string;
    area: number;
    tags: Array<CleanDayTag>;
    status: 'Запланировано' | 'Завершен' | 'Отменен' | 'Проходит' | 'Перенесён';
    requirements: string[];
    created_at: string;
    updated_at: string;
}

export interface CleandayPics {
    Images: Array<Image>;
}

export interface UserPic {
    photo: string;
}

export interface Image {
    key: string;
    description: string;
    photo: string;
}

export interface Comment {
    key: string;
    text: string;
    date: string;
    author: string;
}

export interface CleandayComments {
    comments: Array<Comment>;
}

export interface City {
    key: string;
    name: string;
}

export type Location = {
    address: string;
    instructions: string;
    key: number;
    city: string;
};

export enum CleanDayTag {
    TRASH_COLLECTING = "Сбор мусора",
    TRASH_SORTING = "Сортировка мусора",
    PLANTING = "Посадка растений",
    FLOWER_BED_SETUP = "Разбитие клумб",
    LAWN_SETUP = "Разбитие газонов",
    WATERBODY_CLEANING = "Очистка водоемов",
    SNOW_REMOVAL = "Уборка снега",
    LEAF_CLEANING = "Уборка листьев",
    PLANT_CARE = "Уход за растениями",
    REPAIR = "Ремонт",
    PAINTING = "Покраска",
    FEEDER_INSTALLATION = "Установка кормушек",
    MASTER_CLASSES = "Мастер-классы",
    GAMES_AND_CONTESTS = "Игры и конкурсы",
    PICNIC = "Пикник",
}


export enum ParticipationStatus {
    GOING = 'Точно пойду (+5 опыта)',
    LATE = 'Опоздаю (+4 опыта)',
    MAYBE = 'Возможно, пойду (+3 опыта)',
    NOT_GOING = 'Не пойду',
}


export interface Requirement {
    id: number;
    name: string;
}


export interface ParticipationData {
    status: ParticipationStatus;
    selectedRequirements: number[];
}


export interface Participant {
    id: number;
    name: string;
    status: ParticipantStatus;
}


export enum ParticipantStatus {
    CONFIRMED = 'Подтвержден',
    PARTICIPATED = 'Участвовал',
    NOT_PARTICIPATED = 'Не участвовал',
    UNKNOWN = 'Неизвестно'
}


export interface CompletionData {
    results: string[];
    images: File[];
    participantStatuses: { [userId: number]: ParticipantStatus };
}


export interface CleandayResults {
    id: string | number;
    name: string;
    date: string;
    location: string;
    results: string[];
    photos: string[]; // URLs изображений
    participantsCount: number;
}


export interface CreateLocationData {
    name: string;
    city: string;
    address: string;
    images: File[];
    additionalInfo: string;
}