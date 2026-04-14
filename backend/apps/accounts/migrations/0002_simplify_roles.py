"""Simplify roles from 5 (admin, shelter_staff, volunteer, adopter, reporter) to 2 (admin, user)."""

from django.db import migrations, models


def migrate_roles_forward(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(
        role__in=['shelter_staff', 'volunteer', 'adopter', 'reporter']
    ).update(role='user')


def migrate_roles_backward(apps, schema_editor):
    # Best-effort reverse: all non-admin users become 'reporter' (the old default)
    User = apps.get_model('accounts', 'User')
    User.objects.filter(role='user').update(role='reporter')


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(migrate_roles_forward, migrate_roles_backward),
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[('admin', 'Admin'), ('user', 'User')],
                default='user',
                max_length=20,
            ),
        ),
    ]
