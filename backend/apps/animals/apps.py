from django.apps import AppConfig


class AnimalsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.animals'

    def ready(self):
        import apps.animals.signals  # noqa: F401
