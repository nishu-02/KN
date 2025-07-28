import requests

def reverse_geocode(lat, lon):
    """
    Get a human-readable address from latitude and longitude using OpenStreetMap Nominatim API.
    Free for low-volume use. For production, consider self-hosting or a paid provider.
    """
    url = f'https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json'
    headers = {'User-Agent': 'KarunaNidhan/1.0'}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get('display_name')
        return None
    except Exception as e:
        return None

