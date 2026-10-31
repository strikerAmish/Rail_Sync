"""
RailSync - Database Persistence & Transactional Outbox Engine
Implements PostgreSQL 15 DDL Schemas with ACID local persistence and transactional outbox.
Seeds initial railway corridor and operational events.
"""

import sqlite3
import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from pathlib import Path


DB_FILE = Path(__file__).parent / "railsync.db"


def get_db_connection():
    conn = sqlite3.connect(str(DB_FILE), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Table: operational_events
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS operational_events (
        id TEXT PRIMARY KEY,
        division VARCHAR(50) NOT NULL,
        section VARCHAR(100) NOT NULL,
        track_id VARCHAR(50) NOT NULL,
        km_start REAL NOT NULL,
        km_end REAL NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
        requested_start TEXT NOT NULL,
        requested_end TEXT NOT NULL,
        fencing_token INTEGER UNIQUE,
        impact_vector TEXT NOT NULL,
        description TEXT NOT NULL,
        originator_id VARCHAR(50) NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Table: event_stakeholders
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS event_stakeholders (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL REFERENCES operational_events(id) ON DELETE CASCADE,
        department VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL,
        officer_id VARCHAR(50) NOT NULL,
        approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        signature_hash VARCHAR(64),
        signed_at TEXT,
        rejection_reason TEXT
    );
    """)

    # 3. Table: statutory_permits
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS statutory_permits (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL REFERENCES operational_events(id) ON DELETE CASCADE,
        permit_type VARCHAR(30) NOT NULL,
        earthing_discharged BOOLEAN DEFAULT 0,
        power_tripped BOOLEAN DEFAULT 0,
        points_clamped BOOLEAN DEFAULT 0,
        issued_at TEXT DEFAULT CURRENT_TIMESTAMP,
        officer_id VARCHAR(50) NOT NULL,
        notes TEXT
    );
    """)

    # 4. Table: transactional_outbox (Atomic Local Outbox -> CDC -> Redis Mesh)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactional_outbox (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        payload TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'COMMITTED',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 5. Table: idempotency_cache
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS idempotency_cache (
        idempotency_key TEXT PRIMARY KEY,
        response_payload TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Safe migration: ensure new columns exist in operational_events
    for col in ["field_photo", "piggybacked_depts", "station_actions", "digital_permit"]:
        try:
            cursor.execute(f"ALTER TABLE operational_events ADD COLUMN {col} TEXT;")
        except Exception:
            pass

    conn.commit()

    # Purge legacy corridor data if present so database matches frontend
    cursor.execute("SELECT COUNT(*) as cnt FROM operational_events WHERE division = 'NGP' OR section LIKE '%Wardha%'")
    old_cnt = cursor.fetchone()["cnt"]
    if old_cnt > 0:
        cursor.execute("DELETE FROM statutory_permits")
        cursor.execute("DELETE FROM event_stakeholders")
        cursor.execute("DELETE FROM operational_events")
        cursor.execute("DELETE FROM transactional_outbox")
        conn.commit()

    # Seed all corridor operational events if not present
    seed_all_corridor_events(cursor)
    conn.commit()

    conn.close()


def seed_all_corridor_events(cursor):
    seed_file = Path(__file__).parent / "seed_events.json"
    if not seed_file.exists():
        return

    with open(seed_file, "r", encoding="utf-8") as f:
        events = json.load(f)

    for e in events:
        eid = e["id"]
        cursor.execute("SELECT id FROM operational_events WHERE id = ?", (eid,))
        if cursor.fetchone():
            continue

        token = e.get("fencing_token")
        if token is not None:
            cursor.execute("SELECT id FROM operational_events WHERE fencing_token = ? AND id != ?", (token, eid))
            if cursor.fetchone():
                token = None

        impact = e.get("impact_vector", {})
        cursor.execute("""
        INSERT INTO operational_events (
            id, division, section, track_id, km_start, km_end, status,
            requested_start, requested_end, fencing_token, impact_vector,
            description, originator_id, field_photo, piggybacked_depts,
            station_actions, digital_permit, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            eid,
            e.get("division", "DNR"),
            e.get("section", "Danapur–Patna Junction"),
            e.get("track_id", "UP_MAIN"),
            float(e.get("km_start", 544.1)),
            float(e.get("km_end", 545.8)),
            e.get("status", "AWAITING_APPROVAL"),
            e.get("requested_start", datetime.now(timezone.utc).isoformat()),
            e.get("requested_end", datetime.now(timezone.utc).isoformat()),
            token,
            json.dumps(impact),
            e.get("description", ""),
            e.get("originator_id", "SSE_OHE_DNR_04"),
            json.dumps(e.get("field_photo")) if e.get("field_photo") else None,
            json.dumps(e.get("piggybacked_depts")) if e.get("piggybacked_depts") else None,
            json.dumps(e.get("station_actions")) if e.get("station_actions") else None,
            json.dumps(e.get("digital_permit")) if e.get("digital_permit") else None,
            e.get("created_at", datetime.now(timezone.utc).isoformat()),
            e.get("updated_at", datetime.now(timezone.utc).isoformat()),
        ))

        # Seed stakeholders
        for s in e.get("stakeholders", []):
            stk_id = s.get("id", str(uuid.uuid4()))
            cursor.execute("SELECT id FROM event_stakeholders WHERE id = ?", (stk_id,))
            if not cursor.fetchone():
                cursor.execute("""
                INSERT INTO event_stakeholders (
                    id, event_id, department, role, officer_id, approval_status, signature_hash, signed_at, rejection_reason
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    stk_id,
                    eid,
                    s.get("department", "OPERATING"),
                    s.get("role", "STATION_MASTER"),
                    s.get("officer_id", "SM_PNBE_01"),
                    s.get("approval_status", "PENDING"),
                    s.get("signature_hash"),
                    s.get("signed_at"),
                    s.get("rejection_reason"),
                ))

        # Seed permits
        for p in e.get("permits", []):
            pmt_id = p.get("id", str(uuid.uuid4()))
            cursor.execute("SELECT id FROM statutory_permits WHERE id = ?", (pmt_id,))
            if not cursor.fetchone():
                cursor.execute("""
                INSERT INTO statutory_permits (
                    id, event_id, permit_type, earthing_discharged, power_tripped, points_clamped, issued_at, officer_id, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    pmt_id,
                    eid,
                    p.get("permit_type", "FORM3_PTW"),
                    1 if p.get("earthing_discharged") else 0,
                    1 if p.get("power_tripped") else 0,
                    1 if p.get("points_clamped") else 0,
                    p.get("issued_at", datetime.now(timezone.utc).isoformat()),
                    p.get("officer_id", "SM_PNBE_01"),
                    p.get("notes", ""),
                ))


# Initialize the database immediately
init_db()

