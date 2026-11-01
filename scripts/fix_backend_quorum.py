with open('backend/routers/events.py', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove automatic cascade approval in Station Master block
old_sm_cascade = """        # Station Master final seal confirms the entire statutory quorum
        cur.execute(\"\"\"
        UPDATE event_stakeholders
        SET approval_status = 'APPROVED', signature_hash = ?, signed_at = ?
        WHERE event_id = ? AND role IN ('TPC', 'SECTION_CONTROLLER') AND approval_status != 'APPROVED'
        \"\"\", (sig_hash, now, event_id))"""

new_sm_cascade = """        # Station Master signs their seal; does NOT automatically sign for TPC or Section Controller"""

# 2. Strict check: ALL required roles must be approved
old_advance = """    approver_roles = ["STATION_MASTER", "SECTION_CONTROLLER", "TPC"]
    approvers = [s for s in all_stks if s["role"] in approver_roles]
    all_approved = len(approvers) > 0 and all(s["approval_status"] == "APPROVED" for s in approvers)

    new_status = event_row["status"]
    if (all_approved or payload.role == ApprovalRole.STATION_MASTER) and payload.decision == ApprovalStatus.APPROVED:"""

new_advance = """    # Strict multi-officer statutory quorum: all 3 must have formally approved
    has_tpc = any(s["role"] == "TPC" and s["approval_status"] == "APPROVED" for s in all_stks)
    has_ctrl = any(s["role"] == "SECTION_CONTROLLER" and s["approval_status"] == "APPROVED" for s in all_stks)
    has_sm = any(s["role"] == "STATION_MASTER" and s["approval_status"] == "APPROVED" for s in all_stks)
    all_approved = has_tpc and has_ctrl and has_sm

    new_status = event_row["status"]
    if all_approved and payload.decision == ApprovalStatus.APPROVED:"""

if old_sm_cascade in code:
    code = code.replace(old_sm_cascade, new_sm_cascade)
    print("Cleaned up SM cascade in events.py")
else:
    # Normalized
    code_norm = code.replace('\r\n', '\n')
    if old_sm_cascade.replace('\r\n', '\n') in code_norm:
        code_norm = code_norm.replace(old_sm_cascade.replace('\r\n', '\n'), new_sm_cascade)
        code = code_norm
        print("Cleaned up SM cascade (normalized)")

if old_advance in code:
    code = code.replace(old_advance, new_advance)
    print("Strict backend quorum check applied")
else:
    code_norm = code.replace('\r\n', '\n')
    if old_advance.replace('\r\n', '\n') in code_norm:
        code_norm = code_norm.replace(old_advance.replace('\r\n', '\n'), new_advance)
        code = code_norm
        print("Strict backend quorum check applied (normalized)")

with open('backend/routers/events.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("backend/routers/events.py successfully updated!")
