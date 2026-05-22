from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from services.models import Service


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Заплановано'),
        ('completed', 'Виконано'),
        ('cancelled', 'Скасовано'),
    ]

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='appointments', verbose_name="Клієнт"
    )
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE,
        related_name='appointments', verbose_name="Послуга"
    )
    specialist = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_appointments', verbose_name="Фахівець"
    )
    date = models.DateField(verbose_name="Дата")
    start_time = models.TimeField(verbose_name="Час початку")
    end_time = models.TimeField(verbose_name="Час завершення", null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES,
        default='scheduled', verbose_name="Статус"
    )
    notes = models.TextField(blank=True, verbose_name="Примітки")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")

    class Meta:
        verbose_name = "Бронювання"
        verbose_name_plural = "Бронювання"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=['scheduled', 'completed', 'cancelled']),
                name='valid_appointment_status'
            ),
        ]

    def __str__(self):
        return f"{self.client} - {self.service} ({self.date})"


class Review(models.Model):
    appointment = models.OneToOneField(
        Appointment, on_delete=models.CASCADE,
        related_name='review', verbose_name="Бронювання"
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='reviews', verbose_name="Клієнт"
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Оцінка"
    )
    comment = models.TextField(blank=True, verbose_name="Коментар")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Оновлено")

    class Meta:
        verbose_name = "Відгук"
        verbose_name_plural = "Відгуки"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(rating__gte=1, rating__lte=5),
                name='valid_review_rating'
            ),
        ]

    def __str__(self):
        return f"Відгук від {self.client} — {self.rating}★"


class Payment(models.Model):
    METHOD_CHOICES = [
        ('cash', 'Готівка'),
        ('card', 'Банківська картка'),
        ('online', 'Онлайн-оплата'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Очікує'),
        ('paid', 'Оплачено'),
        ('refunded', 'Повернено'),
        ('failed', 'Невдало'),
    ]

    appointment = models.OneToOneField(
        Appointment, on_delete=models.CASCADE,
        related_name='payment', verbose_name="Бронювання"
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Сума"
    )
    payment_method = models.CharField(
        max_length=20, choices=METHOD_CHOICES,
        verbose_name="Метод оплати"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES,
        default='pending', verbose_name="Статус оплати"
    )
    transaction_id = models.CharField(
        max_length=255, unique=True, blank=True, null=True,
        verbose_name="ID транзакції"
    )
    paid_at = models.DateTimeField(
        blank=True, null=True, verbose_name="Оплачено о"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Оновлено")

    class Meta:
        verbose_name = "Оплата"
        verbose_name_plural = "Оплати"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=['pending', 'paid', 'refunded', 'failed']),
                name='valid_payment_status'
            ),
            models.CheckConstraint(
                condition=models.Q(payment_method__in=['cash', 'card', 'online']),
                name='valid_payment_method'
            ),
        ]

    def __str__(self):
        return f"Оплата #{self.id} — {self.amount} грн ({self.get_status_display()})"
