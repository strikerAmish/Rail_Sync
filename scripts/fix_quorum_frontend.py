with open('frontend/src/components/RightActionPane.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace lines 252-288 where Station Master granted override or moved alone
old_logic = """    if (role === 'STATION_MASTER') {
      // Station Master granting final master seal confirms statutory clearances
      for (const reqRole of ['TPC', 'SECTION_CONTROLLER'] as ApprovalRole[]) {
        const stkIdx = updatedStks.findIndex(s => s.role === reqRole);
        if (stkIdx >= 0) {
          updatedStks[stkIdx] = {
            ...updatedStks[stkIdx],
            approval_status: 'APPROVED',
            signed_at: nowIso,
            signature_hash: sigHash,
          };
        }
      }
    }

    const approverRoles = ['STATION_MASTER', 'SECTION_CONTROLLER', 'TPC'];
    const approvers = updatedStks.filter(s => approverRoles.includes(s.role));
    const allApproversDone = approvers.length > 0 && approvers.every(s => s.approval_status === 'APPROVED');

    let updatedEvent: OperationalEvent = {
      ...event,
      stakeholders: updatedStks,
    };

    // Once all permissions are granted (or Station Master grants seal):
    // Automatically advance to Stage 6 (Active on Track) so it immediately moves to Ongoing Work!
    if (allApproversDone || role === 'STATION_MASTER') {
      updatedEvent.fsm_stage = 6;
      updatedEvent.status = 'ACTIVE_IN_PROGRESS';
      updatedEvent.status_color = '#DC2626';
      updatedEvent.station_actions = {
        ...(updatedEvent.station_actions || {}),
        power_cut_granted: true,
        traffic_block_granted: true,
        points_clamped_confirmed: true,
      };
    } else {
      // Partial approval: advance to Stage 4 (Awaiting Approval)
      updatedEvent.fsm_stage = Math.max(updatedEvent.fsm_stage || 2, 4);
      updatedEvent.status = 'AWAITING_APPROVAL';
      updatedEvent.status_color = '#F59E0B';
    }"""

new_logic = """    // Strict Multi-Party Statutory Quorum: All 3 roles must sign individually
    const requiredRoles = ['TPC', 'SECTION_CONTROLLER', 'STATION_MASTER'];
    const hasTpc = updatedStks.some(s => s.role === 'TPC' && s.approval_status === 'APPROVED');
    const hasCtrl = updatedStks.some(s => s.role === 'SECTION_CONTROLLER' && s.approval_status === 'APPROVED');
    const hasSm = updatedStks.some(s => s.role === 'STATION_MASTER' && s.approval_status === 'APPROVED');
    const allApproversDone = hasTpc && hasCtrl && hasSm;

    let updatedEvent: OperationalEvent = {
      ...event,
      stakeholders: updatedStks,
    };

    // Only move to Ongoing Work (Stage 6: ACTIVE_IN_PROGRESS) when ALL 3 officers have approved!
    if (allApproversDone) {
      updatedEvent.fsm_stage = 6;
      updatedEvent.status = 'ACTIVE_IN_PROGRESS';
      updatedEvent.status_color = '#DC2626';
      updatedEvent.station_actions = {
        ...(updatedEvent.station_actions || {}),
        power_cut_granted: true,
        traffic_block_granted: true,
        points_clamped_confirmed: true,
      };
    } else {
      // Still waiting for remaining officers: stays in Stage 4 (Pending Approvals)
      updatedEvent.fsm_stage = 4;
      updatedEvent.status = 'AWAITING_APPROVAL';
      updatedEvent.status_color = '#F59E0B';
    }"""

if old_logic in code:
    code = code.replace(old_logic, new_logic)
    with open('frontend/src/components/RightActionPane.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Strict multi-party quorum enforced in RightActionPane.tsx!")
else:
    # Try normalizing CRLF
    code_norm = code.replace('\r\n', '\n')
    old_norm = old_logic.replace('\r\n', '\n')
    if old_norm in code_norm:
        code_norm = code_norm.replace(old_norm, new_logic.replace('\r\n', '\n'))
        with open('frontend/src/components/RightActionPane.tsx', 'w', encoding='utf-8') as f:
            f.write(code_norm)
        print("Strict multi-party quorum enforced with normalized line endings!")
    else:
        print("ERROR: old_logic not matched!")
