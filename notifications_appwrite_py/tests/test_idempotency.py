from src.core.idempotency import make_idempotency_key_for_report, make_idempotency_key_for_application

def test_idempotency_keys():
    assert make_idempotency_key_for_report('r1') == 'report:r1'
    assert make_idempotency_key_for_application('a1') == 'application:a1'
