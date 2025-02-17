import os
import sys

from dotenv import load_dotenv

from aioarango import ArangoClient
import aioarango.exceptions
from aioarango.database import StandardDatabase

from typing import Optional, Any
from aioarango.typings import Json, Jsons


dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

ARANGO_HOST = os.getenv("ARANGO_HOST")
ARANGO_PORT = os.getenv("ARANGO_PORT")
ARANGO_DB = os.getenv("ARANGO_DB")
ARANGO_USER = os.getenv("ARANGO_USER")
ARANGO_PASS = os.getenv("ARANGO_PASS")

class ArangoDatabaseClient:
    def __init__(self):
        self.client = ArangoClient(hosts=f"http://{ARANGO_HOST}:{ARANGO_PORT}")
        self.db: StandardDatabase = None

    async def connect(self) -> None:
        try:
            system_db = await self.client.db("_system", username=ARANGO_USER, password=ARANGO_PASS)
        except aioarango.exceptions.ServerConnectionError as e:
            sys.exit(1)

        # Создаем базу, если её нет
        if not await system_db.has_database(ARANGO_DB):
            await system_db.create_database(ARANGO_DB)
            print(f"База '{ARANGO_DB}' успешно создана.")
        else:
            print(f"База '{ARANGO_DB}' уже существует.")

        # Подключаемся к базе
        try:
            self.db = await self.client.db(ARANGO_DB, username=ARANGO_USER, password=ARANGO_PASS, verify=True)
        except aioarango.exceptions.ServerConnectionError as e:
            sys.exit(1)

        print(f"Подключение к базе '{ARANGO_DB}' прошло успешно.")

    async def close(self):
        await self.client.close()
        print("Подключение к базе данных закрыто.")

    async def has_collection(self, collection_name: str) -> bool:
        return await self.db.has_collection(collection_name)

    async def create_collection(self, collection_name: str) -> bool:
        if await self.db.has_collection(collection_name):
            print(f"Коллекция '{collection_name}' уже существует.")
            return False

        await self.db.create_collection(collection_name)
        print(f"Коллекция '{collection_name}' успешна создана.")
        return True

    async def delete_collection(self, collection_name: str) -> bool:
        if not await self.db.has_collection(collection_name):
            print(f"Коллекции '{collection_name}' не существует.")
            return False

        await self.db.delete_collection(collection_name)
        print(f"Коллекция '{collection_name}' успешна удалена.")
        return True

    async def get_all_documents_from_collection(self, collection_name: str) -> Optional[Jsons]:
        if not await self.has_collection(collection_name):
            print(f"Коллекции {collection_name} не существует.")
            return None

        collection = self.db.collection(collection_name)

        cursor = await collection.all()

        documents = [document async for document in cursor]

        return documents

    async def insert_documents_to_collection(self, collection_name: str, documents: Jsons) -> bool:
        if not await self.has_collection(collection_name):
            print(f"Коллекции {collection_name} не существует.")
            return False

        collection = self.db.collection(collection_name)

        try:
            await collection.insert_many(documents, overwrite=True, silent=True)
        except aioarango.exceptions.DocumentInsertError as e:
            print(f"Не удалось провести вставку в коллекцию {collection_name}:\n{e}")
            return False

        print(f"Запись в {collection_name} прошла успешно.")
        return True

    async def get_document_by_key(self, collection_name: str, document_key: str) -> Optional[Json]:
        if not await self.has_collection(collection_name):
            print(f"Коллекции {collection_name} не существует.")
            return None

        collection = self.db.collection(collection_name)

        return await collection.get(document_key)

    async def update_document_by_key(self, collection_name: str, document_key: str, new_document: Json) -> bool:
        if not await self.has_collection(collection_name):
            print(f"Коллекции {collection_name} не существует.")
            return False

        collection = self.db.collection(collection_name)

        new_document.update({"_key": document_key})

        try:
            await collection.update(new_document, silent=True)
        except aioarango.exceptions.DocumentUpdateError as e:
            print(f"Не удалось провести обновление документа {document_key} в коллекции {collection_name}:\n{e}")
            return False

        print(f"Обновление документа {document_key} в {collection_name} прошло успешно.")
        return True

    async def delete_document_by_key(self, collection_name: str, document_key: str) -> bool:
        if not await self.has_collection(collection_name):
            print(f"Коллекции {collection_name} не существует.")
            return False

        collection = self.db.collection(collection_name)

        try:
            await collection.delete(document_key, silent=True)
        except aioarango.exceptions.DocumentDeleteError as e:
            print(f"Не удалось провести удаление документа {document_key} из коллекции {collection_name}:\n{e}")
            return False

        print(f"Удаление документа {document_key} из {collection_name} прошло успешно.")
        return True

    async def find_documents_by_fields(self, collection_name: str, filter: dict[str, Any]) -> Optional[Jsons]:
        if not await self.has_collection(collection_name):
            print(f"Коллекции {collection_name} не существует.")
            return None

        collection = self.db.collection(collection_name)

        cursor = await collection.find(filter)

        return [document async for document in cursor]

    async def find_documents_keys_by_fields(self, collection_name: str, filter: dict) -> Optional[list[str]]:
        documents = await self.find_documents_by_fields(collection_name, filter)

        if documents is None:
            return None

        return [document["_key"] for document in documents]
