import * as React from 'react';
import Button from '@mui/material/Button';

function App() {
    const [openModal, setOpenModal] = React.useState(false);
    const [state, setState] = React.useState(false);

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleRegister = (userData: any) => {
        console.log('Данные:', userData);
    };

    return (
        <>
            <Button variant="contained" onClick={handleOpenModal}>
                Кнопка
            </Button>
        </>
    );
}

export default App;