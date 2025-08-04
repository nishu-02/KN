from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from users.models import VolunteerApplication
from reports.models import InjuryReport, ReportStatusHistory
from .notification_triggers import notification_triggers


@receiver(post_save, sender=VolunteerApplication)
def handle_volunteer_application_save(sender, instance, created, **kwargs):
    """
    Handle volunteer application notifications
    """
    if created:
        # New application submitted
        notification_triggers.notify_volunteer_application_submitted(instance)
    else:
        # Application status updated
        # We need to get the old status from the instance's _state
        if hasattr(instance, '_state') and hasattr(instance._state, 'fields_cache'):
            old_status = instance._state.fields_cache.get('status', 'pending')
            if old_status != instance.status:
                notification_triggers.notify_volunteer_application_status_update(instance, old_status)


@receiver(post_save, sender=InjuryReport)
def handle_injury_report_save(sender, instance, created, **kwargs):
    """
    Handle injury report notifications
    """
    if created:
        # New injury report created
        notification_triggers.notify_new_injury_report(instance)
    else:
        # Report status updated
        if hasattr(instance, '_state') and hasattr(instance._state, 'fields_cache'):
            old_status = instance._state.fields_cache.get('status', 'pending')
            if old_status != instance.status:
                notification_triggers.notify_injury_report_status_change(instance, old_status, instance.status)


@receiver(post_save, sender=ReportStatusHistory)
def handle_report_status_history_save(sender, instance, created, **kwargs):
    """
    Handle report status history notifications
    """
    if created:
        # New status history entry created
        # This is handled by the InjuryReport signal above
        pass


# Additional signal handlers for specific scenarios

@receiver(post_save, sender=InjuryReport)
def handle_ngo_assignment(sender, instance, created, **kwargs):
    """
    Handle NGO assignment notifications
    """
    if not created and instance.ngo_assigned:
        # Check if NGO was just assigned
        if hasattr(instance, '_state') and hasattr(instance._state, 'fields_cache'):
            old_ngo_id = instance._state.fields_cache.get('ngo_assigned_id')
            if old_ngo_id != instance.ngo_assigned_id and instance.ngo_assigned_id:
                notification_triggers.notify_report_assigned_to_ngo(instance, instance.ngo_assigned)


@receiver(post_save, sender=InjuryReport)
def handle_volunteer_assignment(sender, instance, created, **kwargs):
    """
    Handle volunteer assignment notifications
    """
    if not created and instance.volunteer_assigned:
        # Check if volunteer was just assigned
        if hasattr(instance, '_state') and hasattr(instance._state, 'fields_cache'):
            old_volunteer_id = instance._state.fields_cache.get('volunteer_assigned_id')
            if old_volunteer_id != instance.volunteer_assigned_id and instance.volunteer_assigned_id:
                notification_triggers.notify_volunteer_assigned(instance, instance.volunteer_assigned)


# Emergency alert signals for critical situations
@receiver(post_save, sender=InjuryReport)
def handle_emergency_alerts(sender, instance, created, **kwargs):
    """
    Handle emergency alerts for critical injury reports
    """
    if created:
        # Check if this is a critical emergency based on AI analysis
        ai_analysis = instance.ai_analysis or {}
        severity = ai_analysis.get('severity', 'low')
        
        if severity in ['high', 'critical']:
            message = f"🚨 CRITICAL: {severity.upper()} severity injury report at {instance.location}"
            notification_triggers.notify_emergency_alert(instance, message, priority="critical") 