import argparse
import webbrowser
import uvicorn
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Dataset Analyzer")
    parser.add_argument("path", nargs="?", help="Path to dataset directory")
    parser.add_argument("--port", type=int, default=5151, help="Port to run server on")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind to")
    parser.add_argument("--no-browser", action="store_true", help="Don't open browser")
    
    args = parser.parse_args()
    
    if args.path:
        dataset_path = Path(args.path).resolve()
        if not dataset_path.exists():
            print(f"Error: Path does not exist: {args.path}")
            return 1
        
        from .core import dataset
        try:
            info = dataset.load(str(dataset_path))
            print(f"Loaded {info.format.value.upper()} dataset: {info.name}")
            print(f"  Images: {info.total_images}")
            print(f"  Annotations: {info.total_annotations}")
            print(f"  Classes: {len(info.classes)}")
        except Exception as e:
            print(f"Error loading dataset: {e}")
            return 1
    
    url = f"http://{args.host}:{args.port}"
    print(f"\nStarting server at {url}")
    
    if not args.no_browser:
        webbrowser.open(url)
    
    uvicorn.run(
        "dataset_analyzer.server:app",
        host=args.host,
        port=args.port,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
