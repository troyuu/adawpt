from rest_framework import serializers

from apps.donations.models import Donation


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = [
            'id',
            'donor',
            'animal',
            'amount',
            'donation_type',
            'payment_status',
            'payment_reference',
            'is_anonymous',
            'donor_name',
            'donor_email',
            'message',
            'is_recurring',
            'recurring_status',
            'next_payment_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'payment_status', 'created_at', 'updated_at']


class DonationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = [
            'id',
            'animal',
            'amount',
            'donation_type',
            'payment_status',
            'payment_reference',
            'is_anonymous',
            'donor_name',
            'donor_email',
            'message',
            'is_recurring',
            'recurring_status',
            'next_payment_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'payment_status', 'created_at', 'updated_at']


class DonationSummarySerializer(serializers.Serializer):
    total_raised = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_donors = serializers.IntegerField()
    this_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    by_type = serializers.DictField()
