from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Назва категорії")

    class Meta:
        verbose_name = "Категорія"
        verbose_name_plural = "Категорії"

    def __str__(self):
        return self.name

class Service(models.Model):
    name = models.CharField(max_length=255, verbose_name="Назва послуги")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='services', verbose_name="Категорія")
    description = models.TextField(blank=True, verbose_name="Опис")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Ціна")
    duration = models.DurationField(verbose_name="Тривалість")

    class Meta:
        verbose_name = "Послуга"
        verbose_name_plural = "Послуги"

    def __str__(self):
        return self.name
