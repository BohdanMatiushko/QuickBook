from django.db import migrations, models


def fill_missing_emails(apps, schema_editor):
    User = apps.get_model('users', 'User')
    for user in User.objects.filter(email__isnull=True):
        user.email = f'{user.username}@quickbook.local'
        user.save(update_fields=['email'])
    for user in User.objects.filter(email=''):
        user.email = f'{user.username}@quickbook.local'
        user.save(update_fields=['email'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_notification_new_booking'),
    ]

    operations = [
        migrations.RunPython(fill_missing_emails, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='user',
            name='password',
            field=models.CharField(max_length=128, verbose_name='password'),
        ),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=254, unique=True, verbose_name='Електронна-адреса'),
        ),
    ]
