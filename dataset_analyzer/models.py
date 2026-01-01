from pydantic import BaseModel
from typing import Optional
from enum import Enum

class DatasetFormat(str, Enum):
    COCO = "coco"
    YOLO = "yolo"
    VOC = "voc"

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    class_name: str
    confidence: Optional[float] = None

class ImageInfo(BaseModel):
    id: str
    filename: str
    filepath: str
    width: int
    height: int
    split: Optional[str] = None
    annotations: list[BoundingBox] = []

class DatasetInfo(BaseModel):
    name: str
    path: str
    format: DatasetFormat
    total_images: int
    total_annotations: int
    classes: list[str]
    splits: list[str]

class DatasetStats(BaseModel):
    total_images: int
    total_annotations: int
    total_classes: int
    avg_boxes_per_image: float
    empty_images: int
    class_distribution: dict[str, int]
    
class BoxStats(BaseModel):
    size_distribution: list[int]
    aspect_ratio_distribution: list[int]
    small_count: int
    medium_count: int
    large_count: int
    boxes_per_image: dict[str, float]
    tiny_boxes: int

class ImageStats(BaseModel):
    min_width: int
    max_width: int
    min_height: int
    max_height: int
    avg_width: float
    avg_height: float
    formats: dict[str, int]
    color_modes: dict[str, int]
    brightness_mean: float
    brightness_std: float

class SpatialStats(BaseModel):
    heatmap: list[list[float]]
    edge_proximity: dict[str, float]
    per_class_heatmaps: dict[str, list[list[float]]]
