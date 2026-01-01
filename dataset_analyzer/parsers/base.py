from abc import ABC, abstractmethod
from pathlib import Path
from ..models import ImageInfo, DatasetFormat

class BaseParser(ABC):
    def __init__(self, dataset_path: Path):
        self.dataset_path = dataset_path
        self.images: dict[str, ImageInfo] = {}
        self.classes: list[str] = []
        self.splits: list[str] = []
    
    @abstractmethod
    def parse(self) -> None:
        pass
    
    @abstractmethod
    def detect(self) -> bool:
        pass
    
    @property
    @abstractmethod
    def format(self) -> DatasetFormat:
        pass
    
    def get_images(self) -> list[ImageInfo]:
        return list(self.images.values())
    
    def get_image(self, image_id: str) -> ImageInfo | None:
        return self.images.get(image_id)
