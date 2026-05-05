from django.db import models
from django.conf import settings
from services.models import Service

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Заплановано'),
        ('completed', 'Виконано'),
        ('cancelled', 'Скасовано'),
    ]

    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments', verbose_name="Клієнт")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='appointments', verbose_name="Послуга")
    specialist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_appointments', verbose_name="Фахівець")
    date = models.DateField(verbose_name="Дата")
    start_time = models.TimeField(verbose_name="Час початку")
    end_time = models.TimeField(verbose_name="Час завершення", null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled', verbose_name="Статус")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")

    class Meta:
        verbose_name = "Бронювання"
        verbose_name_plural = "Бронювання"

    def __str__(self):
        return f"{self.client} - {self.service} ({self.date})"
