import os
import subprocess
import tempfile
import zipfile
from typing import Annotated

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from api.cleanday import static_cleanday_repo
from api.user import static_user_repo
from auth.service import get_current_user
from config.environment import ARANGO_ROOT_PASSWORD, DATABASE_NAME
from data.query import UserHeatmapQuery, HeatmapResponse, CleandayHeatmapQuery
from repo.client import database
from repo.model import RepoStats
from repo.stat_repo import StatRepo


def dump_and_zip_arango_db(db_name: str,
                           username: str = "root",
                           password: str = ARANGO_ROOT_PASSWORD,
                           endpoint: str = "tcp://db:8529"):
    # Use TemporaryDirectory for dump folder (auto cleanup)
    with tempfile.TemporaryDirectory() as dump_dir:
        # Run arangodump
        result = subprocess.run([
            "arangodump",
            "--server.endpoint", endpoint,
            "--server.username", username,
            "--server.password", password,
            "--server.database", db_name,
            "--output-directory", dump_dir,
            "--overwrite", "true"
        ], capture_output=True, text=True)

        if result.returncode != 0:
            raise RuntimeError(f"arangodump failed: {result.stderr}")

        # Create a temp file for the zip archive
        fd, zip_path = tempfile.mkstemp(suffix=".zip")
        os.close(fd)  # Close the low-level file descriptor

        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(dump_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, dump_dir)
                    zipf.write(file_path, arcname)

        return zip_path  # Return path of zip file (dump_dir is already cleaned)


router = APIRouter(prefix="/stats", tags=["stats"],
                   dependencies=[Depends(get_current_user)])


static_stats_repo = StatRepo(database)


@router.get("/")
async def get_stats() -> RepoStats:
    return static_stats_repo.get_stats()


@router.post("/import")
async def import_db(
    file: UploadFile = File(...)
):
    # Only allow zip files (optional check)
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only zip files are supported")

    # Create temp files/dirs
    fd, tmp_zip_path = tempfile.mkstemp(suffix=".zip")
    os.close(fd)  # Close low-level fd

    try:
        # Save uploaded zip file to temp location
        with open(tmp_zip_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Extract zip to temp directory
        with tempfile.TemporaryDirectory() as extract_dir:
            # Validate zip file
            try:
                with zipfile.ZipFile(tmp_zip_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_dir)
            except zipfile.BadZipFile:
                raise HTTPException(status_code=400, detail="Invalid zip file format")

            # Run arangorestore
            result = subprocess.run([
                "arangorestore",
                "--server.endpoint", "tcp://db:8529",
                "--server.username", "root",
                "--server.password", ARANGO_ROOT_PASSWORD,
                "--input-directory", extract_dir,
                "--server.database", DATABASE_NAME,
                "--overwrite", "true"
            ], capture_output=True, text=True)

            print(result.stdout)

            if result.returncode != 0:
                raise HTTPException(status_code=500, detail=f"Database restore failed: {result.stderr}")

        return {"message": "Database restored successfully"}

    except Exception as e:
        # Catch any other exceptions
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        if os.path.exists(tmp_zip_path):
            os.remove(tmp_zip_path)


@router.get("/export/")
async def export_db() -> StreamingResponse:
    try:
        zip_path = dump_and_zip_arango_db(DATABASE_NAME)

        def iterfile():
            with open(zip_path, mode="rb") as file_like:
                while True:
                    chunk = file_like.read(4096)
                    if not chunk:
                        break
                    yield chunk
            os.remove(zip_path)  # Delete zip after streaming is done

        return StreamingResponse(iterfile(),
                                 media_type="application/zip",
                                 headers={"Content-Disposition": "attachment; filename=arangodump.zip"})

    except Exception as e:
        raise HTTPException(detail=str(e), status_code=500)


@router.get("/user-heatmap")
async def get_users_graph(query: Annotated[UserHeatmapQuery, Query()]) -> HeatmapResponse:
    res = static_user_repo.get_heatmap(query.x_field, query.y_field, query)

    return HeatmapResponse(data=res)


@router.get("/cleanday-heatmap")
async def get_cleanday_heatmap(query: Annotated[CleandayHeatmapQuery, Query()]) -> HeatmapResponse:
    res = static_cleanday_repo.get_heatmap(query.x_field, query.y_field, query)

    return HeatmapResponse(data=res)
