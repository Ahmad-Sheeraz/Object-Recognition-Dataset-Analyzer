from pathlib import Path
from typing import Optional
from .parsers import get_parser, BaseParser
from .stats import StatsCalculator
from .models import DatasetInfo, ImageInfo, DatasetStats, BoxStats, ImageStats, SpatialStats

class Dataset:
    def __init__(self):
        self.parser: Optional[BaseParser] = None
        self.stats_calculator: Optional[StatsCalculator] = None
        self._dataset_stats: Optional[DatasetStats] = None
        self._box_stats: Optional[BoxStats] = None
        self._image_stats: Optional[ImageStats] = None
        self._spatial_stats: Optional[SpatialStats] = None
    
    def load(self, path: str) -> DatasetInfo:
        dataset_path = Path(path).resolve()
        if not dataset_path.exists():
            raise ValueError(f"Path does not exist: {path}")
        
        self.parser = get_parser(dataset_path)
        self.parser.parse()
        self.stats_calculator = StatsCalculator(self.parser.get_images())
        
        self._dataset_stats = None
        self._box_stats = None
        self._image_stats = None
        self._spatial_stats = None
        
        return DatasetInfo(
            name=dataset_path.name,
            path=str(dataset_path),
            format=self.parser.format,
            total_images=len(self.parser.images),
            total_annotations=sum(len(img.annotations) for img in self.parser.images.values()),
            classes=self.parser.classes,
            splits=self.parser.splits
        )
    
    @property
    def is_loaded(self) -> bool:
        return self.parser is not None
    
    def get_images(
        self,
        page: int = 1,
        limit: int = 50,
        class_filter: Optional[str] = None,
        split_filter: Optional[str] = None,
        min_boxes: Optional[int] = None,
        max_boxes: Optional[int] = None
    ) -> tuple[list[ImageInfo], int]:
        if not self.is_loaded:
            return [], 0
        
        images = self.parser.get_images()
        
        if class_filter:
            images = [img for img in images if any(ann.class_name == class_filter for ann in img.annotations)]
        
        if split_filter:
            images = [img for img in images if img.split == split_filter]
        
        if min_boxes is not None:
            images = [img for img in images if len(img.annotations) >= min_boxes]
        
        if max_boxes is not None:
            images = [img for img in images if len(img.annotations) <= max_boxes]
        
        total = len(images)
        start = (page - 1) * limit
        end = start + limit
        
        return images[start:end], total
    
    def get_image(self, image_id: str) -> Optional[ImageInfo]:
        if not self.is_loaded:
            return None
        return self.parser.get_image(image_id)
    
    def get_dataset_stats(self) -> DatasetStats:
        if not self.is_loaded:
            raise ValueError("No dataset loaded")
        if self._dataset_stats is None:
            self._dataset_stats = self.stats_calculator.compute_dataset_stats()
        return self._dataset_stats
    
    def get_box_stats(self) -> BoxStats:
        if not self.is_loaded:
            raise ValueError("No dataset loaded")
        if self._box_stats is None:
            self._box_stats = self.stats_calculator.compute_box_stats()
        return self._box_stats
    
    def get_image_stats(self) -> ImageStats:
        if not self.is_loaded:
            raise ValueError("No dataset loaded")
        if self._image_stats is None:
            self._image_stats = self.stats_calculator.compute_image_stats()
        return self._image_stats
    
    def get_spatial_stats(self) -> SpatialStats:
        if not self.is_loaded:
            raise ValueError("No dataset loaded")
        if self._spatial_stats is None:
            self._spatial_stats = self.stats_calculator.compute_spatial_stats()
        return self._spatial_stats

dataset = Dataset()
