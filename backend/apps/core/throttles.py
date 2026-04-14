from rest_framework.throttling import AnonRateThrottle


class LoginThrottle(AnonRateThrottle):
    """Strict throttle for login attempts — prevents brute force."""
    scope = 'login'


class RegisterThrottle(AnonRateThrottle):
    """Strict throttle for registration — prevents spam accounts."""
    scope = 'register'


class ReportThrottle(AnonRateThrottle):
    """Throttle for anonymous report submissions."""
    scope = 'report'
