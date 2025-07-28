import re
import magic
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

# Coordinate validation
def validate_coordinates(lat, lon):
    """Validate latitude and longitude coordinates"""
    try:
        lat = float(lat)
        lon = float(lon)
        
        if not (-90 <= lat <= 90):
            raise ValidationError(_('Latitude must be between -90 and 90 degrees'))
        
        if not (-180 <= lon <= 180):
            raise ValidationError(_('Longitude must be between -180 and 180 degrees'))
        
        return lat, lon
    except (ValueError, TypeError):
        raise ValidationError(_('Invalid coordinate format'))

# File validation
def validate_file_size(file, max_size_mb=5):
    """Validate file size"""
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(_(f'File size must be no more than {max_size_mb}MB'))

def validate_image_file(file):
    """Validate that file is an image"""
    # Check file extension
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    file_extension = file.name.lower()
    
    if not any(file_extension.endswith(ext) for ext in allowed_extensions):
        raise ValidationError(_('Only image files are allowed (jpg, jpeg, png, gif, webp)'))
    
    # Check MIME type
    try:
        mime_type = magic.from_buffer(file.read(1024), mime=True)
        file.seek(0)  # Reset file pointer
        
        if not mime_type.startswith('image/'):
            raise ValidationError(_('File must be an image'))
    except Exception:
        # If magic fails, fall back to extension check
        pass

# Text validation
def validate_phone_number(phone):
    """Validate phone number format"""
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message=_('Phone number must be entered in the format: +999999999. Up to 15 digits allowed.')
    )
    phone_regex(phone)

def validate_name(name):
    """Validate name format (letters, spaces, hyphens, apostrophes only)"""
    if not re.match(r'^[a-zA-Z\s\-\']+$', name):
        raise ValidationError(_('Name can only contain letters, spaces, hyphens, and apostrophes'))

# URL validation
def validate_appwrite_url(url):
    """Validate Appwrite URL format"""
    if not url.startswith(('https://', 'http://')):
        raise ValidationError(_('URL must start with http:// or https://'))

# Push token validation
def validate_expo_push_token(token):
    """Validate Expo push token format"""
    if not token.startswith('ExponentPushToken[') or not token.endswith(']'):
        raise ValidationError(_('Invalid Expo push token format'))

# Location validation
def validate_location_data(location):
    """Validate location data structure"""
    if not isinstance(location, dict):
        raise ValidationError(_('Location must be a JSON object'))
    
    required_fields = ['latitude', 'longitude']
    for field in required_fields:
        if field not in location:
            raise ValidationError(_(f'Location must include {field}'))
    
    # Validate coordinates
    validate_coordinates(location['latitude'], location['longitude'])

# Status validation
def validate_report_status(status):
    """Validate injury report status"""
    allowed_statuses = ['pending', 'in_progress', 'resolved']
    if status not in allowed_statuses:
        raise ValidationError(_(f'Status must be one of: {", ".join(allowed_statuses)}'))

# NGO category validation
def validate_ngo_category(category):
    """Validate NGO category"""
    allowed_categories = [
        'animal_welfare', 'veterinary', 'rescue', 'wildlife', 
        'conservation', 'shelter', 'other'
    ]
    if category not in allowed_categories:
        raise ValidationError(_(f'Category must be one of: {", ".join(allowed_categories)}'))

# Message length validation
def validate_message_length(message, max_length=1000):
    """Validate message length"""
    if len(message) > max_length:
        raise ValidationError(_(f'Message must be no more than {max_length} characters'))

# User ID validation
def validate_appwrite_user_id(user_id):
    """Validate Appwrite user ID format"""
    if not re.match(r'^[a-zA-Z0-9]{20,}$', user_id):
        raise ValidationError(_('Invalid user ID format')) 