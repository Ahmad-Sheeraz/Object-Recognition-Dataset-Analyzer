from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Optional

from .core import dataset
from .models import DatasetInfo, ImageInfo, DatasetStats, BoxStats, ImageStats, SpatialStats
from .parsers import detect_format

app = FastAPI(title="Dataset Analyzer", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).parent / "frontend" / "dist"

@app.get("/api/browse")
async def browse_directory(path: Optional[str] = None):
    if path is None or path == "":
        path = str(Path.home())
    
    target = Path(path).resolve()
    
    if not target.exists():
        raise HTTPException(status_code=404, detail="Path not found")
    
    if not target.is_dir():
        raise HTTPException(status_code=400, detail="Path is not a directory")
    
    folders = []
    detected_datasets = {}
    
    try:
        for item in sorted(target.iterdir()):
            if item.name.startswith('.'):
                continue
            if item.is_dir():
                folders.append(item.name)
                parser = detect_format(item)
                if parser:
                    detected_datasets[item.name] = parser.format.value.upper()
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    return {
        "current_path": str(target),
        "parent_path": str(target.parent) if target.parent != target else None,
        "folders": folders,
        "detected_datasets": detected_datasets
    }

@app.post("/api/dataset/load")
async def load_dataset(path: str) -> DatasetInfo:
    try:
        return dataset.load(path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset/info")
async def get_dataset_info() -> DatasetInfo:
    if not dataset.is_loaded:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    return DatasetInfo(
        name=Path(dataset.parser.dataset_path).name,
        path=str(dataset.parser.dataset_path),
        format=dataset.parser.format,
        total_images=len(dataset.parser.images),
        total_annotations=sum(len(img.annotations) for img in dataset.parser.images.values()),
        classes=dataset.parser.classes,
        splits=dataset.parser.splits
    )

@app.get("/api/stats/overview")
async def get_overview_stats() -> DatasetStats:
    if not dataset.is_loaded:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    return dataset.get_dataset_stats()

@app.get("/api/stats/boxes")
async def get_box_stats() -> BoxStats:
    if not dataset.is_loaded:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    return dataset.get_box_stats()

@app.get("/api/stats/images")
async def get_image_stats() -> ImageStats:
    if not dataset.is_loaded:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    return dataset.get_image_stats()

@app.get("/api/stats/spatial")
async def get_spatial_stats() -> SpatialStats:
    if not dataset.is_loaded:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    return dataset.get_spatial_stats()

@app.get("/api/images")
async def get_images(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    class_filter: Optional[str] = None,
    split_filter: Optional[str] = None,
    min_boxes: Optional[int] = None,
    max_boxes: Optional[int] = None
) -> dict:
    if not dataset.is_loaded:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    images, total = dataset.get_images(
        page=page,
        limit=limit,
        class_filter=class_filter,
        split_filter=split_filter,
        min_boxes=min_boxes,
        max_boxes=max_boxes
    )
    
    return {
        "images": images,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@app.get("/api/images/{image_id}")
async def get_image(image_id: str) -> ImageInfo:
    if not dataset.is_loaded:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    image = dataset.get_image(image_id)
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return image

@app.get("/api/images/{image_id}/file")
async def get_image_file(image_id: str):
    if not dataset.is_loaded:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    image = dataset.get_image(image_id)
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    
    filepath = Path(image.filepath)
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Image file not found")
    
    return FileResponse(filepath, media_type=f"image/{filepath.suffix.lstrip('.')}")

@app.get("/api/classes")
async def get_classes() -> list[str]:
    if not dataset.is_loaded:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    return dataset.parser.classes

@app.get("/api/splits")
async def get_splits() -> list[str]:
    if not dataset.is_loaded:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    return dataset.parser.splits

if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = FRONTEND_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIR / "index.html")
