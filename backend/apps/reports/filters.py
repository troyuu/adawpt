import django_filters

from .models import AnimalReport


class ReportFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=AnimalReport.Status.choices)
    urgency = django_filters.ChoiceFilter(choices=AnimalReport.Urgency.choices)
    animal_type = django_filters.ChoiceFilter(choices=AnimalReport.AnimalType.choices)
    created_at__gte = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at__lte = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = AnimalReport
        fields = ['status', 'urgency', 'animal_type', 'created_at__gte', 'created_at__lte']
