// Master ID migration map and helpers for standardized event nomenclature:
// Format: EVT_(dept_name code)_ddmmyy_serial number (4 digit)

export const EVENT_ID_MAPPING: Record<string, string> = {
  "EVT-HIST-2026-00058": "EVT_SAF_280926_0058",
  "EVT-HIST-2026-00062": "EVT_CW_021026_0062",
  "EVT-HIST-2026-00069": "EVT_OHE_031026_0069",
  "EVT-HIST-2026-00075": "EVT_SIG_081026_0075",
  "EVT-HIST-2026-00088": "EVT_OHE_091026_0088",
  "EVT-HIST-2026-00082": "EVT_ENG_121026_0082",
  "EVT-PWY-2026-00116": "EVT_ENG_161026_0116",
  "EVT-ENG-2026-00109": "EVT_ENG_161026_0109",
  "EVT-OHE-2026-00104": "EVT_OHE_161026_0104",
  "EVT-SIG-2026-00114": "EVT_SIG_161026_0114",
  "EVT-OPR-2026-00119": "EVT_OPR_161026_0119",
  "EVT-OHE-2026-00125": "EVT_OHE_161026_0125",
  "EVT-SIG-2026-00122": "EVT_SIG_161026_0122",
  "EVT-SIG-2026-00128": "EVT_SIG_161026_0128",
  "EVT-PWY-2026-00140": "EVT_ENG_161026_0140",
  "EVT-OHE-2026-00144": "EVT_OHE_161026_0144",
  "EVT-OHE-2026-00135": "EVT_OHE_161026_0135",
  "EVT-CW-2026-00155": "EVT_CW_161026_0155",
  "EVT-SAF-2026-00160": "EVT_SAF_161026_0160",
  "EVT-ENG-2026-00132": "EVT_ENG_251026_0132",
  "EVT-OHE-2026-00301": "EVT_OHE_251026_0301",
  "EVT-SIG-2026-00214": "EVT_SIG_251026_0214",
  "99ffc16c-3b95-4ee3-af13-92a6904fed21": "EVT_OHE_251026_0001",
  "e65fa8bd-47d8-400b-8ec4-74456617b0ae": "EVT_OHE_311026_0001",
  "b8c53e6e-2270-4d1b-b7a0-c4325feacc74": "EVT_OHE_311026_0002",
  "EVT-OHE-2026-09999": "EVT_OHE_311026_9999",
  "EVT-OHE-2026-013225": "EVT_OHE_311026_0003"
};

export function migrateEventId(id: string): string {
  if (!id) return id;
  if (EVENT_ID_MAPPING[id]) return EVENT_ID_MAPPING[id];

  const match = id.match(/^EVT-([A-Za-z0-9]+)-(\d{4})-(\d+)$/);
  if (match) {
    let dept = match[1].toUpperCase();
    if (dept === 'HIST' || dept === 'PWY') dept = 'ENG';
    const serial = match[3].slice(-4).padStart(4, '0');
    return `EVT_${dept}_161026_${serial}`;
  }
  return id;
}

export function migrateEventsArray<T extends { id: string; permits?: any[]; stakeholders?: any[] }>(events: T[]): T[] {
  if (!Array.isArray(events)) return [];
  const seenIds = new Set<string>();
  const result: T[] = [];

  for (const e of events) {
    const newId = migrateEventId(e.id);
    if (seenIds.has(newId)) continue;
    seenIds.add(newId);

    const updated: any = { ...e, id: newId };
    if (Array.isArray(updated.permits)) {
      updated.permits = updated.permits.map((p: any) => ({
        ...p,
        event_id: p.event_id ? migrateEventId(p.event_id) : newId,
      }));
    }
    if (Array.isArray(updated.stakeholders)) {
      updated.stakeholders = updated.stakeholders.map((s: any) => ({
        ...s,
        event_id: s.event_id ? migrateEventId(s.event_id) : newId,
      }));
    }
    result.push(updated);
  }
  return result;
}

export function runLocalStorageEventMigration(): void {
  try {
    const keys = ['railsync_events', 'railsync_created_events_v2'];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const migrated = migrateEventsArray(parsed);
            localStorage.setItem(key, JSON.stringify(migrated));
          }
        } catch (_) {}
      }
    }

    const ackKey = 'railsync_acknowledged_events';
    const rawAck = localStorage.getItem(ackKey);
    if (rawAck) {
      try {
        const parsed = JSON.parse(rawAck);
        if (parsed && typeof parsed === 'object') {
          const newAck: Record<string, boolean> = {};
          for (const [k, v] of Object.entries(parsed)) {
            newAck[migrateEventId(k)] = Boolean(v);
          }
          localStorage.setItem(ackKey, JSON.stringify(newAck));
        }
      } catch (_) {}
    }
  } catch (_) {}
}
