from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Назва категорії")
    description = models.TextField(blank=True, verbose_name="Опис категорії")
    icon = models.CharField(max_length=100, blank=True, null=True, verbose_name="Іконка")
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    sort_order = models.IntegerField(default=0, verbose_name="Порядок сортування")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")

    class Meta:
        verbose_name = "Категорія"
        verbose_name_plural = "Категорії"
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class Service(models.Model):
    name = models.CharField(max_length=255, verbose_name="Назва послуги")
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE,
        related_name='services', verbose_name="Категорія"
    )
    description = models.TextField(blank=True, verbose_name="Опис")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Ціна")
    duration = models.DurationField(verbose_name="Тривалість")
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    max_clients = models.PositiveIntegerField(default=1, verbose_name="Макс. кількість клієнтів")
    image_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL зображення")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Оновлено")

    class Meta:
        verbose_name = "Послуга"
        verbose_name_plural = "Послуги"

    def __str__(self):
        return self.name


class ServiceSpecialist(models.Model):
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE,
        related_name='service_specialists', verbose_name="Послуга"
    )
    specialist = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='specialist_services', verbose_name="Фахівець"
    )
    experience_years = models.PositiveIntegerField(
        default=0, verbose_name="Років досвіду"
    )
    is_primary = models.BooleanField(default=False, verbose_name="Основний фахівець")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")

    class Meta:
        verbose_name = "Фахівець послуги"
        verbose_name_plural = "Фахівці послуг"
        constraints = [
            models.UniqueConstraint(
                fields=['service', 'specialist'],
                name='unique_service_specialist'
            ),
        ]

    def __str__(self):
        return f"{self.specialist} — {self.service}"
