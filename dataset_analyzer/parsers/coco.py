import json
from pathlib import Path
from .base import BaseParser
from ..models import ImageInfo, BoundingBox, DatasetFormat

class COCOParser(BaseParser):
    @property
    def format(self) -> DatasetFormat:
        return DatasetFormat.COCO
    
    def detect(self) -> bool:
        annotations_dir = self.dataset_path / "annotations"
        if annotations_dir.exists():
            return any(f.suffix == ".json" for f in annotations_dir.iterdir())
        return any(self.dataset_path.glob("*.json"))
    
    def _find_annotation_files(self) -> list[Path]:
        annotations_dir = self.dataset_path / "annotations"
        if annotations_dir.exists():
            return list(annotations_dir.glob("*.json"))
        return list(self.dataset_path.glob("*.json"))
    
    def _find_images_dir(self) -> Path:
        for name in ["images", "train", "val", "test", "train2017", "val2017"]:
            path = self.dataset_path / name
            if path.exists():
                return path
        return self.dataset_path
    
    def parse(self) -> None:
        annotation_files = self._find_annotation_files()
        images_dir = self._find_images_dir()
        
        category_map = {}
        
        for ann_file in annotation_files:
            split_name = ann_file.stem.replace("instances_", "").replace("_annotations", "")
            if split_name not in self.splits:
                self.splits.append(split_name)
            
            with open(ann_file) as f:
                data = json.load(f)
            
            for cat in data.get("categories", []):
                category_map[cat["id"]] = cat["name"]
                if cat["name"] not in self.classes:
                    self.classes.append(cat["name"])
            
            image_map = {}
            for img in data.get("images", []):
                img_id = str(img["id"])
                filepath = self._resolve_image_path(images_dir, img["file_name"], split_name)
                
                image_info = ImageInfo(
                    id=img_id,
                    filename=img["file_name"],
                    filepath=str(filepath),
                    width=img["width"],
                    height=img["height"],
                    split=split_name,
                    annotations=[]
                )
                image_map[img["id"]] = image_info
                self.images[img_id] = image_info
            
            for ann in data.get("annotations", []):
                if ann["image_id"] not in image_map:
                    continue
                
                img_info = image_map[ann["image_id"]]
                x, y, w, h = ann["bbox"]
                
                bbox = BoundingBox(
                    x=x / img_info.width,
                    y=y / img_info.height,
                    width=w / img_info.width,
                    height=h / img_info.height,
                    class_name=category_map.get(ann["category_id"], "unknown"),
                    confidence=ann.get("score")
                )
                img_info.annotations.append(bbox)
    
    def _resolve_image_path(self, images_dir: Path, filename: str, split: str) -> Path:
        direct = images_dir / filename
        if direct.exists():
            return direct
        
        split_path = images_dir / split / filename
        if split_path.exists():
            return split_path
        
        for subdir in images_dir.iterdir():
            if subdir.is_dir():
                candidate = subdir / filename
                if candidate.exists():
                    return candidate
        
        return direct
