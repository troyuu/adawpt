from django.contrib import admin

from apps.content.models import Event, SuccessStory


@admin.register(SuccessStory)
class SuccessStoryAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'slug',
        'author',
        'is_published',
        'is_featured',
        'published_at',
        'created_at',
    )
    list_filter = ('is_published', 'is_featured')
    search_fields = ('title', 'body', 'excerpt')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'slug',
        'event_type',
        'start_date',
        'end_date',
        'is_published',
        'created_by',
        'created_at',
    )
    list_filter = ('event_type', 'is_published')
    search_fields = ('title', 'description', 'location')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
