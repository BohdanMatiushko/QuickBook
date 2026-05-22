from django.contrib import admin
from .models import User, WorkSchedule, Notification

admin.site.register(User)
admin.site.register(WorkSchedule)
admin.site.register(Notification)
