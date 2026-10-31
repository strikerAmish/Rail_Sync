import os
import zipfile
from pathlib import Path

backend_dir = Path("backend")
output_zip = Path("backend-deploy.zip")

print("Packaging backend into backend-deploy.zip...")

# Files/folders to exclude
exclude_dirs = {"__pycache__", ".pytest_cache", ".git", ".venv", "venv"}
exclude_extensions = {".pyc", ".pyo"}

count = 0
with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(backend_dir):
        # Filter out directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext in exclude_extensions:
                continue
            full_path = Path(root) / file
            # Relative path inside the zip file (must be relative to backend_dir!)
            rel_path = full_path.relative_to(backend_dir)
            zf.write(full_path, arcname=str(rel_path).replace("\\", "/"))
            count += 1

print(f"Successfully created {output_zip} with {count} files! Size: {output_zip.stat().st_size / 1024:.2f} KB")
