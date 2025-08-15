def make_idempotency_key_for_report(report_id):
    return f"report:{report_id}"


def make_idempotency_key_for_application(application_id):
    return f"application:{application_id}"
