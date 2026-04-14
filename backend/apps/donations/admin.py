from django.contrib import admin

from apps.donations.models import Donation


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'donor',
        'animal',
        'amount',
        'donation_type',
        'payment_status',
        'is_anonymous',
        'is_recurring',
        'created_at',
    )
    list_filter = ('donation_type', 'payment_status', 'is_anonymous', 'is_recurring')
    search_fields = ('donor__email', 'donor_name', 'donor_email', 'payment_reference')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
