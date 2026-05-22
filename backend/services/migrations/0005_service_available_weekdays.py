from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0004_category_global_custom'),
    ]

    operations = [
        migrations.AddField(
            model_name='service',
            name='available_weekdays',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Дні тижня (0=Пн … 6=Нд), порожній = усі дні',
                verbose_name='Дні для запису',
            ),
        ),
    ]
