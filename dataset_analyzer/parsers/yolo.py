from pathlib import Path
from PIL import Image
from .base import BaseParser
from ..models import ImageInfo, BoundingBox, DatasetFormat

class YOLOParser(BaseParser):
    @property
    def format(self) -> DatasetFormat:
        return DatasetFormat.YOLO
    
    def detect(self) -> bool:
        has_yaml = any(self.dataset_path.glob("*.yaml")) or any(self.dataset_path.glob("*.yml"))
        has_classes = (self.dataset_path / "classes.txt").exists()
        has_labels = (self.dataset_path / "labels").exists()
        return has_labels and (has_yaml or has_classes)
    
    def _load_classes(self) -> list[str]:
        classes_file = self.dataset_path / "classes.txt"
        if classes_file.exists():
            return [line.strip() for line in classes_file.read_text().splitlines() if line.strip()]
        
        for yaml_file in list(self.dataset_path.glob("*.yaml")) + list(self.dataset_path.glob("*.yml")):
            content = yaml_file.read_text()
            if "names:" in content:
                import re
                names_match = re.search(r"names:\s*\[(.*?)\]", content)
                if names_match:
                    return [n.strip().strip("'\"") for n in names_match.group(1).split(",")]
                
                lines = content.split("\n")
                in_names = False
                names = []
                for line in lines:
                    if "names:" in line:
                        in_names = True
                        continue
                    if in_names:
                        if line.strip().startswith("-"):
                            names.append(line.strip().lstrip("- ").strip("'\""))
                        elif line.strip() and not line.startswith(" "):
                            break
                if names:
                    return names
        
        return []
    
    def parse(self) -> None:
        self.classes = self._load_classes()
        
        images_dir = self.dataset_path / "images"
        labels_dir = self.dataset_path / "labels"
        
        if not images_dir.exists():
            images_dir = self.dataset_path
        
        split_dirs = [d for d in images_dir.iterdir() if d.is_dir()] or [images_dir]
        
        for split_dir in split_dirs:
            split_name = split_dir.name if split_dir != images_dir else "default"
            if split_name not in self.splits and split_name != "images":
                self.splits.append(split_name)
            
            image_files = list(split_dir.glob("*.jpg")) + list(split_dir.glob("*.jpeg")) + list(split_dir.glob("*.png"))
            
            for img_path in image_files:
                label_path = self._find_label_file(labels_dir, img_path, split_name)
                
                try:
                    with Image.open(img_path) as img:
                        width, height = img.size
                except Exception:
                    continue
                
                img_id = img_path.stem
                image_info = ImageInfo(
                    id=img_id,
                    filename=img_path.name,
                    filepath=str(img_path),
                    width=width,
                    height=height,
                    split=split_name if split_name != "default" else None,
                    annotations=[]
                )
                
                if label_path and label_path.exists():
                    self._parse_label_file(label_path, image_info)
                
                self.images[img_id] = image_info
    
    def _find_label_file(self, labels_dir: Path, img_path: Path, split: str) -> Path | None:
        label_name = img_path.stem + ".txt"
        
        candidates = [
            labels_dir / split / label_name,
            labels_dir / label_name,
            img_path.parent.parent / "labels" / split / label_name,
            img_path.with_suffix(".txt"),
        ]
        
        for candidate in candidates:
            if candidate.exists():
                return candidate
        return None
    
    def _parse_label_file(self, label_path: Path, image_info: ImageInfo) -> None:
        for line in label_path.read_text().splitlines():
            parts = line.strip().split()
            if len(parts) < 5:
                continue
            
            class_id = int(parts[0])
            cx, cy, w, h = map(float, parts[1:5])
            confidence = float(parts[5]) if len(parts) > 5 else None
            
            class_name = self.classes[class_id] if class_id < len(self.classes) else f"class_{class_id}"
            if class_name not in self.classes:
                self.classes.append(class_name)
            
            bbox = BoundingBox(
                x=cx - w / 2,
                y=cy - h / 2,
                width=w,
                height=h,
                class_name=class_name,
                confidence=confidence
            )
            image_info.annotations.append(bbox)
