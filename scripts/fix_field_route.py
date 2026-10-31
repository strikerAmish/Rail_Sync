with open('backend/main.py', 'r', encoding='utf-8') as f:
    text = f.read()

target = 'if os.path.isdir(FIELD_DIR):\n    app.mount("/field", StaticFiles(directory=FIELD_DIR, html=True), name="field-app")'

replacement = '''if os.path.isdir(FIELD_DIR):
    @app.get("/field", include_in_schema=False)
    async def serve_field_root():
        return FileResponse(os.path.join(FIELD_DIR, "index.html"))

    app.mount("/field", StaticFiles(directory=FIELD_DIR, html=True), name="field-app")'''

if target in text:
    text = text.replace(target, replacement)
    with open('backend/main.py', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Added /field handler!")
else:
    print("Could not find target in backend/main.py")

