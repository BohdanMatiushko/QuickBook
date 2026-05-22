from django.contrib import admin
from .models import Appointment, Review, Payment

admin.site.register(Appointment)
admin.site.register(Review)
admin.site.register(Payment)
