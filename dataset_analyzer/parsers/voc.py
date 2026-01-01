import xml.etree.ElementTree as ET
from pathlib import Path
from .base import BaseParser
from ..models import ImageInfo, BoundingBox, DatasetFormat

class VOCParser(BaseParser):
    @property
    def format(self) -> DatasetFormat:
        return DatasetFormat.VOC
    
    def detect(self) -> bool:
        annotations_dir = self.dataset_path / "Annotations"
        if annotations_dir.exists():
            return any(f.suffix == ".xml" for f in annotations_dir.iterdir())
        return any(self.dataset_path.glob("**/*.xml"))
    
    def _find_annotations_dir(self) -> Path:
        annotations_dir = self.dataset_path / "Annotations"
        if annotations_dir.exists():
            return annotations_dir
        return self.dataset_path
    
    def _find_images_dir(self) -> Path:
        for name in ["JPEGImages", "images", "imgs"]:
            path = self.dataset_path / name
            if path.exists():
                return path
        return self.dataset_path
    
    def _load_splits(self) -> dict[str, list[str]]:
        splits = {}
        imagesets_dir = self.dataset_path / "ImageSets" / "Main"
        
        if imagesets_dir.exists():
            for split_file in imagesets_dir.glob("*.txt"):
                split_name = split_file.stem
                if split_name in ["train", "val", "test", "trainval"]:
                    image_ids = [line.strip().split()[0] for line in split_file.read_text().splitlines() if line.strip()]
                    splits[split_name] = image_ids
                    if split_name not in self.splits:
                        self.splits.append(split_name)
        
        return splits
    
    def parse(self) -> None:
        annotations_dir = self._find_annotations_dir()
        images_dir = self._find_images_dir()
        splits = self._load_splits()
        
        image_to_split = {}
        for split_name, image_ids in splits.items():
            for img_id in image_ids:
                image_to_split[img_id] = split_name
        
        for xml_file in annotations_dir.glob("*.xml"):
            try:
                tree = ET.parse(xml_file)
                root = tree.getroot()
            except Exception:
                continue
            
            filename = root.findtext("filename", "")
            img_id = xml_file.stem
            
            size = root.find("size")
            if size is None:
                continue
            
            width = int(size.findtext("width", "0"))
            height = int(size.findtext("height", "0"))
            
            if width == 0 or height == 0:
                continue
            
            filepath = self._resolve_image_path(images_dir, filename, img_id)
            split = image_to_split.get(img_id)
            
            image_info = ImageInfo(
                id=img_id,
                filename=filename,
                filepath=str(filepath),
                width=width,
                height=height,
                split=split,
                annotations=[]
            )
            
            for obj in root.findall("object"):
                class_name = obj.findtext("name", "unknown")
                if class_name not in self.classes:
                    self.classes.append(class_name)
                
                bndbox = obj.find("bndbox")
                if bndbox is None:
                    continue
                
                xmin = float(bndbox.findtext("xmin", "0"))
                ymin = float(bndbox.findtext("ymin", "0"))
                xmax = float(bndbox.findtext("xmax", "0"))
                ymax = float(bndbox.findtext("ymax", "0"))
                
                bbox = BoundingBox(
                    x=xmin / width,
                    y=ymin / height,
                    width=(xmax - xmin) / width,
                    height=(ymax - ymin) / height,
                    class_name=class_name,
                    confidence=None
                )
                image_info.annotations.append(bbox)
            
            self.images[img_id] = image_info
    
    def _resolve_image_path(self, images_dir: Path, filename: str, img_id: str) -> Path:
        if filename:
            direct = images_dir / filename
            if direct.exists():
                return direct
        
        for ext in [".jpg", ".jpeg", ".png", ".bmp"]:
            candidate = images_dir / f"{img_id}{ext}"
            if candidate.exists():
                return candidate
        
        return images_dir / (filename or f"{img_id}.jpg")
