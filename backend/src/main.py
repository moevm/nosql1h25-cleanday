from fastapi import FastAPI, APIRouter

api_router = APIRouter(prefix="/api")

server = FastAPI()
server.include_router(api_router)


class Error:
    """Класс, представляющий информацию об ошибке.

    Attributes:
        type (str): Тип или название ошибки.
        description (str, optional): Описание ошибки.
    """

    def __init__(self, name: str, description: str = None):
        """Инициализирует объект Error.

        Args:
            name (str): Тип или название ошибки.
            description (str, optional): Дополнительное описание ошибки.
        """
        self.type = name
        self.description = description

    def to_dict(self) -> dict:
        """Преобразует объект Error в словарь.

        Returns:
            dict: Словарь с ключами 'type' и 'description'.
        """
        return {'type': self.type, 'description': self.description}


class Result:
    """Класс, представляющий результат выполнения операции.

    Attributes:
        success (bool): Флаг, указывающий на успешность выполнения: 1 - успех, 0 - провал.
        data (Any): Данные, полученные в результате выполнения.
        error (Error, optional): Объект ошибки, если выполнение не удалось.
    """

    def __init__(self, success: bool, data=None, error: Error = None):
        """Инициализирует объект Result.

        Args:
            success (bool): Успешность выполнения: 1 - успех, 0 - провал.
            data (Any, optional): Данные результата.
            error (Error, optional): Информация об ошибке.
        """
        self.success = success
        self.data = data
        self.error = error

    def to_dict(self) -> dict:
        """Преобразует объект Result в словарь.

        Returns:
            dict: Словарь с ключами 'success', 'data', 'error'.
        """
        return {
            'success': self.success,
            'data': self.data,
            'error': self.error.to_dict() if self.error else None
        }


