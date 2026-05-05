from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    first_name = models.CharField(max_length=40, blank=True, null=True, verbose_name="Ім'я")
    last_name = models.CharField(max_length=40, blank=True, null=True, verbose_name="Фамілія")
    password = models.CharField(max_length=255, blank=True, null=True, verbose_name="Пароль")
    email = models.EmailField(unique=True, blank=True, null=True, verbose_name='Електронна-адреса')
    phone_number = models.CharField(max_length=15, blank=True, null=True, verbose_name="Номер телефону")
    is_client = models.BooleanField(default=True, verbose_name="Клієнт")
    is_employee = models.BooleanField(default=False, verbose_name="Співробітник")

    def __str__(self):
        return f"{self.username} ({self.get_full_name()})"
