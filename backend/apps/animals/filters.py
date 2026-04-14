import django_filters
from django.db import models

from .models import Animal


class AnimalFilter(django_filters.FilterSet):
    """Filter set for Animal model."""

    species = django_filters.ChoiceFilter(choices=Animal.Species.choices)
    status = django_filters.ChoiceFilter(choices=Animal.Status.choices)
    gender = django_filters.ChoiceFilter(choices=Animal.Gender.choices)
    breed = django_filters.CharFilter(field_name='breed', lookup_expr='icontains')
    search = django_filters.CharFilter(method='filter_search')
    age_min = django_filters.NumberFilter(field_name='age_years', lookup_expr='gte')
    age_max = django_filters.NumberFilter(field_name='age_years', lookup_expr='lte')
    is_vaccinated = django_filters.BooleanFilter()
    is_spayed_neutered = django_filters.BooleanFilter()
    is_good_with_kids = django_filters.BooleanFilter()
    is_good_with_pets = django_filters.BooleanFilter()

    class Meta:
        model = Animal
        fields = [
            'species',
            'status',
            'gender',
            'breed',
            'is_vaccinated',
            'is_spayed_neutered',
            'is_good_with_kids',
            'is_good_with_pets',
        ]

    def filter_search(self, queryset, name, value):
        """Search across name, breed, and description fields."""
        return queryset.filter(
            models.Q(name__icontains=value)
            | models.Q(breed__icontains=value)
            | models.Q(description__icontains=value)
        )
