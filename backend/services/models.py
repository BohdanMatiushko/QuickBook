from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Назва категорії")
    description = models.TextField(blank=True, verbose_name="Опис категорії")
    icon = models.CharField(max_length=100, blank=True, null=True, verbose_name="Іконка")
    is_global = models.BooleanField(
        default=False,
        verbose_name="Загальна (для всіх фахівців)",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='custom_categories',
        verbose_name="Автор (власна категорія)",
    )
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    sort_order = models.IntegerField(default=0, verbose_name="Порядок сортування")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")

    class Meta:
        verbose_name = "Категорія"
        verbose_name_plural = "Категорії"
        ordering = ['sort_order', 'name']
        constraints = [
            models.UniqueConstraint(
                fields=['name'],
                condition=models.Q(is_global=True),
                name='unique_global_category_name',
            ),
            models.UniqueConstraint(
                fields=['name', 'created_by'],
                condition=models.Q(is_global=False),
                name='unique_custom_category_per_specialist',
            ),
        ]

    def __str__(self):
        return self.name


class Service(models.Model):
    BOOKING_MODE_CHOICES = [
        ('fixed_slots', 'Фіксовані години'),
        ('duration_slots', 'Слоти за тривалістю'),
    ]
    DISPLAY_MODE_CHOICES = [
        ('tiles', 'Плитки'),
        ('timeline', 'Стрічка часу'),
    ]

    name = models.CharField(max_length=255, verbose_name="Назва послуги")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='owned_services', null=True, blank=True,
        verbose_name="Власник (фахівець)"
    )
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE,
        related_name='services', verbose_name="Категорія"
    )
    description = models.TextField(blank=True, verbose_name="Опис")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Ціна")
    duration = models.DurationField(verbose_name="Тривалість")
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    max_clients = models.PositiveIntegerField(default=1, verbose_name="Макс. кількість клієнтів")
    booking_mode = models.CharField(
        max_length=20, choices=BOOKING_MODE_CHOICES,
        default='duration_slots', verbose_name="Формат бронювання"
    )
    display_mode = models.CharField(
        max_length=20, choices=DISPLAY_MODE_CHOICES,
        default='timeline', verbose_name="Відображення слотів"
    )
    available_weekdays = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Дні для запису (0=Пн … 6=Нд)",
        help_text="Порожній список = усі дні тижня",
    )
    image_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL зображення")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Створено")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Оновлено")

    class Meta:
        verbose_name = "Послуга"
        verbose_name_plural = "Послуги"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.display_mode = 'tiles' if self.booking_mode == 'fixed_slots' else 'timeline'
        if not self.available_weekdays:
            self.available_weekdays = [0, 1, 2, 3, 4, 5, 6]
        super().save(*args, **kwargs)


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


class ServiceTimeSlot(models.Model):
    """Фіксовані години для послуг типу «тренер» (9:00, 16:00, 20:00)."""
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE,
        related_name='time_slots', verbose_name="Послуга"
    )
    start_time = models.TimeField(verbose_name="Час початку")

    class Meta:
        verbose_name = "Фіксований слот"
        verbose_name_plural = "Фіксовані слоти"
        ordering = ['start_time']
        constraints = [
            models.UniqueConstraint(
                fields=['service', 'start_time'],
                name='unique_service_start_time'
            ),
        ]

    def __str__(self):
        return f"{self.service.name} @ {self.start_time}"
