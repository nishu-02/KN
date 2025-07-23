import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import Http404
from rest_framework.exceptions import (
    APIException, NotFound, PermissionDenied, 
    ValidationError as DRFValidationError, Throttled
)

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that provides uniform error responses
    and logs all exceptions for monitoring.
    """
    # Call DRF's default exception handler first
    response = exception_handler(exc, context)
    
    # Get request info for logging
    request = context.get('request')
    view = context.get('view')
    user_id = getattr(request, 'user_id', 'anonymous') if request else 'unknown'
    view_name = view.__class__.__name__ if view else 'unknown'
    
    # Log the exception
    log_exception(exc, user_id, view_name, request)
    
    if response is not None:
        # DRF handled the exception, format the response
        return format_drf_response(response, exc)
    else:
        # DRF didn't handle it, handle it ourselves
        return handle_unhandled_exception(exc, user_id, view_name)

def log_exception(exc, user_id, view_name, request=None):
    """Log exception with context"""
    error_context = {
        'user_id': user_id,
        'view_name': view_name,
        'exception_type': type(exc).__name__,
        'exception_message': str(exc),
    }
    
    if request:
        error_context.update({
            'method': request.method,
            'path': request.path,
            'query_params': dict(request.query_params),
            'data': getattr(request, 'data', {})
        })
    
    # Log based on exception type
    if isinstance(exc, (ValidationError, DRFValidationError, IntegrityError)):
        logger.warning(f"Validation/Integrity error: {exc}", extra=error_context)
    elif isinstance(exc, (PermissionDenied, Http404, NotFound)):
        logger.info(f"Permission/Not found error: {exc}", extra=error_context)
    elif isinstance(exc, Throttled):
        logger.warning(f"Rate limit exceeded: {exc}", extra=error_context)
    else:
        logger.error(f"Unhandled exception: {exc}", extra=error_context, exc_info=True)

def format_drf_response(response, exc):
    """Format DRF response to be consistent"""
    if isinstance(exc, Throttled):
        response.data = {
            'error': 'Rate limit exceeded',
            'detail': f'Request limit exceeded. Try again in {exc.wait} seconds.',
            'retry_after': exc.wait
        }
    elif isinstance(exc, (ValidationError, DRFValidationError)):
        response.data = {
            'error': 'Validation error',
            'detail': response.data
        }
    elif isinstance(exc, PermissionDenied):
        response.data = {
            'error': 'Permission denied',
            'detail': 'You do not have permission to perform this action.'
        }
    elif isinstance(exc, (Http404, NotFound)):
        response.data = {
            'error': 'Not found',
            'detail': 'The requested resource was not found.'
        }
    
    return response

def handle_unhandled_exception(exc, user_id, view_name):
    """Handle exceptions that DRF didn't catch"""
    if isinstance(exc, ValidationError):
        return Response({
            'error': 'Validation error',
            'detail': str(exc)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif isinstance(exc, IntegrityError):
        return Response({
            'error': 'Database integrity error',
            'detail': 'A database constraint was violated.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif isinstance(exc, Http404):
        return Response({
            'error': 'Not found',
            'detail': 'The requested resource was not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    else:
        # Log unexpected exceptions
        logger.error(
            f"Unexpected exception in {view_name} for user {user_id}: {exc}",
            exc_info=True
        )
        
        return Response({
            'error': 'Internal server error',
            'detail': 'An unexpected error occurred. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 