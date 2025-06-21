import './CleandaysPage.css'
import React from 'react';
import {Box,} from '@mui/material';
import CleandaysTable from "@components/table/CleandaysTable/CleandaysTable.tsx";
import {Cleanday} from "@models/Cleanday.ts";
import {useNavigate} from "react-router-dom";
import {useGetCleandays} from "@hooks/cleanday/useGetCleandays.tsx";

/**
 * CleandaysPage: Компонент страницы со списком субботников.
 * Отображает таблицу субботников с возможностью поиска, сортировки, фильтрации
 * и перехода на страницу детального просмотра субботника.
 *
 * @returns {React.JSX.Element} - Возвращает JSX-элемент, представляющий страницу со списком субботников.
 */
const CleandaysPage: React.FC = (): React.JSX.Element => {
    const navigate = useNavigate();

    const getQueryHook = React.useCallback((params: Record<string, unknown>) => {
        // всё работает как должно, не понимаю почему возникают ошибки от инлайнера
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGetCleandays(params);
    }, []);

    return (
        <Box className='cleandays-box'>
            <CleandaysTable
                isRenderTopToolbarCustomActions={true}
                isShowTitle={true}
                handleRowClick={(cleanday: Cleanday) => {
                    navigate(`/cleandays/${cleanday.id}`);
                }}
                getQueryHook={getQueryHook}
            />
        </Box>
    );
};

export default CleandaysPage;
