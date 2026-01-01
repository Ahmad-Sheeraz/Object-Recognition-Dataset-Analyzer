import numpy as np
from PIL import Image
from pathlib import Path
from collections import defaultdict
from .models import ImageInfo, DatasetStats, BoxStats, ImageStats, SpatialStats

class StatsCalculator:
    def __init__(self, images: list[ImageInfo]):
        self.images = images
    
    def compute_dataset_stats(self) -> DatasetStats:
        total_annotations = sum(len(img.annotations) for img in self.images)
        empty_images = sum(1 for img in self.images if len(img.annotations) == 0)
        
        class_counts = defaultdict(int)
        for img in self.images:
            for ann in img.annotations:
                class_counts[ann.class_name] += 1
        
        avg_boxes = total_annotations / len(self.images) if self.images else 0
        
        return DatasetStats(
            total_images=len(self.images),
            total_annotations=total_annotations,
            total_classes=len(class_counts),
            avg_boxes_per_image=round(avg_boxes, 2),
            empty_images=empty_images,
            class_distribution=dict(sorted(class_counts.items(), key=lambda x: -x[1]))
        )
    
    def compute_box_stats(self) -> BoxStats:
        areas = []
        aspect_ratios = []
        boxes_per_image = []
        tiny_count = 0
        small_count = 0
        medium_count = 0
        large_count = 0
        
        for img in self.images:
            boxes_per_image.append(len(img.annotations))
            
            for ann in img.annotations:
                pixel_w = ann.width * img.width
                pixel_h = ann.height * img.height
                area = pixel_w * pixel_h
                areas.append(area)
                
                if pixel_h > 0:
                    aspect_ratios.append(pixel_w / pixel_h)
                
                if pixel_w < 16 or pixel_h < 16:
                    tiny_count += 1
                
                if area < 32 * 32:
                    small_count += 1
                elif area < 96 * 96:
                    medium_count += 1
                else:
                    large_count += 1
        
        size_hist = self._compute_histogram(areas, bins=20) if areas else []
        ar_hist = self._compute_histogram(aspect_ratios, bins=15, range_limit=(0, 3)) if aspect_ratios else []
        
        bpi_array = np.array(boxes_per_image) if boxes_per_image else np.array([0])
        
        return BoxStats(
            size_distribution=size_hist,
            aspect_ratio_distribution=ar_hist,
            small_count=small_count,
            medium_count=medium_count,
            large_count=large_count,
            boxes_per_image={
                "min": int(bpi_array.min()),
                "max": int(bpi_array.max()),
                "avg": round(float(bpi_array.mean()), 1),
                "median": int(np.median(bpi_array))
            },
            tiny_boxes=tiny_count
        )
    
    def compute_image_stats(self, sample_size: int = 100) -> ImageStats:
        widths = [img.width for img in self.images]
        heights = [img.height for img in self.images]
        
        formats = defaultdict(int)
        for img in self.images:
            ext = Path(img.filename).suffix.lower().lstrip(".")
            formats[ext] += 1
        
        sample_images = self.images[:sample_size]
        brightness_values = []
        color_modes = defaultdict(int)
        
        for img_info in sample_images:
            try:
                with Image.open(img_info.filepath) as img:
                    color_modes[img.mode] += 1
                    gray = img.convert("L")
                    brightness_values.extend(list(gray.getdata()))
            except Exception:
                continue
        
        brightness_array = np.array(brightness_values) if brightness_values else np.array([128])
        
        return ImageStats(
            min_width=min(widths) if widths else 0,
            max_width=max(widths) if widths else 0,
            min_height=min(heights) if heights else 0,
            max_height=max(heights) if heights else 0,
            avg_width=round(np.mean(widths), 1) if widths else 0,
            avg_height=round(np.mean(heights), 1) if heights else 0,
            formats=dict(formats),
            color_modes=dict(color_modes),
            brightness_mean=round(float(brightness_array.mean()), 1),
            brightness_std=round(float(brightness_array.std()), 1)
        )
    
    def compute_spatial_stats(self, grid_size: int = 10) -> SpatialStats:
        heatmap = np.zeros((grid_size, grid_size))
        per_class_heatmaps = defaultdict(lambda: np.zeros((grid_size, grid_size)))
        
        edge_counts = {"top": 0, "bottom": 0, "left": 0, "right": 0, "center": 0}
        total_boxes = 0
        
        for img in self.images:
            for ann in img.annotations:
                cx = ann.x + ann.width / 2
                cy = ann.y + ann.height / 2
                
                gx = min(int(cx * grid_size), grid_size - 1)
                gy = min(int(cy * grid_size), grid_size - 1)
                
                heatmap[gy, gx] += 1
                per_class_heatmaps[ann.class_name][gy, gx] += 1
                
                total_boxes += 1
                
                threshold = 0.05
                if ann.y < threshold:
                    edge_counts["top"] += 1
                elif ann.y + ann.height > 1 - threshold:
                    edge_counts["bottom"] += 1
                elif ann.x < threshold:
                    edge_counts["left"] += 1
                elif ann.x + ann.width > 1 - threshold:
                    edge_counts["right"] += 1
                else:
                    edge_counts["center"] += 1
        
        if heatmap.max() > 0:
            heatmap = heatmap / heatmap.max()
        
        edge_pct = {k: round(v / total_boxes * 100, 1) if total_boxes > 0 else 0 for k, v in edge_counts.items()}
        
        class_heatmaps_normalized = {}
        for class_name, h in per_class_heatmaps.items():
            if h.max() > 0:
                h = h / h.max()
            class_heatmaps_normalized[class_name] = h.tolist()
        
        return SpatialStats(
            heatmap=heatmap.tolist(),
            edge_proximity=edge_pct,
            per_class_heatmaps=class_heatmaps_normalized
        )
    
    def _compute_histogram(self, values: list, bins: int = 20, range_limit: tuple = None) -> list[int]:
        if not values:
            return [0] * bins
        
        arr = np.array(values)
        if range_limit:
            arr = arr[(arr >= range_limit[0]) & (arr <= range_limit[1])]
        
        if len(arr) == 0:
            return [0] * bins
        
        hist, _ = np.histogram(arr, bins=bins)
        max_val = hist.max() if hist.max() > 0 else 1
        return [int(v / max_val * 100) for v in hist]
