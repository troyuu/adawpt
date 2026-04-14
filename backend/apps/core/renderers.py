from rest_framework.renderers import JSONRenderer


class StandardJSONRenderer(JSONRenderer):
    """Wrap successful responses in the standard envelope."""

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None

        # Don't re-wrap if already in envelope format (e.g., from exception handler)
        if isinstance(data, dict) and 'success' in data:
            return super().render(data, accepted_media_type, renderer_context)

        # Don't wrap error responses (handled by exception handler)
        if response and response.status_code >= 400:
            return super().render(data, accepted_media_type, renderer_context)

        wrapped = {
            'success': True,
            'data': data,
            'message': 'Success',
            'errors': None,
        }

        return super().render(wrapped, accepted_media_type, renderer_context)
