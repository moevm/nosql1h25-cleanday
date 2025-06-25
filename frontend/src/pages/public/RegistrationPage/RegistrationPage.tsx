import './RegistrationPage.css';

import * as React from 'react';

import {Link} from "react-router-dom";

import {
    Autocomplete,
    Box,
    Button,
    Container,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
    Toolbar,
    Typography
} from '@mui/material';

import {City} from "@models/City.ts";
import {AuthorizationFormDate} from "@api/authorization/models.ts";
import {useGetRegister} from "@hooks/authorization/useGetRegister.tsx";
import {useGetAllCities} from "@hooks/city/useGetAllCities.tsx";


/**
 * RegistrationPage: Функциональный компонент, представляющий форму регистрации пользователя.
 *
 * @returns {JSX.Element}
 */
const RegistrationPage = (): React.JSX.Element => {
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const staticHelperText = "Пароль должен содержать не менее 8 символов, среди которых не менее 1 цифры, не менее 1 строчной буквы, не менее 1 прописной буквы, не менее 1 специального символа.";

    const [formData, setFormData] = React.useState<AuthorizationFormDate>({
        firstname: '',
        lastname: '',
        login: '',
        city: '',
        gender: 'other',
        password: '',
    });

    const [errors, setErrors] = React.useState({
        firstname: false,
        lastname: false,
        login: false,
        city: false,
        password: '',
    });

    const { data: cities = [], isLoading: isLoadingCities, error: citiesError } = useGetAllCities();

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const {id, value, type, name} = event.target;

        const newValue = type === 'radio'
            ? name === 'gender'
                ? value
                : formData[name as keyof AuthorizationFormDate]
            : type === 'checkbox'
                ? event.target.value
                : value;

        setFormData(prevState => {
            const newFormData = {
                ...prevState,
                [id]: newValue,
            };

            if (id in errors) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    [id]: id === 'password' ? validatePassword(value) : false,
                }));
            }

            return newFormData;
        });
    };

    const handleCityChange = (
        _event: React.SyntheticEvent<Element, Event>, // Обратите внимание на "_event"
        value: City | null
    ) => {
        setFormData(prevState => ({
            ...prevState,
            city: value ? value.name : '',
        }));
    };

    const validatePassword = (password: string | undefined) => {
        if (!password || password.length < 8)
            return "Пароль должен содержать не менее 8 символов.";
        if (!/[0-9]/.test(password))
            return "Пароль должен содержать не менее 1 цифры.";
        if (!/[a-z]/.test(password))
            return "Пароль должен содержать не менее 1 строчной буквы.";
        if (!/[A-Z]/.test(password))
            return "Пароль должен содержать не менее 1 прописной буквы.";
        if (!/[*\-#]/.test(password))
            return "Пароль должен содержать не менее 1 специального символа.";

        return '';
    };

    const {mutate: register, isLoading, isError, error} = useGetRegister();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (formData.password !== confirmPassword) {
            alert("Пароли не совпадают");
            return;
        }

        // Преобразуем данные формы для отправки в useGetRegister
        const registrationData: AuthorizationFormDate = {
            first_name: formData.firstname,
            last_name: formData.lastname,
            login: formData.login,
            sex: formData.gender === 'male' ? 'male' : formData.gender === 'female' ? 'female' : 'other',
            password: formData.password,
            city_id: cities.find(city => city.name === formData.city)?.id || '',
        };

        register(registrationData, {
            onSuccess: () => {
                console.log('RegistrationPage successful!');
                setFormData({
                    firstname: '',
                    lastname: '',
                    login: '',
                    city: '',
                    gender: 'other',
                    password: '',
                });
            },
        });
    };

    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#F85E28FF',
            },
        },
        '& label.Mui-focused': {
            color: '#F85E28FF',
        },
    };

    return (
        <Container className="registration-container">
            <Box className="login-box">
                <Toolbar className="regToolbar">
                    <Box className="toolbarContent">
                        <Typography variant="h2" component="div">
                            Сервис организации субботников
                        </Typography>
                    </Box>
                </Toolbar>
                <form onSubmit={handleSubmit} className="registration-form">
                    <TextField
                        sx={textFieldStyle}
                        required
                        autoFocus
                        id="firstname"
                        label="Имя"
                        variant="outlined"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        sx={textFieldStyle}
                        required
                        id="lastname"
                        label="Фамилия"
                        variant="outlined"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        sx={textFieldStyle}
                        required
                        id="login"
                        label="Логин"
                        variant="outlined"
                        value={formData.login}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <Autocomplete
                        fullWidth
                        sx={textFieldStyle}
                        options={cities}
                        getOptionLabel={(option) => option.name}
                        value={cities.find(city => city.name === formData.city) || null}
                        onChange={handleCityChange}
                        renderInput={(params) => (
                            <TextField {...params} label="Город" variant="outlined" required fullWidth margin="normal"/>
                        )}
                    />
                    <FormControl component="fieldset" className="radio-gender">
                        <FormLabel id="radio-buttons-group">Пол</FormLabel>
                        <RadioGroup
                            aria-label="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            row
                            sx={{color: 'black', borderColor: 'black'}}
                        >
                            <FormControlLabel value="female" control={<Radio id="gender" name="gender"/>}
                                              label="Женский"/>
                            <FormControlLabel value="male" control={<Radio id="gender" name="gender"/>}
                                              label="Мужской"/>
                            <FormControlLabel value="other" control={<Radio id="gender" name="gender"/>}
                                              label="Другое"/>
                        </RadioGroup>
                    </FormControl>
                    <Box width="100%">
                        <TextField
                            sx={textFieldStyle}
                            required
                            id="password"
                            label="Пароль"
                            type="password"
                            variant="outlined"
                            value={formData.password}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.password}
                            helperText={errors.password || staticHelperText}
                        />
                    </Box>
                    <TextField
                        sx={textFieldStyle}
                        required
                        label="Повторите пароль"
                        type="password"
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <Button
                        sx={{
                            backgroundColor: '#F85E28',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#ea5624',
                            },
                            minWidth: '200px',
                        }}
                        type="submit"
                        fullWidth
                        variant="contained"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                    </Button>
                    {isError && (
                        <Typography color="error">
                            Ошибка регистрации: {error?.message || "Произошла неизвестная ошибка."}
                        </Typography>
                    )}
                    <Box className="login-actions">
                        <Button
                            sx={{
                                backgroundColor: '#3C6C5F',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#345e51',
                                },
                                minWidth: '110px',
                            }}
                            fullWidth
                            component={Link}
                            to="/"
                            variant="contained"
                        >
                            На главную
                        </Button>
                        <Button
                            sx={{
                                backgroundColor: '#3C6C5F',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#345e51',
                                },
                                minWidth: '110px',
                            }}
                            fullWidth
                            component={Link}
                            to="/authorization"
                            variant="contained"
                            color="success"
                        >
                            Вход
                        </Button>
                    </Box>
                </form>
                <Box mt={4} display="flex" justifyContent="center">
                    <img src="/basementMenuImage.png" alt="Statistics Page" style={{maxWidth: '70%', height: 'auto'}}/>
                </Box>
            </Box>
        </Container>
    );
};

export default RegistrationPage;