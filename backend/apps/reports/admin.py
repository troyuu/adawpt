from django.contrib import admin

from .models import AnimalReport, ReportImage


class ReportImageInline(admin.TabularInline):
    model = ReportImage
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(AnimalReport)
class AnimalReportAdmin(admin.ModelAdmin):
    list_display = (
        'tracking_id', 'animal_type', 'urgency', 'status',
        'reporter_name', 'assigned_volunteer', 'created_at',
    )
    list_filter = ('status', 'urgency', 'animal_type', 'created_at')
    search_fields = ('tracking_id', 'description', 'reporter_name', 'address')
    readonly_fields = ('tracking_id', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    inlines = [ReportImageInline]

    fieldsets = (
        ('Tracking', {
            'fields': ('tracking_id', 'status', 'urgency'),
        }),
        ('Animal Details', {
            'fields': ('animal_type', 'description'),
        }),
        ('Location', {
            'fields': ('latitude', 'longitude', 'address'),
        }),
        ('Reporter Info', {
            'fields': ('reporter', 'reporter_name', 'reporter_phone', 'reporter_email'),
        }),
        ('Assignment & Resolution', {
            'fields': ('assigned_volunteer', 'admin_notes', 'resolved_at', 'resulting_animal'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )


@admin.register(ReportImage)
class ReportImageAdmin(admin.ModelAdmin):
    list_display = ('report', 'caption', 'order', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('caption', 'report__tracking_id')
    readonly_fields = ('created_at', 'updated_at')
