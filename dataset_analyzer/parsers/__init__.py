from pathlib import Path
from .base import BaseParser
from .coco import COCOParser
from .yolo import YOLOParser
from .voc import VOCParser

PARSERS = [COCOParser, YOLOParser, VOCParser]

def detect_format(dataset_path: Path) -> BaseParser | None:
    for parser_class in PARSERS:
        parser = parser_class(dataset_path)
        if parser.detect():
            return parser
    return None

def get_parser(dataset_path: Path) -> BaseParser:
    parser = detect_format(dataset_path)
    if parser is None:
        raise ValueError(f"Could not detect dataset format at {dataset_path}")
    return parser

__all__ = ["BaseParser", "COCOParser", "YOLOParser", "VOCParser", "detect_format", "get_parser"]
