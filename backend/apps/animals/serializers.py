from rest_framework import serializers

from .models import Animal, AnimalImage, MedicalRecord


class AnimalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalImage
        fields = [
            'id',
            'animal',
            'image',
            'caption',
            'is_primary',
            'order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'animal', 'created_at', 'updated_at']

    def validate_image(self, value):
        from apps.core.utils import validate_image_file
        validate_image_file(value)
        return value


class MedicalRecordSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = MedicalRecord
        fields = [
            'id',
            'animal',
            'record_type',
            'title',
            'description',
            'veterinarian',
            'record_date',
            'next_due_date',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name
        return None


class AnimalListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Animal
        fields = [
            'id',
            'name',
            'species',
            'breed',
            'age_years',
            'age_months',
            'gender',
            'weight_kg',
            'color',
            'status',
            'is_spayed_neutered',
            'is_vaccinated',
            'is_good_with_kids',
            'is_good_with_pets',
            'intake_date',
            'primary_image',
            'created_at',
        ]

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary:
            return AnimalImageSerializer(primary, context=self.context).data
        return None


class AnimalDetailSerializer(serializers.ModelSerializer):
    images = AnimalImageSerializer(many=True, read_only=True)
    medical_records = MedicalRecordSerializer(many=True, read_only=True)
    adopted_by_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Animal
        fields = [
            'id',
            'name',
            'species',
            'breed',
            'age_years',
            'age_months',
            'gender',
            'weight_kg',
            'color',
            'description',
            'temperament',
            'special_needs',
            'is_spayed_neutered',
            'is_vaccinated',
            'is_good_with_kids',
            'is_good_with_pets',
            'status',
            'intake_date',
            'adoption_date',
            'adopted_by',
            'adopted_by_name',
            'created_by',
            'created_by_name',
            'images',
            'medical_records',
            'created_at',
            'updated_at',
        ]

    def get_adopted_by_name(self, obj):
        if obj.adopted_by:
            return obj.adopted_by.full_name
        return None

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name
        return None


class AnimalCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = [
            'id',
            'name',
            'species',
            'breed',
            'age_years',
            'age_months',
            'gender',
            'weight_kg',
            'color',
            'description',
            'temperament',
            'special_needs',
            'is_spayed_neutered',
            'is_vaccinated',
            'is_good_with_kids',
            'is_good_with_pets',
            'status',
            'intake_date',
            'adoption_date',
            'adopted_by',
        ]
        read_only_fields = ['id']
