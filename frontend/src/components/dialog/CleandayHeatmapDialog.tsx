import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper
} from '@mui/material';
import Plot from 'react-plotly.js';
import { useGetCleandayHeatmap } from '@hooks/statistics/useGetCleandayHeatmap';
import { CleandayHeatmapParams } from '@api/statistics/models';

interface CleandayHeatmapDialogProps {
    open: boolean;
    onClose: () => void;
    currentFilters: Record<string, unknown>;
}

const CleandayHeatmapDialog: React.FC<CleandayHeatmapDialogProps> = ({ 
    open, 
    onClose, 
    currentFilters 
}) => {
    // Available dimensions for the heatmap - updated to match API expectations
    const availableDimensions = [
        { value: 'name', label: 'Название' },
        { value: 'city', label: 'Город' },
        { value: 'area', label: 'Площадь (м²)' },
        { value: 'participant_count', label: 'Количество участников' },
        { value: 'recommended_count', label: 'Рекомендуемое количество участников' },
        { value: 'status', label: 'Статус субботника' },
        { value: 'organizer', label: 'Организатор' },
        { value: 'organization', label: 'Организация' },
        { value: 'begin_date', label: 'Дата начала' },
        { value: 'end_date', label: 'Дата окончания' },
        { value: 'created_at', label: 'Дата создания' },
        { value: 'updated_at', label: 'Дата обновления' },
        { value: 'location.address', label: 'Адрес' },
    ];

    // State for X and Y axis selections
    const [xDimension, setXDimension] = useState('city');
    const [yDimension, setYDimension] = useState('participant_count');

    // Merge the current filters with the selected dimensions
    const params: CleandayHeatmapParams = {
        ...currentFilters,
        x_field: xDimension,
        y_field: yDimension
    };

    // Fetch heatmap data
    const { data, isLoading, error } = useGetCleandayHeatmap(params, {
        enabled: open, // Only fetch when dialog is open
    });

    // Effect to reset dimensions when dialog opens
    useEffect(() => {
        if (open) {
            setXDimension('city');
            setYDimension('participant_count');
        }
    }, [open]);

    // Get the current labels for axes
    const getAxisLabel = (dimension: string) => {
        const dim = availableDimensions.find(d => d.value === dimension);
        return dim ? dim.label : dimension;
    };

    // Process data for Plotly heatmap
    const processHeatmapDataForPlotly = () => {
        if (!data || !data.contents || data.contents.length === 0) {
            return { z: [[]], x: [], y: [], type: 'heatmap' };
        }

        // Extract unique x and y values from contents
        const xLabels = Array.from(new Set(data.contents.map(item => String(item.x_label))));
        const yLabels = Array.from(new Set(data.contents.map(item => String(item.y_label))));
        
        // Create empty matrix filled with zeros
        const matrix = Array(yLabels.length).fill(0).map(() => Array(xLabels.length).fill(0));
        
        // Fill matrix with values
        data.contents.forEach(item => {
            const xIndex = xLabels.indexOf(String(item.x_label));
            const yIndex = yLabels.indexOf(String(item.y_label));
            if (xIndex !== -1 && yIndex !== -1) {
                matrix[yIndex][xIndex] = item.count;
            }
        });
        
        return {
            z: matrix,
            x: xLabels,
            y: yLabels,
            type: 'heatmap',
            colorscale: [
                [0, 'rgb(255, 255, 255)'],  // White for 0
                [0.5, 'rgb(144, 238, 144)'], // Light green for middle values
                [1, 'rgb(0, 100, 0)']       // Dark green for maximum
            ],
            hoverongaps: false,
            showscale: true,
            zsmooth: false,  // Ensures discrete handling of numeric values
            colorbar: {
                title: 'Количество',
                titleside: 'right'
            }
        };
    };
    
    const plotData = [processHeatmapDataForPlotly()];
    
    // Layout configuration for the Plotly chart
    const layout = {
        title: `${getAxisLabel(xDimension)} / ${getAxisLabel(yDimension)}`,
        xaxis: {
            title: getAxisLabel(xDimension),
            tickangle: -45,
            type: 'category'  // Ensure discrete handling of X-axis values
        },
        yaxis: {
            title: getAxisLabel(yDimension),
            type: 'category'  // Ensure discrete handling of Y-axis values
        },
        autosize: true,
        margin: {
            l: 150,
            r: 50,
            b: 150,
            t: 80,
            pad: 4
        },
        height: 600,
        width: 900
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
        >
            <DialogTitle>
                Тепловая карта субботников
            </DialogTitle>
            
            <DialogContent sx={{ pb: 4 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">
                        Ошибка загрузки данных: {(error as Error).message}
                    </Alert>
                ) : !data || !data.contents || data.contents.length === 0 ? (
                    <Alert severity="info">
                        Нет данных для отображения с текущими фильтрами
                    </Alert>
                ) : (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Paper sx={{ p: 3, bgcolor: '#f8f8f8', borderRadius: 2, boxShadow: 2 }}>
                            {plotData[0].x.length > 0 && plotData[0].y.length > 0 ? (
                                <Plot
                                    data={plotData}
                                    layout={layout}
                                    style={{ width: '100%', height: '100%' }}
                                    useResizeHandler={true}
                                    config={{ 
                                        responsive: true,
                                        displayModeBar: true,
                                        toImageButtonOptions: {
                                            format: 'png',
                                            filename: 'heatmap_cleanday',
                                            height: 800,
                                            width: 1200,
                                            scale: 2
                                        }
                                    }}
                                />
                            ) : (
                                <Alert severity="warning" sx={{ my: 2 }}>
                                    Не удалось построить тепловую карту: недостаточно данных для осей X или Y
                                </Alert>
                            )}
                        </Paper>
                    </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>Ось X</InputLabel>
                        <Select
                            value={xDimension}
                            label="Ось X"
                            onChange={(e) => setXDimension(e.target.value)}
                        >
                            {availableDimensions.map((dim) => (
                                <MenuItem key={dim.value} value={dim.value}>
                                    {dim.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <FormControl fullWidth>
                        <InputLabel>Ось Y</InputLabel>
                        <Select
                            value={yDimension}
                            label="Ось Y"
                            onChange={(e) => setYDimension(e.target.value)}
                        >
                            {availableDimensions.map((dim) => (
                                <MenuItem key={dim.value} value={dim.value}>
                                    {dim.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Цвет ячейки показывает количество субботников, соответствующих заданным критериям.
                    Более тёмный цвет означает большее количество субботников.
                </Typography>
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CleandayHeatmapDialog;