import sqlite3
import json
from pathlib import Path
from datetime import datetime

DB_PATH = Path("backend/railsync.db")
SEED_PATH = Path("backend/seed_events.json")

# Build mapping from old ID to new EVT_(dept)_(ddmmyy)_(serial)
def get_new_id(old_id, description, originator_id, created_at, counter_dict):
    # Determine department code
    dept = "OHE"
    upper_desc = (description or "").upper()
    upper_orig = (originator_id or "").upper()
    upper_old = old_id.upper()

    if "ENG" in upper_old or "PWAY" in upper_old or "PWY" in upper_old or "PWAY" in upper_orig or "ENG" in upper_orig:
        dept = "ENG"
    elif "SIG" in upper_old or "SIG" in upper_orig or "AXLE" in upper_desc:
        dept = "SIG"
    elif "CW" in upper_old or "CW" in upper_orig or "BRAKE" in upper_desc or "WAGON" in upper_desc:
        dept = "CW"
    elif "SAF" in upper_old or "SAF" in upper_orig or "SAFETY" in upper_desc:
        dept = "SAF"
    elif "OPR" in upper_old or "OPR" in upper_orig or "SM" in upper_orig or "TRAFFIC" in upper_desc:
        dept = "OPR"
    elif "OHE" in upper_old or "OHE" in upper_orig or "CATENARY" in upper_desc or "POWER" in upper_desc:
        dept = "OHE"

    # Determine ddmmyy from created_at or default to 311026
    ddmmyy = "311026"
    if created_at:
        try:
            dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            ddmmyy = dt.strftime("%d%m%y")
        except Exception:
            ddmmyy = "311026"

    # Extract serial number if already present in old_id (e.g. EVT-ENG-2026-00132 -> 0132)
    serial = None
    parts = old_id.split("-")
    if len(parts) >= 3 and parts[-1].isdigit():
        num = int(parts[-1])
        serial = f"{num:04d}"
    else:
        # Assign next sequential serial for this dept and date
        key = f"{dept}_{ddmmyy}"
        counter_dict[key] = counter_dict.get(key, 0) + 1
        serial = f"{counter_dict[key]:04d}"

    return f"EVT_{dept}_{ddmmyy}_{serial}"

def run_migration():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("SELECT id, description, originator_id, created_at FROM operational_events ORDER BY created_at ASC")
    events = c.fetchall()

    counter_dict = {}
    id_map = {}

    for e in events:
        old_id = e["id"]
        new_id = get_new_id(old_id, e["description"], e["originator_id"], e["created_at"], counter_dict)
        id_map[old_id] = new_id
        print(f"Mapping: {old_id}  -->  {new_id}")

    # Temporarily disable foreign keys for update
    c.execute("PRAGMA foreign_keys = OFF;")

    for old_id, new_id in id_map.items():
        if old_id == new_id:
            continue
        c.execute("UPDATE operational_events SET id = ? WHERE id = ?", (new_id, old_id))
        c.execute("UPDATE event_stakeholders SET event_id = ? WHERE event_id = ?", (new_id, old_id))
        c.execute("UPDATE statutory_permits SET event_id = ? WHERE event_id = ?", (new_id, old_id))
        c.execute("UPDATE transactional_outbox SET event_id = ? WHERE event_id = ?", (new_id, old_id))

    c.execute("PRAGMA foreign_keys = ON;")
    conn.commit()
    conn.close()
    print("Database updated successfully.")

    # Update seed_events.json
    if SEED_PATH.exists():
        with open(SEED_PATH, "r", encoding="utf-8") as f:
            seed_data = json.load(f)

        for item in seed_data:
            old_id = item.get("id")
            if old_id in id_map:
                item["id"] = id_map[old_id]
            for stk in item.get("stakeholders", []):
                if stk.get("event_id") in id_map:
                    stk["event_id"] = id_map[stk["event_id"]]
            for pmt in item.get("permits", []):
                if pmt.get("event_id") in id_map:
                    pmt["event_id"] = id_map[pmt["event_id"]]

        with open(SEED_PATH, "w", encoding="utf-8") as f:
            json.dump(seed_data, f, indent=2)
        print("seed_events.json updated successfully.")

    # Save mapping for frontend/mobile migration
    with open("id_mapping.json", "w", encoding="utf-8") as f:
        json.dump(id_map, f, indent=2)
    print("id_mapping.json generated.")

if __name__ == "__main__":
    run_migration()
