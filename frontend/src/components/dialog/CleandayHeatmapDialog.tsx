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

    // Define date fields for formatting
    const dateFields = ['begin_date', 'end_date', 'created_at', 'updated_at'];

    // Function to format date strings to Russian locale
    const formatDateString = (value: string, isDate: boolean): string => {
        if (!isDate) return value;
        
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return value;
            
            return date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return value;
        }
    };

    // Function to handle long axis labels
    const formatAxisLabel = (label: string, isXAxis: boolean): string => {
        if (!label) return '';
        
        const maxLength = isXAxis ? 20 : 30; // X-axis gets shorter truncation
        
        if (label.length <= maxLength) return label;
        
        return label.substring(0, maxLength) + '...';
    };

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

        // Extract unique x and y values from contents and format dates if needed
        const isXDate = dateFields.includes(xDimension);
        const isYDate = dateFields.includes(yDimension);
        
        // Format and potentially truncate labels
        const xLabels = Array.from(new Set(data.contents.map(item => {
            const dateFormatted = formatDateString(String(item.x_label), isXDate);
            return formatAxisLabel(dateFormatted, true);
        })));
        
        const yLabels = Array.from(new Set(data.contents.map(item => {
            const dateFormatted = formatDateString(String(item.y_label), isYDate);
            return formatAxisLabel(dateFormatted, false);
        })));
        
        // Create empty matrix filled with zeros
        const matrix = Array(yLabels.length).fill(0).map(() => Array(xLabels.length).fill(0));
        
        // Fill matrix with values
        data.contents.forEach(item => {
            const xRaw = formatDateString(String(item.x_label), isXDate);
            const yRaw = formatDateString(String(item.y_label), isYDate);
            
            const xFormatted = formatAxisLabel(xRaw, true);
            const yFormatted = formatAxisLabel(yRaw, false);
            
            const xIndex = xLabels.indexOf(xFormatted);
            const yIndex = yLabels.indexOf(yFormatted);
            
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
            zsmooth: false,  
            zmin: 0,  // Set minimum value to zero
            zauto: false,  // Disable automatic z scale calculation
            colorbar: {
                title: 'Количество',
                titleside: 'right'
            }
        };
    };
    
    // Layout configuration for the Plotly chart
    const layout = {
        title: {
            text: `Распределение субботников: ${getAxisLabel(xDimension)} / ${getAxisLabel(yDimension)}`,
            font: { size: 16 }
        },
        xaxis: {
            title: {
                text: getAxisLabel(xDimension),
                font: { size: 14, color: '#333' },
                standoff: 15
            },
            tickangle: -45,
            type: 'category',
            tickfont: { size: 10 },
            automargin: true
        },
        yaxis: {
            title: {
                text: getAxisLabel(yDimension),
                font: { size: 14, color: '#333' },
                standoff: 15
            },
            type: 'category',
            tickfont: { size: 10 },
            automargin: true
        },
        autosize: true,
        margin: {
            l: 150,  // Increased for long y labels
            r: 50,
            b: 150,  // Increased for long x labels
            t: 60,
            pad: 4
        },
        height: 500,
    };

    // Add hover text for the plot to show full labels
    const getHoverText = () => {
        if (!data || !data.contents || data.contents.length === 0) {
            return [[]];
        }
        
        const isXDate = dateFields.includes(xDimension);
        const isYDate = dateFields.includes(yDimension);
        
        // Create labels matrix for hover text
        const yLabels = Array.from(new Set(data.contents.map(item => 
            formatDateString(String(item.y_label), isYDate)
        )));
        
        const xLabels = Array.from(new Set(data.contents.map(item => 
            formatDateString(String(item.x_label), isXDate)
        )));
        
        // Create empty matrix for hover text
        const hoverMatrix = Array(yLabels.length).fill(0).map(() => 
            Array(xLabels.length).fill(''));
        
        // Fill hover text matrix
        data.contents.forEach(item => {
            const xFormatted = formatDateString(String(item.x_label), isXDate);
            const yFormatted = formatDateString(String(item.y_label), isYDate);
            
            const xIndex = xLabels.indexOf(xFormatted);
            const yIndex = yLabels.indexOf(yFormatted);
            
            if (xIndex !== -1 && yIndex !== -1) {
                hoverMatrix[yIndex][xIndex] = 
                    `${getAxisLabel(xDimension)}: ${xFormatted}<br>` +
                    `${getAxisLabel(yDimension)}: ${yFormatted}<br>` +
                    `Количество: ${item.count}`;
            }
        });
        
        return hoverMatrix;
    };

    // Update plotData to include hover text
    const plotData = [{
        ...processHeatmapDataForPlotly(),
        hoverinfo: 'text',
        text: getHoverText()
    }];

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
            sx={{ '& .MuiDialog-paper': { overflowX: 'hidden' } }}
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
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Paper sx={{ width: '100%', bgcolor: '#f8f8f8', borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
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