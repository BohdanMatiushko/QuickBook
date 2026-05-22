# QuickBook — Архітектура Системи (C4 Model)

Цей документ описує архітектуру системи бронювання послуг QuickBook на рівнях Контексту (Level 1) та Контейнерів (Level 2).

## C4 Level 1: System Context Diagram

Діаграма контексту показує систему QuickBook в оточенні її користувачів та зовнішніх систем.

```mermaid
C4Context
    title System Context diagram for QuickBook System

    Person(client, "Клієнт", "Користувач, який шукає та бронює послуги.")
    Person(admin, "Адміністратор / Фахівець", "Співробітник, який керує послугами, розкладом та записами.")
    
    System(quickbook, "QuickBook System", "Дозволяє клієнтам бронювати послуги, залишати відгуки, а адміністраторам — керувати каталогом послуг та записами.")

    System_Ext(email_system, "E-mail System", "Зовнішня система для відправки електронних листів.")
    System_Ext(payment_gateway, "Payment Gateway", "Зовнішня система для обробки онлайн-оплат (наприклад, LiqPay, Stripe).")

    Rel(client, quickbook, "Переглядає послуги, бронює, залишає відгуки", "HTTPS")
    Rel(admin, quickbook, "Керує каталогом послуг, розкладом, переглядає записи", "HTTPS")
    
    Rel(quickbook, email_system, "Відправляє сповіщення про бронювання", "SMTP/API")
    Rel(quickbook, payment_gateway, "Ініціює обробку платежів", "HTTPS/API")
    Rel(email_system, client, "Надсилає листи (нагадування, статуси)")
```

## C4 Level 2: Container Diagram

Діаграма контейнерів розкриває внутрішню структуру системи QuickBook, показуючи веб-додаток (який поєднує Frontend та Backend в Django) та базу даних.

```mermaid
C4Container
    title Container diagram for QuickBook System

    Person(client, "Клієнт", "Користувач, який шукає та бронює послуги.")
    Person(admin, "Адміністратор / Фахівець", "Співробітник, який керує послугами, розкладом та записами.")

    System_Boundary(c1, "QuickBook System") {
        Container(web_app, "Web Application (Django App)", "Python, Django, HTML/CSS/JS", "Надає користувацький інтерфейс для клієнтів та адміністраторів (Server-Side Rendered), обробляє бізнес-логіку бронювання, користувачів та розкладу.")
        ContainerDb(db, "Database", "PostgreSQL", "Зберігає дані користувачів, послуг, бронювань, відгуків, розкладів та сповіщень.")
    }

    System_Ext(email_system, "E-mail System", "Зовнішній сервіс розсилки.")
    System_Ext(payment_gateway, "Payment Gateway", "Система обробки платежів.")

    Rel(client, web_app, "Використовує (перегляд, бронювання)", "HTTPS")
    Rel(admin, web_app, "Використовує (керування)", "HTTPS")

    Rel(web_app, db, "Читає/Записує дані", "TCP/IP, psycopg2")
    
    Rel(web_app, email_system, "Відправляє листи", "SMTP/API")
    Rel(web_app, payment_gateway, "Виконує транзакції", "HTTPS/API")
```

## Деталі Контейнерів

1. **Web Application (Django App)**:
   * **Технології**: Python 3.12, Django 6, Django REST Framework (якщо планується API для окремого фронтенду).
   * **Роль**: Обслуговує HTTP запити, рендерить HTML-сторінки (або видає JSON API), керує сесіями та аутентифікацією, реалізує бізнес-логіку (перевірка доступності слотів, зміна статусів).
2. **Database (PostgreSQL)**:
   * **Технології**: PostgreSQL 15.
   * **Роль**: Надійне реляційне сховище для усіх сутностей (User, Service, Appointment, Review, Payment тощо), налаштоване через Docker Volume для збереження даних.
