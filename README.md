# Dataset Analyzer

A minimal, retro-styled object detection dataset analysis tool.

## Features

- **Auto-detect** COCO, YOLO, Pascal VOC formats
- **Statistics** — class distribution, bounding box analysis, spatial heatmaps
- **Data Explorer** — browse images, view annotations, filter by class/split
- **Local Processing** — images stay on your disk, nothing uploaded
- **Dark/Light Mode** — retro terminal aesthetic

## Setup

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/dataset-analyzer.git
cd dataset-analyzer
```

### 2. Install Python Dependencies

**Using uv (recommended):**
```bash
uv sync
```

**Using pip:**
```bash
pip install -r requirements.txt
```

### 3. Build Frontend

```bash
cd dataset_analyzer/frontend
npm install
npm run build
cd ../..
```

### 4. Run

**Using uv:**
```bash
uv run python -m dataset_analyzer.cli
```

**Using pip:**
```bash
python -m dataset_analyzer.cli
```

Browser opens at `http://localhost:5151`

### Run with Dataset Path

```bash
python -m dataset_analyzer.cli /path/to/your/dataset
```

## Supported Formats

| COCO | YOLO | Pascal VOC |
|------|------|------------|
| `annotations/*.json` | `labels/*.txt` | `Annotations/*.xml` |
| `images/*.jpg` | `images/*.jpg` | `JPEGImages/*.jpg` |
| | `data.yaml` | |

## License

MIT
