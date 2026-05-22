from .models import Category


def resolve_category(category_id=None, category_name=None, user=None):
    """
    Повертає Category: за id, за назвою (глобальна або власна фахівця), або створює власну.
    """
    if category_id:
        return Category.objects.get(pk=category_id, is_active=True)

    name = (category_name or '').strip()
    if not name:
        return None

    global_cat = Category.objects.filter(
        is_global=True, is_active=True, name__iexact=name,
    ).first()
    if global_cat:
        return global_cat

    if user and getattr(user, 'is_authenticated', False) and user.is_employee:
        cat, _ = Category.objects.get_or_create(
            name=name,
            created_by=user,
            is_global=False,
            defaults={'is_active': True},
        )
        return cat

    return None
