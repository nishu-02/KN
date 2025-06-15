from django.db.models import F, Func, FloatField, ExpressionWrapper, Value
from math import radians, cos, sin, acos
from ngo.models import NGO

class Radian(Func):
    function = 'RADIANS'
    template = '%(function)s(%(expressions)s)'

def get_nearby_ngos(lat, lon, radius_km=5):
    R = 6371.0
    return NGO.objects.annotate(
        distance=ExpressionWrapper(
            R * acos(
                cos(Radians(value(lat))) *
                cos(Radians(F('latitude'))) *
                cos(Radians(F('longitude'))) - Radians(value(lon)) + 
                sin(Radians(value(lat))) *
                sin(Radians(F('latitude')))
            ),
            output_field=FloatField()
        )
    ).filter(distance_lte=radius_km, verified=True)

from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance

def get_nearby_reports(lat, lon, radius_km=5):
    return InjuryReport.objects.filter(
        status='pending',
        latitude__gte=lat - 0.05,
        latitude__lte=lat + 0.05,
        longitude__gte=lon - 0.05,
        longitude__lte=lon + 0.05,
    )