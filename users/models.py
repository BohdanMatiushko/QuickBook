from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True, verbose_name="Номер телефону")
    is_client = models.BooleanField(default=True, verbose_name="Клієнт")
    is_employee = models.BooleanField(default=False, verbose_name="Співробітник")

    def __str__(self):
        return f"{self.username} ({self.get_full_name()})"
