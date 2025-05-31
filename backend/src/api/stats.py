from fastapi import APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/")
async def get_stats() -> dict:
    return {
        "users_count": 0,
        "users_with_cleandays_count": 0,
        "cleandays_total_count": 0,
        "cleandays_completed_count": 0,
        "total_area": 0
    }


@router.post("/import")
async def import_db(file: UploadFile = File(...)) -> None:
    return


@router.get("/export/{file_type}")
async def export_db(file_type: str) -> StreamingResponse:
    return 