from django.contrib import admin

from .models import Animal, AnimalImage, MedicalRecord


class AnimalImageInline(admin.TabularInline):
    model = AnimalImage
    extra = 1
    fields = ('image', 'caption', 'is_primary', 'order')


class MedicalRecordInline(admin.TabularInline):
    model = MedicalRecord
    extra = 0
    fields = ('record_type', 'title', 'record_date', 'veterinarian', 'next_due_date', 'created_by')
    readonly_fields = ('created_by',)


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'species',
        'breed',
        'gender',
        'status',
        'intake_date',
        'is_vaccinated',
        'is_spayed_neutered',
        'created_at',
    )
    list_filter = ('species', 'status', 'gender', 'is_vaccinated', 'is_spayed_neutered')
    search_fields = ('name', 'breed', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'created_by')
    inlines = [AnimalImageInline, MedicalRecordInline]

    fieldsets = (
        (None, {'fields': ('name', 'species', 'breed', 'color', 'description')}),
        ('Age & Physical', {'fields': ('age_years', 'age_months', 'gender', 'weight_kg', 'temperament')}),
        ('Health', {'fields': (
            'special_needs', 'is_spayed_neutered', 'is_vaccinated',
            'is_good_with_kids', 'is_good_with_pets',
        )}),
        ('Status & Dates', {'fields': ('status', 'intake_date', 'adoption_date', 'adopted_by')}),
        ('Metadata', {'fields': ('created_by', 'created_at', 'updated_at')}),
    )


@admin.register(AnimalImage)
class AnimalImageAdmin(admin.ModelAdmin):
    list_display = ('animal', 'caption', 'is_primary', 'order', 'created_at')
    list_filter = ('is_primary',)
    search_fields = ('animal__name', 'caption')
    ordering = ('animal', 'order')


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'animal',
        'record_type',
        'veterinarian',
        'record_date',
        'next_due_date',
        'created_at',
    )
    list_filter = ('record_type', 'record_date')
    search_fields = ('title', 'animal__name', 'veterinarian', 'description')
    ordering = ('-record_date',)
    readonly_fields = ('created_at', 'updated_at')
