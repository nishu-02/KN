from src.core.geo import haversine_km, bounding_box

def test_haversine_basic():
    d = haversine_km(0,0,0,1)
    assert d > 110


def test_bounding_box_contains_center():
    box = bounding_box(12.9716,77.5946,5)
    assert box['min_lat'] < 12.9716
    assert box['max_lat'] > 12.9716
