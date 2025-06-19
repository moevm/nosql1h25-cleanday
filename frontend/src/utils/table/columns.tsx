import React from 'react';

/**
 * Возвращает настройки для числового поля фильтра, которое не допускает отрицательные значения
 * @returns объект настроек для свойства muiFilterTextFieldProps
 */
export const getNonNegativeNumberFilterProps = () => ({
    min: 0,
    type: 'number',
    onInput: (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target as HTMLInputElement;
        if (Number(input.value) < 0) {
            input.value = '0';
        }
    },
    onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === '-') {
            e.preventDefault();
        }
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        const input = e.target as HTMLInputElement;
        if (Number(input.value) < 0) {
            input.value = '0';
        }
    }
});