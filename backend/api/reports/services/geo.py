from django.db.models import F, Func, FloatField, ExpressionWrapper, Value
from ngo.models import NGO
from reports.models import InjuryReport
from volunteers.models import Volunteer

class Radian(Func):
    function = 'RADIANS'
    template = '%(function)s(%(expressions)s)'

class Cos(Func):
    function = 'COS'
    template = '%(function)s(%(expressions)s)'

class Sin(Func):
    function = 'SIN'
    template = '%(function)s(%(expressions)s)'

class Acos(Func):
    function = 'ACOS'
    template = '%(function)s(%(expressions)s)'

def get_nearby_ngos(lat, lon, radius_km=5):
    R = 6371.0
    return NGO.objects.annotate(
        distance=ExpressionWrapper(
            R * Acos(
                Cos(Radian(Value(lat))) *
                Cos(Radian(F('latitude'))) *
                Cos(Radian(F('longitude')) - Radian(Value(lon))) +
                Sin(Radian(Value(lat))) *
                Sin(Radian(F('latitude')))
            ),
            output_field=FloatField()
        )
    ).filter(distance__lte=radius_km, verified=True)

def get_nearby_reports(lat, lon, radius_km=5):
    return InjuryReport.objects.filter(
        status='pending',
        latitude__gte=lat - 0.05,
        latitude__lte=lat + 0.05,
        longitude__gte=lon - 0.05,
        longitude__lte=lon + 0.05,
    )

def get_nearby_volunteers(lat, lon, radius_km=5):
    R = 6371.0
    return Volunteer.objects.filter(is_active=True).annotate(
        distance=ExpressionWrapper(
            R * Acos(
                Cos(Radian(Value(lat))) *
                Cos(Radian(F('latitude'))) *
                Cos(Radian(F('longitude')) - Radian(Value(lon))) +
                Sin(Radian(Value(lat))) *
                Sin(Radian(F('latitude')))
            ),
            output_field=FloatField()
        )
    ).filter(distance__lte=radius_km)