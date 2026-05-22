from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(
                choices=[
                    ('reminder', 'Нагадування'),
                    ('status_change', 'Зміна статусу'),
                    ('cancellation', 'Скасування'),
                    ('new_booking', 'Нове бронювання'),
                    ('promotion', 'Акція'),
                    ('system', 'Системне'),
                ],
                default='system',
                max_length=20,
                verbose_name='Тип сповіщення',
            ),
        ),
        migrations.RemoveConstraint(
            model_name='notification',
            name='valid_notification_type',
        ),
        migrations.AddConstraint(
            model_name='notification',
            constraint=models.CheckConstraint(
                condition=models.Q(notification_type__in=[
                    'reminder', 'status_change', 'cancellation',
                    'new_booking', 'promotion', 'system',
                ]),
                name='valid_notification_type',
            ),
        ),
    ]
