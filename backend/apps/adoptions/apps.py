from django.apps import AppConfig


class AdoptionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.adoptions'

    def ready(self):
        import apps.adoptions.signals  # noqa: F401
