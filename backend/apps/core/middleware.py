import json
from django.utils.deprecation import MiddlewareMixin


class AuditTrailMiddleware(MiddlewareMixin):
    """Log API write operations to the audit trail."""

    AUDITED_METHODS = ('POST', 'PUT', 'PATCH', 'DELETE')

    def process_response(self, request, response):
        if request.method not in self.AUDITED_METHODS:
            return response

        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return response

        if not request.path.startswith('/api/'):
            return response

        # Audit logging will be implemented when the audit_logs model is created
        # For now, this middleware is a placeholder for the audit trail

        return response
