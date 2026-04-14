from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """Wrap all DRF exceptions in the standard response envelope."""
    response = exception_handler(exc, context)

    if response is not None:
        errors = None
        message = 'An error occurred'

        if isinstance(response.data, dict):
            if 'detail' in response.data:
                message = str(response.data['detail'])
            else:
                errors = response.data
                message = 'Validation failed'
        elif isinstance(response.data, list):
            message = response.data[0] if response.data else 'An error occurred'

        response.data = {
            'success': False,
            'data': None,
            'message': message,
            'errors': errors,
        }

    return response
