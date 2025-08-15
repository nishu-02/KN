import math

R = 6371.0  # Earth radius in km

def haversine_km(lat1, lng1, lat2, lng2):
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


def bounding_box(lat, lng, radius_km):
    lat_delta = (radius_km / R) * (180.0 / math.pi)
    lng_delta = lat_delta / math.cos(math.radians(lat))
    return {
        'min_lat': lat - lat_delta,
        'max_lat': lat + lat_delta,
        'min_lng': lng - lng_delta,
        'max_lng': lng + lng_delta,
    }
