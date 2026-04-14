from django.utils import timezone
from rest_framework import serializers

from apps.animals.models import Animal
from .models import AdoptionApplication


class AnimalBriefSerializer(serializers.ModelSerializer):
    """Minimal animal data for embedding in adoption list responses."""
    photo = serializers.SerializerMethodField()

    class Meta:
        model = Animal
        fields = ['id', 'name', 'photo']
        read_only_fields = fields

    def get_photo(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary and primary.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        return None


class AdoptionApplicationListSerializer(serializers.ModelSerializer):
    """Summary serializer for listing adoption applications."""

    applicant_name = serializers.SerializerMethodField()
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    animal = AnimalBriefSerializer(read_only=True)

    class Meta:
        model = AdoptionApplication
        fields = [
            'id',
            'applicant',
            'applicant_name',
            'animal',
            'animal_name',
            'status',
            'housing_type',
            'rejection_reason',
            'interview_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_applicant_name(self, obj):
        return obj.applicant.full_name


class AdoptionApplicationDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for a single adoption application."""

    applicant_name = serializers.SerializerMethodField()
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    reviewed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AdoptionApplication
        fields = [
            'id',
            'applicant',
            'applicant_name',
            'animal',
            'animal_name',
            'status',
            'housing_type',
            'owns_or_rents',
            'landlord_permission',
            'has_yard',
            'other_pets',
            'children_info',
            'pet_experience',
            'work_schedule',
            'vet_reference',
            'personal_references',
            'reason_to_adopt',
            'agrees_to_home_visit',
            'staff_notes',
            'rejection_reason',
            'rejection_message',
            'interview_date',
            'reviewed_by',
            'reviewed_by_name',
            'reviewed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'applicant',
            'applicant_name',
            'animal_name',
            'status',
            'staff_notes',
            'rejection_reason',
            'rejection_message',
            'interview_date',
            'reviewed_by',
            'reviewed_by_name',
            'reviewed_at',
            'created_at',
            'updated_at',
        ]

    def get_applicant_name(self, obj):
        return obj.applicant.full_name

    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return obj.reviewed_by.full_name
        return None


class AdoptionApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new adoption application."""

    class Meta:
        model = AdoptionApplication
        fields = [
            'id',
            'animal',
            'housing_type',
            'owns_or_rents',
            'landlord_permission',
            'has_yard',
            'other_pets',
            'children_info',
            'pet_experience',
            'work_schedule',
            'vet_reference',
            'personal_references',
            'reason_to_adopt',
            'agrees_to_home_visit',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        user = self.context['request'].user
        animal = attrs['animal']

        # Check if the user already has an active application for this animal
        active_exists = AdoptionApplication.objects.filter(
            applicant=user,
            animal=animal,
        ).exclude(
            status__in=[
                AdoptionApplication.Status.REJECTED,
                AdoptionApplication.Status.WITHDRAWN,
            ],
        ).exists()

        if active_exists:
            raise serializers.ValidationError(
                'You already have an active application for this animal.'
            )

        return attrs

    def create(self, validated_data):
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)


class ReviewApplicationSerializer(serializers.Serializer):
    """Serializer for staff/admin reviewing an application."""

    status = serializers.ChoiceField(
        choices=[
            AdoptionApplication.Status.UNDER_REVIEW,
            AdoptionApplication.Status.INTERVIEW_SCHEDULED,
            AdoptionApplication.Status.APPROVED,
            AdoptionApplication.Status.REJECTED,
        ],
    )
    staff_notes = serializers.CharField(required=False, allow_blank=True)
    interview_date = serializers.DateTimeField(required=False, allow_null=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    rejection_message = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        status = attrs.get('status')

        if status == AdoptionApplication.Status.INTERVIEW_SCHEDULED:
            if not attrs.get('interview_date'):
                raise serializers.ValidationError(
                    {'interview_date': 'Interview date is required when scheduling an interview.'}
                )

        if status == AdoptionApplication.Status.REJECTED:
            if not attrs.get('rejection_reason'):
                raise serializers.ValidationError(
                    {'rejection_reason': 'Rejection reason is required when rejecting an application.'}
                )

        return attrs

    def update(self, instance, validated_data):
        instance.status = validated_data['status']
        instance.staff_notes = validated_data.get('staff_notes', instance.staff_notes)
        instance.interview_date = validated_data.get('interview_date', instance.interview_date)
        instance.rejection_reason = validated_data.get('rejection_reason', instance.rejection_reason)
        instance.rejection_message = validated_data.get('rejection_message', instance.rejection_message)
        instance.reviewed_by = self.context['request'].user
        instance.reviewed_at = timezone.now()
        instance.save()
        return instance
