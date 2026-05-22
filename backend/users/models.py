from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    first_name = models.CharField(max_length=40, blank=True, null=True, verbose_name="Ім'я")
    last_name = models.CharField(max_length=40, blank=True, null=True, verbose_name="Фамілія")
    email = models.EmailField(unique=True, verbose_name='Електронна-адреса')
    phone_number = models.CharField(max_length=15, blank=True, null=True, verbose_name="Номер телефону")
    is_client = models.BooleanField(default=True, verbose_name="Клієнт")
    is_employee = models.BooleanField(default=False, verbose_name="Співробітник")
    avatar_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL аватару")
    date_of_birth = models.DateField(blank=True, null=True, verbose_name="Дата народження")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата створення")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата оновлення")

    class Meta:
        verbose_name = "Користувач"
        verbose_name_plural = "Користувачі"

    def __str__(self):
        return f"{self.username} ({self.get_full_name()})"


class WorkSchedule(models.Model):
    DAY_CHOICES = [
        (0, 'Понеділок'),
        (1, 'Вівторок'),
        (2, 'Середа'),
        (3, 'Четвер'),
        (4, "П'ятниця"),
        (5, 'Субота'),
        (6, 'Неділя'),
    ]

    specialist = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='work_schedules',
        verbose_name="Фахівець"
    )
    day_of_week = models.IntegerField(
        choices=DAY_CHOICES,
        validators=[MinValueValidator(0), MaxValueValidator(6)],
        verbose_name="День тижня"
    )
    start_time = models.TimeField(verbose_name="Час початку")
    end_time = models.TimeField(verbose_name="Час завершення")
    is_active = models.BooleanField(default=True, verbose_name="Активний")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")

    class Meta:
        verbose_name = "Робочий графік"
        verbose_name_plural = "Робочі графіки"
        constraints = [
            models.UniqueConstraint(
                fields=['specialist', 'day_of_week'],
                name='unique_specialist_day'
            ),
            models.CheckConstraint(
                condition=models.Q(day_of_week__gte=0, day_of_week__lte=6),
                name='valid_day_of_week'
            ),
        ]

    def __str__(self):
        return f"{self.specialist} — {self.get_day_of_week_display()}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('reminder', 'Нагадування'),
        ('status_change', 'Зміна статусу'),
        ('cancellation', 'Скасування'),
        ('new_booking', 'Нове бронювання'),
        ('promotion', 'Акція'),
        ('system', 'Системне'),
    ]

    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="Отримувач"
    )
    title = models.CharField(max_length=255, verbose_name="Заголовок")
    message = models.TextField(verbose_name="Текст повідомлення")
    notification_type = models.CharField(
        max_length=20, choices=TYPE_CHOICES,
        default='system', verbose_name="Тип сповіщення"
    )
    is_read = models.BooleanField(default=False, verbose_name="Прочитано")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")
    read_at = models.DateTimeField(blank=True, null=True, verbose_name="Прочитано о")

    class Meta:
        verbose_name = "Сповіщення"
        verbose_name_plural = "Сповіщення"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(notification_type__in=[
                    'reminder', 'status_change', 'cancellation',
                    'new_booking', 'promotion', 'system'
                ]),
                name='valid_notification_type'
            ),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} → {self.recipient}"
