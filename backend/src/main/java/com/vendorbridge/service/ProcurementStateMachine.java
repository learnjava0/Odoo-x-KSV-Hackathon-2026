package com.vendorbridge.service;

import com.vendorbridge.model.ActivityLog;
import com.vendorbridge.model.User;
import com.vendorbridge.model.enums.ProcurementState;
import com.vendorbridge.model.enums.Role;
import com.vendorbridge.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProcurementStateMachine {

    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public void transitionState(ProcurementState current, ProcurementState next, User actor, String entityType, String entityId, String remarks, String eventType) {
        if (!isValidTransition(current, next, actor.getRole())) {
            throw new RuntimeException("Invalid state transition from " + current + " to " + next + " for role " + actor.getRole() + 
                ". Business rule constraint violated.");
        }

        // Append-only audit log rule: Log entries are NEVER deleted or modified.
        // This append-only structure matters for procurement audit trails because it provides an immutable
        // timeline of who approved what and when, ensuring full legal and financial compliance without tampering risk.
        ActivityLog log = new ActivityLog();
        log.setEventId(UUID.randomUUID().toString());
        log.setEventType(eventType);
        log.setActorId(actor.getId());
        log.setActorName(actor.getEmail());
        log.setActorRole(actor.getRole().name());
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setPreviousState(current != null ? current.name() : null);
        log.setNewState(next.name());
        log.setRemarks(remarks);
        log.setTimestamp(LocalDateTime.now());
        
        activityLogRepository.save(log);
    }

    private boolean isValidTransition(ProcurementState current, ProcurementState next, Role actorRole) {
        if (current == null && next == ProcurementState.DRAFT) return true;
        if (current == ProcurementState.DRAFT && next == ProcurementState.PUBLISHED) return true;
        if (current == ProcurementState.PUBLISHED && next == ProcurementState.UNDER_REVIEW) return true;
        if (current == ProcurementState.UNDER_REVIEW && next == ProcurementState.UNDER_REVIEW) {
            return actorRole == Role.VENDOR;
        }
        
        if (current == ProcurementState.UNDER_REVIEW && next == ProcurementState.PENDING_APPROVAL) return true;
        
        // Only MANAGER role can perform PENDING_APPROVAL -> APPROVED/REJECTED/REVISION_REQUESTED
        if (current == ProcurementState.PENDING_APPROVAL) {
            if (actorRole != Role.MANAGER && actorRole != Role.ADMIN) return false;
            return next == ProcurementState.APPROVED || next == ProcurementState.REJECTED || next == ProcurementState.REVISION_REQUESTED;
        }
        
        // Only PROCUREMENT_OFFICER can perform REVISION_REQUESTED -> PENDING_APPROVAL
        if (current == ProcurementState.REVISION_REQUESTED && next == ProcurementState.PENDING_APPROVAL) {
            return actorRole == Role.PROCUREMENT_OFFICER;
        }
        
        if (current == ProcurementState.APPROVED && next == ProcurementState.FULFILLED) return true;
        if (current == ProcurementState.APPROVED && next == ProcurementState.APPROVED) {
            return actorRole == Role.MANAGER || actorRole == Role.ADMIN;
        }

        return false;
    }
}
