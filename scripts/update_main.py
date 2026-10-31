import os

with open('backend/main.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace imports
old_imp = """from fastapi import FastAPI, HTTPException, Request, Response, WebSocket, WebSocketDisconnect, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse"""

new_imp = """import os
from fastapi import FastAPI, HTTPException, Request, Response, WebSocket, WebSocketDisconnect, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles"""

if old_imp in text:
    text = text.replace(old_imp, new_imp)
else:
    print("WARNING: old_imp not found directly, checking normalized...")
    # Normalize CRLF
    text_norm = text.replace("\r\n", "\n")
    old_imp_norm = old_imp.replace("\r\n", "\n")
    if old_imp_norm in text_norm:
        text = text_norm.replace(old_imp_norm, new_imp.replace("\r\n", "\n"))

# Add static mounts before if __name__ == "__main__":
static_code = """
# -------------------------------------------------------------
# Static Frontend Serving (Station Master Portal & Field App)
# -------------------------------------------------------------
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
PORTAL_DIR = os.path.join(STATIC_DIR, "portal")
FIELD_DIR = os.path.join(STATIC_DIR, "field")

# 1. Mount Field App at /field
if os.path.isdir(FIELD_DIR):
    app.mount("/field", StaticFiles(directory=FIELD_DIR, html=True), name="field-app")

# 2. Mount Portal assets and images at root
if os.path.isdir(PORTAL_DIR):
    portal_assets = os.path.join(PORTAL_DIR, "assets")
    if os.path.isdir(portal_assets):
        app.mount("/assets", StaticFiles(directory=portal_assets), name="portal-assets")

    portal_images = os.path.join(PORTAL_DIR, "images")
    if os.path.isdir(portal_images):
        app.mount("/images", StaticFiles(directory=portal_images), name="portal-images")

    @app.get("/", include_in_schema=False)
    async def serve_root_portal():
        return FileResponse(os.path.join(PORTAL_DIR, "index.html"))

    @app.get("/favicon.svg", include_in_schema=False)
    async def serve_favicon():
        fav = os.path.join(PORTAL_DIR, "favicon.svg")
        if os.path.isfile(fav):
            return FileResponse(fav)
        raise HTTPException(status_code=404)

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_portal_fallback(full_path: str):
        if full_path.startswith(("api/", "ws/", "docs", "redoc", "openapi.json", "healthz", "field")):
            raise HTTPException(status_code=404, detail="Not Found")
        file_candidate = os.path.join(PORTAL_DIR, full_path)
        if os.path.isfile(file_candidate):
            return FileResponse(file_candidate)
        return FileResponse(os.path.join(PORTAL_DIR, "index.html"))


if __name__ == "__main__":
"""

if 'if __name__ == "__main__":' in text:
    text = text.replace('if __name__ == "__main__":', static_code.strip() + "\n\nif __name__ == \"__main__\":")
    with open('backend/main.py', 'w', encoding='utf-8') as f:
        f.write(text)
    print("SUCCESS: backend/main.py updated!")
else:
    print("ERROR: could not find if __name__ == '__main__':")

