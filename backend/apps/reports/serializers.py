from rest_framework import serializers

from apps.accounts.models import User
from .models import AnimalReport, ReportImage


class ReportImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportImage
        fields = ['id', 'image', 'caption', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class ReportListSerializer(serializers.ModelSerializer):
    animal_type_display = serializers.CharField(source='get_animal_type_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    image_count = serializers.IntegerField(source='images.count', read_only=True)

    class Meta:
        model = AnimalReport
        fields = [
            'id', 'tracking_id', 'animal_type', 'animal_type_display',
            'urgency', 'urgency_display', 'status', 'status_display',
            'address', 'reporter_name', 'image_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields


class ReportDetailSerializer(serializers.ModelSerializer):
    images = ReportImageSerializer(many=True, read_only=True)
    animal_type_display = serializers.CharField(source='get_animal_type_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AnimalReport
        fields = [
            'id', 'tracking_id', 'reporter', 'assigned_volunteer',
            'animal_type', 'animal_type_display',
            'description', 'urgency', 'urgency_display',
            'status', 'status_display',
            'latitude', 'longitude', 'address',
            'reporter_name', 'reporter_phone', 'reporter_email',
            'admin_notes', 'resolved_at', 'resulting_animal',
            'images', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'tracking_id', 'reporter', 'images',
            'created_at', 'updated_at',
        ]


class ReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for anonymous report creation (AllowAny)."""
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
    )
    tracking_id = serializers.CharField(read_only=True)

    class Meta:
        model = AnimalReport
        fields = [
            'id', 'tracking_id', 'animal_type', 'description', 'urgency',
            'latitude', 'longitude', 'address',
            'reporter_name', 'reporter_phone', 'reporter_email',
            'images',
        ]
        read_only_fields = ['id', 'tracking_id']

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        request = self.context.get('request')

        # Attach the authenticated user as reporter if available
        if request and request.user and request.user.is_authenticated:
            validated_data['reporter'] = request.user

        report = AnimalReport.objects.create(**validated_data)

        for idx, image_file in enumerate(images_data):
            ReportImage.objects.create(
                report=report,
                image=image_file,
                order=idx,
            )

        return report


class AssignVolunteerSerializer(serializers.Serializer):
    volunteer_id = serializers.UUIDField()

    def validate_volunteer_id(self, value):
        try:
            volunteer = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('User not found.')
        # Any active user can be assigned to a report
        return value


class UpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=AnimalReport.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
