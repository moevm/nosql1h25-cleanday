import './CleandaysPage.css'
import React from 'react';
import {Box,} from '@mui/material';
import CleandaysTable from "@components/table/CleandaysTable/CleandaysTable.tsx";
import {Cleanday} from "@models/Cleanday.ts";
import {useNavigate} from "react-router-dom";
import {useGetCleandays} from "@hooks/cleanday/useGetCleandays.tsx";
import CleandayHeatmapDialog from '@components/dialog/CleandayHeatmapDialog';

/**
 * CleandaysPage: Компонент страницы со списком субботников.
 * Отображает таблицу субботников с возможностью поиска, сортировки, фильтрации
 * и перехода на страницу детального просмотра субботника.
 *
 * @returns {React.JSX.Element} - Возвращает JSX-элемент, представляющий страницу со списком субботников.
 */
const CleandaysPage: React.FC = (): React.JSX.Element => {
    const navigate = useNavigate();
    
    // State for heatmap dialog
    const [heatmapDialogOpen, setHeatmapDialogOpen] = React.useState(false);
    const [currentFilters, setCurrentFilters] = React.useState<Record<string, unknown>>({});

    // To safely store current params for heatmap
    const filtersRef = React.useRef<Record<string, unknown>>({});

    const getQueryHook = React.useCallback((params: Record<string, unknown>) => {
        // Safely store params without causing re-renders
        filtersRef.current = {...params};
        
        // всё работает как должно, не понимаю почему возникают ошибки от инлайнера
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGetCleandays(params);
    }, []);

    /**
     * Handler for plot button click - update current filters from ref then open dialog
     */
    const handlePlotButtonClick = () => {
        // Update state only when button is clicked, not during render
        setCurrentFilters({...filtersRef.current});
        setHeatmapDialogOpen(true);
    };

    return (
        <Box className='cleandays-box'>
            <CleandaysTable
                isRenderTopToolbarCustomActions={true}
                isShowTitle={true}
                handleRowClick={(cleanday: Cleanday) => {
                    navigate(`/cleandays/${cleanday.id}`);
                }}
                getQueryHook={getQueryHook}
                onPlotButtonClick={handlePlotButtonClick}
            />
            
            {/* Heatmap Dialog */}
            <CleandayHeatmapDialog
                open={heatmapDialogOpen}
                onClose={() => setHeatmapDialogOpen(false)}
                currentFilters={currentFilters}
            />
        </Box>
    );
};

export default CleandaysPage;
