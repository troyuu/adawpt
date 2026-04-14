from rest_framework import serializers

from apps.content.models import Event, SuccessStory


class SuccessStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SuccessStory
        fields = [
            'id',
            'title',
            'slug',
            'body',
            'excerpt',
            'featured_image',
            'animal',
            'author',
            'is_published',
            'is_featured',
            'published_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'author', 'created_at', 'updated_at']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'event_type',
            'featured_image',
            'location',
            'start_date',
            'end_date',
            'is_published',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_by', 'created_at', 'updated_at']
