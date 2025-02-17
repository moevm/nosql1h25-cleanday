import os
from dotenv import load_dotenv

import pytest_asyncio
import pytest

dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

from arangodb_client import ArangoDatabaseClient

@pytest_asyncio.fixture(scope="function")
async def db_client():
    client = ArangoDatabaseClient()
    await client.connect()
    yield client
    await client.close()

collection_name = "test_collection"

@pytest.mark.asyncio
async def test_create_non_existing_collection(db_client):
    if await db_client.has_collection(collection_name):
        await db_client.delete_collection(collection_name)

    assert await db_client.has_collection(collection_name) is False

    creation_result = await db_client.create_collection(collection_name)
    assert creation_result is True

    assert await db_client.has_collection(collection_name) is True

@pytest.mark.asyncio
async def test_create_existing_collection(db_client):
    if not await db_client.has_collection(collection_name):
        await db_client.create_collection(collection_name)

    assert await db_client.has_collection(collection_name) is True

    creation_result = await db_client.create_collection(collection_name)
    assert creation_result is False

@pytest.mark.asyncio
async def test_insert_documents_to_existing_collection(db_client):
    if not await db_client.has_collection(collection_name):
        await db_client.create_collection(collection_name)

    assert await db_client.has_collection(collection_name) is True

    documents = [{"_key": "1", "name": "Andrew", "age": 30},
                 {"_key": "2", "name": "Anton", "age": 20},
                 {"_key": "3", "name": "Egor", "age": 21}]

    insertion_result = await db_client.insert_documents_to_collection(collection_name, documents)
    assert insertion_result is True

    result_documents = await db_client.get_all_documents_from_collection(collection_name)
    for i, result_document in enumerate(result_documents):
        assert (result_document["_key"] == documents[i]["_key"]
                and result_document["name"] == documents[i]["name"]
                and result_document["age"] == documents[i]["age"])

@pytest.mark.asyncio
async def test_insert_documents_to_non_existing_collection(db_client):
    non_existing_collection_name = "non_existing_collection"

    if await db_client.has_collection(non_existing_collection_name):
        await db_client.delete_collection(non_existing_collection_name)

    assert await db_client.has_collection(non_existing_collection_name) is False

    documents = [{"_key": "7", "name": "Gleb", "age": 15},
                 {"_key": "8", "name": "Max", "age": 44},
                 {"_key": "9", "name": "Ilya", "age": 19}]

    insertion_result = await db_client.insert_documents_to_collection(non_existing_collection_name, documents)
    assert insertion_result is False

    result_documents = await db_client.get_all_documents_from_collection(non_existing_collection_name)
    assert result_documents is None

@pytest.mark.asyncio
async def test_update_document_with_known_key(db_client):
    if not await db_client.has_collection(collection_name):
        await db_client.create_collection(collection_name)

    assert await db_client.has_collection(collection_name) is True

    document = {"_key": "123", "name": "Aleksandr", "age": 20}

    updated_data = {"name": "Kirill"}

    insertion_result = await db_client.insert_documents_to_collection(collection_name, [document])
    assert insertion_result is True

    update_result = await db_client.update_document_by_key(collection_name, "123", updated_data)
    assert update_result is True

    result_document = await db_client.get_document_by_key(collection_name, "123")
    assert result_document["name"] == "Kirill"

@pytest.mark.asyncio
async def test_delete_existing_document(db_client):
    if not await db_client.has_collection(collection_name):
        await db_client.create_collection(collection_name)

    assert await db_client.has_collection(collection_name) is True

    document = {"_key": "123", "name": "Aleksandr", "age": 20}

    insertion_result = await db_client.insert_documents_to_collection(collection_name, [document])
    assert insertion_result is True

    assert await db_client.get_document_by_key(collection_name, "123") is not None

    deletion_result = await db_client.delete_document_by_key(collection_name, "123")
    assert deletion_result is True

    result_document = await db_client.get_document_by_key(collection_name, "123")
    assert result_document is None

@pytest.mark.asyncio
async def test_delete_non_existing_document(db_client):
    if not await db_client.has_collection(collection_name):
        await db_client.create_collection(collection_name)

    assert await db_client.has_collection(collection_name) is True

    if await db_client.get_document_by_key(collection_name, "doc_key") is not None:
        await db_client.delete_document_by_key(collection_name, "doc_key")

    assert await db_client.get_document_by_key(collection_name, "doc_key") is None

    deletion_result = await db_client.delete_document_by_key(collection_name, "doc_key")
    assert deletion_result is False

@pytest.mark.asyncio
async def test_find_existing_document(db_client):
    if not await db_client.has_collection(collection_name):
        await db_client.create_collection(collection_name)

    assert await db_client.has_collection(collection_name) is True

    document = {"_key": "111", "name": "Andrew", "age": 30}
    document_key = "111"

    if await db_client.get_document_by_key(collection_name, document_key) is None:
        await db_client.insert_documents_to_collection(collection_name, [document])

    assert await db_client.get_document_by_key(collection_name, document_key) is not None

    search_result = await db_client.find_documents_by_fields(collection_name, {"name": "Andrew", "age": 30})
    assert search_result is not None and len(search_result) > 0

@pytest.mark.asyncio
async def test_find_non_existing_document(db_client):
    if not await db_client.has_collection(collection_name):
        await db_client.create_collection(collection_name)

    assert await db_client.has_collection(collection_name) is True

    document = { "_key": "cghgvjb", "name": "Aleksey", "age": 30 }
    document_key = "cghgvjb"

    if await db_client.get_document_by_key(collection_name, document_key) is not None:
        await db_client.delete_document_by_key(collection_name, document_key)

    assert await db_client.get_document_by_key(collection_name, document_key) is None

    search_result = await db_client.find_documents_by_fields(collection_name, {"name": "Aleksey", "age": 30})
    assert search_result is not None and len(search_result) == 0
