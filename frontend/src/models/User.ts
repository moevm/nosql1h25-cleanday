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

export type Location = {
    address: string;
    instructions: string;
    id: number;
};

enum CleanDayTag {
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
export default CleanDayTag;
