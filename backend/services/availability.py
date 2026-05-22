from datetime import datetime, timedelta, time as dt_time
from django.utils import timezone

from appointments.models import Appointment


WORKDAY_START = dt_time(8, 0)
WORKDAY_END = dt_time(20, 0)


def _time_to_minutes(t):
    return t.hour * 60 + t.minute


def _minutes_to_time(minutes):
    h, m = divmod(minutes, 60)
    return dt_time(h, m)


def _duration_minutes(duration):
    if duration is None:
        return 30
    return int(duration.total_seconds() // 60)


def _appointments_for_date(service, date, specialist=None):
    qs = Appointment.objects.filter(
        service=service,
        date=date,
        status='scheduled',
    )
    if specialist:
        qs = qs.filter(specialist=specialist)
    return list(qs)


def _count_at_slot(appointments, slot_time, duration_minutes):
    slot_start = _time_to_minutes(slot_time)
    slot_end = slot_start + duration_minutes
    count = 0
    for apt in appointments:
        apt_start = _time_to_minutes(apt.start_time)
        apt_end = _time_to_minutes(apt.end_time) if apt.end_time else apt_start + duration_minutes
        if apt_start < slot_end and apt_end > slot_start:
            count += 1
    return count


def is_weekday_available(service, date):
    weekdays = service.available_weekdays or [0, 1, 2, 3, 4, 5, 6]
    return date.weekday() in weekdays


def get_availability(service, date):
    """Повертає слоти для UI: доступні та зайняті з мінімальною інформацією."""
    if not is_weekday_available(service, date):
        return {
            'date': str(date),
            'booking_mode': service.booking_mode,
            'display_mode': service.display_mode,
            'day_unavailable': True,
            'slots': [],
        }

    specialist = service.owner
    appointments = _appointments_for_date(service, date, specialist)
    duration_min = _duration_minutes(service.duration)
    max_clients = service.max_clients
    slots = []

    if service.booking_mode == 'fixed_slots':
        fixed_times = list(
            service.time_slots.values_list('start_time', flat=True).order_by('start_time')
        )
        if not fixed_times:
            fixed_times = [dt_time(9, 0), dt_time(16, 0), dt_time(20, 0)]

        for slot_time in fixed_times:
            booked = _count_at_slot(appointments, slot_time, duration_min)
            is_busy = booked >= max_clients
            entry = {
                'time': slot_time.strftime('%H:%M'),
                'is_busy': is_busy,
                'is_available': not is_busy,
            }
            if max_clients > 1:
                entry['spots_remaining'] = max(0, max_clients - booked)
                if booked > 0:
                    entry['booked_count'] = booked
            slots.append(entry)
    else:
        start_min = _time_to_minutes(WORKDAY_START)
        end_min = _time_to_minutes(WORKDAY_END)
        current = start_min
        while current + duration_min <= end_min:
            slot_time = _minutes_to_time(current)
            booked = _count_at_slot(appointments, slot_time, duration_min)
            is_busy = booked >= max_clients
            entry = {
                'time': slot_time.strftime('%H:%M'),
                'is_busy': is_busy,
                'is_available': not is_busy,
            }
            if max_clients > 1 and booked > 0:
                entry['spots_remaining'] = max(0, max_clients - booked)
                entry['booked_count'] = booked
            slots.append(entry)
            current += duration_min

    return {
        'date': str(date),
        'booking_mode': service.booking_mode,
        'display_mode': service.display_mode,
        'max_clients': max_clients,
        'duration_minutes': duration_min,
        'slots': slots,
    }


def validate_booking(service, date, start_time):
    """Перевірка перед створенням бронювання."""
    from rest_framework.exceptions import ValidationError

    if not is_weekday_available(service, date):
        raise ValidationError('Запис недоступний у цей день тижня.')

    availability = get_availability(service, date)
    time_str = start_time.strftime('%H:%M') if hasattr(start_time, 'strftime') else str(start_time)[:5]
    slot = next((s for s in availability['slots'] if s['time'] == time_str), None)
    if not slot:
        raise ValidationError('Обраний час недоступний для цієї послуги.')
    if not slot.get('is_available', not slot.get('is_busy')):
        raise ValidationError('Цей час вже зайнятий.')
    return True


def compute_end_time(start_time, duration):
    start_dt = datetime.combine(datetime.today(), start_time)
    end_dt = start_dt + duration
    return end_dt.time()
