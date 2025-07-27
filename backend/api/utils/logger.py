"""
Logging utilities for KarunaNidhan application.

This module provides convenient logging functions for different parts of the application.
"""

import logging
import functools
import time
from typing import Optional, Any, Callable
from django.conf import settings

# Get loggers for different modules
def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for the specified module."""
    return logging.getLogger(name)

# Module-specific loggers
reports_logger = get_logger('reports')
user_logger = get_logger('users')
notifications_logger = get_logger('notifications')
ngo_logger = get_logger('ngo')
appwrite_logger = get_logger('appwrite')

def log_function_call(logger: logging.Logger, level: str = 'info'):
    """
    Decorator to log function calls with parameters and execution time.
    
    Args:
        logger: The logger instance to use
        level: Log level ('debug', 'info', 'warning', 'error')
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            func_name = func.__name__
            module_name = func.__module__
            
            # Log function entry
            log_func = getattr(logger, level)
            log_func(f"Entering {module_name}.{func_name} with args={args}, kwargs={kwargs}")
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                log_func(f"Exiting {module_name}.{func_name} successfully in {execution_time:.4f}s")
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(f"Error in {module_name}.{func_name} after {execution_time:.4f}s: {str(e)}")
                raise
        return wrapper
    return decorator

def log_api_request(logger: logging.Logger, request_type: str = "API"):
    """
    Decorator to log API request details.
    
    Args:
        logger: The logger instance to use
        request_type: Type of request (API, WebSocket, etc.)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(request, *args, **kwargs):
            # Extract request information
            method = getattr(request, 'method', 'UNKNOWN')
            path = getattr(request, 'path', 'UNKNOWN')
            user = getattr(request, 'user', None)
            user_id = getattr(user, 'id', 'anonymous') if user else 'anonymous'
            ip = getattr(request, 'META', {}).get('REMOTE_ADDR', 'unknown')
            
            logger.info(f"{request_type} Request: {method} {path} | User: {user_id} | IP: {ip}")
            
            start_time = time.time()
            try:
                result = func(request, *args, **kwargs)
                execution_time = time.time() - start_time
                logger.info(f"{request_type} Response: {method} {path} | Status: Success | Time: {execution_time:.4f}s")
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(f"{request_type} Error: {method} {path} | Error: {str(e)} | Time: {execution_time:.4f}s")
                raise
        return wrapper
    return decorator

def log_database_operation(logger: logging.Logger, operation: str):
    """
    Decorator to log database operations.
    
    Args:
        logger: The logger instance to use
        operation: Type of operation (create, update, delete, query)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            model_name = getattr(args[0].__class__, '__name__', 'Unknown') if args else 'Unknown'
            
            logger.info(f"Database {operation}: {model_name} | Args: {args[1:]} | Kwargs: {kwargs}")
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                logger.info(f"Database {operation} completed: {model_name} | Time: {execution_time:.4f}s")
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(f"Database {operation} failed: {model_name} | Error: {str(e)} | Time: {execution_time:.4f}s")
                raise
        return wrapper
    return decorator

def log_appwrite_operation(logger: logging.Logger, operation: str):
    """
    Decorator to log Appwrite operations.
    
    Args:
        logger: The logger instance to use
        operation: Type of operation (create, read, update, delete)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            logger.info(f"Appwrite {operation}: {func.__name__} | Args: {args} | Kwargs: {kwargs}")
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                logger.info(f"Appwrite {operation} completed: {func.__name__} | Time: {execution_time:.4f}s")
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(f"Appwrite {operation} failed: {func.__name__} | Error: {str(e)} | Time: {execution_time:.4f}s")
                raise
        return wrapper
    return decorator

def log_security_event(logger: logging.Logger, event_type: str, details: str, user_id: Optional[str] = None):
    """
    Log security-related events.
    
    Args:
        logger: The logger instance to use
        event_type: Type of security event
        details: Details about the event
        user_id: User ID if applicable
    """
    security_logger = get_logger('django.security')
    message = f"Security Event: {event_type} | Details: {details}"
    if user_id:
        message += f" | User: {user_id}"
    security_logger.warning(message)

def log_error_with_context(logger: logging.Logger, error: Exception, context: Optional[dict] = None):
    """
    Log errors with additional context.
    
    Args:
        logger: The logger instance to use
        error: The exception that occurred
        context: Additional context information
    """
    error_message = f"Error: {type(error).__name__}: {str(error)}"
    if context:
        error_message += f" | Context: {context}"
    logger.error(error_message, exc_info=True)

# Convenience functions for common logging scenarios
def log_user_activity(user_id: str, activity: str, details: Optional[dict] = None):
    """Log user activities."""
    message = f"User Activity: {user_id} | Activity: {activity}"
    if details:
        message += f" | Details: {details}"
    user_logger.info(message)

def log_report_activity(report_id: str, action: str, user_id: Optional[str] = None, details: Optional[dict] = None):
    """Log report-related activities."""
    message = f"Report Activity: {report_id} | Action: {action}"
    if user_id:
        message += f" | User: {user_id}"
    if details:
        message += f" | Details: {details}"
    reports_logger.info(message)

def log_notification_sent(notification_type: str, recipient_id: str, success: bool, details: Optional[dict] = None):
    """Log notification sending attempts."""
    status = "SUCCESS" if success else "FAILED"
    message = f"Notification: {notification_type} | Recipient: {recipient_id} | Status: {status}"
    if details:
        message += f" | Details: {details}"
    notifications_logger.info(message)

def log_ngo_activity(ngo_id: str, activity: str, details: Optional[dict] = None):
    """Log NGO-related activities."""
    message = f"NGO Activity: {ngo_id} | Activity: {activity}"
    if details:
        message += f" | Details: {details}"
    ngo_logger.info(message) 