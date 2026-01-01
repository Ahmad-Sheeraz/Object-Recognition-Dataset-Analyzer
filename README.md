# Dataset Analyzer

A lightweight tool designed to help you analyze and understand object detection datasets without unnecessary complexity.

Many existing solutions are paid, require uploading data to the cloud, or come with bloated features that add friction rather than value. This repository does one thing well: it helps you inspect and reason about your object detection data.

By gaining better visibility into your dataset, you can:

-> Improve dataset collection and preprocessing

-> Diagnose failure cases on specific data subsets

-> Train more robust and reliable models

The setup is intentionally minimal, so you can get started quickly and focus on what actually matters: your data and your model’s performance.

## Features

- **Auto-detect** COCO, YOLO, Pascal VOC formats
- **Statistics** — class distribution, bounding box analysis, spatial heatmaps
- **Data Explorer** — browse images, view annotations, filter by class/split
- **Local Processing** — images stay on your disk, nothing uploaded

## Preview

![demo](https://github.com/user-attachments/assets/d80ad90e-b6f1-4c8a-bbb7-7d202dd88b5f)


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
