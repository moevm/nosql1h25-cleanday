export const getStatusByLevel = (level: number): string => {
    if (level == 1) {
        return 'Новичок👍';
    } else if (level == 2) {
        return 'Труженик💪';
    } else if (level == 3) {
        return 'Лидер района🤝';
    } else if (level == 4) {
        return 'Экоактивист🌱';
    } else if (level == 5) {
        return 'Экозвезда🌟';
    } else {
        return 'Эко-гуру🏆';
    }
};
