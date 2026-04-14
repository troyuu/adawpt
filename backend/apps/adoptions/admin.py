from django.contrib import admin

from .models import AdoptionApplication


@admin.register(AdoptionApplication)
class AdoptionApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'applicant',
        'animal',
        'status',
        'housing_type',
        'interview_date',
        'reviewed_by',
        'reviewed_at',
        'created_at',
    )
    list_filter = ('status', 'housing_type', 'owns_or_rents', 'has_yard', 'agrees_to_home_visit')
    search_fields = (
        'applicant__email',
        'applicant__first_name',
        'applicant__last_name',
        'animal__name',
    )
    raw_id_fields = ('applicant', 'animal', 'reviewed_by')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
