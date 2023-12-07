# myapp/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Account, Category, Transaction  # Import your custom user model

admin.site.register(CustomUser, UserAdmin)
admin.site.register(Account)
admin.site.register(Category)
admin.site.register(Transaction)