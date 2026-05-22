from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


GLOBAL_CATEGORIES = [
    ('Медицина', 1),
    ('SPA', 2),
    ('Барбершоп', 3),
    ('Спорт і фітнес', 4),
    ('Краса', 5),
    ('Консультації', 6),
    ('Інше', 99),
]


def seed_global_categories(apps, schema_editor):
    Category = apps.get_model('services', 'Category')
    for name, sort_order in GLOBAL_CATEGORIES:
        Category.objects.get_or_create(
            name=name,
            is_global=True,
            defaults={'sort_order': sort_order, 'is_active': True},
        )


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('services', '0003_service_booking_features'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='is_global',
            field=models.BooleanField(default=False, verbose_name='Загальна (для всіх фахівців)'),
        ),
        migrations.AddField(
            model_name='category',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='custom_categories',
                to=settings.AUTH_USER_MODEL,
                verbose_name='Автор (власна категорія)',
            ),
        ),
        migrations.RunPython(seed_global_categories, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name='category',
            constraint=models.UniqueConstraint(
                condition=models.Q(('is_global', True)),
                fields=('name',),
                name='unique_global_category_name',
            ),
        ),
        migrations.AddConstraint(
            model_name='category',
            constraint=models.UniqueConstraint(
                condition=models.Q(('is_global', False)),
                fields=('name', 'created_by'),
                name='unique_custom_category_per_specialist',
            ),
        ),
    ]
