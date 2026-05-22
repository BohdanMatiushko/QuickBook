from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('services', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='service',
            name='booking_mode',
            field=models.CharField(
                choices=[('fixed_slots', 'Фіксовані години'), ('duration_slots', 'Слоти за тривалістю')],
                default='duration_slots',
                max_length=20,
                verbose_name='Формат бронювання',
            ),
        ),
        migrations.AddField(
            model_name='service',
            name='display_mode',
            field=models.CharField(
                choices=[('tiles', 'Плитки'), ('timeline', 'Стрічка часу')],
                default='timeline',
                max_length=20,
                verbose_name='Відображення слотів',
            ),
        ),
        migrations.AddField(
            model_name='service',
            name='owner',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='owned_services',
                to=settings.AUTH_USER_MODEL,
                verbose_name='Власник (фахівець)',
            ),
        ),
        migrations.CreateModel(
            name='ServiceTimeSlot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.TimeField(verbose_name='Час початку')),
                ('service', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='time_slots',
                    to='services.service',
                    verbose_name='Послуга',
                )),
            ],
            options={
                'verbose_name': 'Фіксований слот',
                'verbose_name_plural': 'Фіксовані слоти',
                'ordering': ['start_time'],
            },
        ),
        migrations.AddConstraint(
            model_name='servicetimeslot',
            constraint=models.UniqueConstraint(
                fields=('service', 'start_time'),
                name='unique_service_start_time',
            ),
        ),
    ]
