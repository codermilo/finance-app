from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin


class AppUserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError('An email is required.')
        if not password:
            raise ValueError('A password is required.')
        email = self.normalize_email(email)
        user = self.model(email=email)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None):
        if not email:
            raise ValueError('An email is required.')
        if not password:
            raise ValueError('A password is required.')
        user = self.create_user(email, password)
        user.is_superuser = True
        user.save()
        return user


class AppUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=50, unique=True)
    username = models.CharField(max_length=50)
    account = models.OneToOneField(
        'Account', on_delete=models.CASCADE, related_name='account_holder', null=True, blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    objects = AppUserManager()

    def __str__(self):
        return self.username


class Account(models.Model):
    account_id = models.AutoField(primary_key=True)
    current_balance = models.DecimalField(
        default=500, max_digits=10, decimal_places=2)
    bank_name = models.CharField(max_length=100)
    user = models.OneToOneField(AppUser, on_delete=models.CASCADE,
                                related_name='associated_account', null=True, blank=True)

    def __str__(self):
        return f"Account {self.account_id} - {self.bank_name}"


class Category(models.Model):
    CATEGORY_CHOICES = [
        ('Utilities', 'Utilities'),
        ('Food', 'Food'),
        ('Tax', 'Tax'),
        ('Mortgage', 'Mortgage'),
        ('Luxury', 'Luxury'),
        ('Other', 'Other'),
    ]

    category_id = models.AutoField(primary_key=True)
    description = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='Other'
    )

    def __str__(self):
        return self.description


class Transaction(models.Model):
    transaction_id = models.AutoField(primary_key=True)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    recurring = models.BooleanField(default=False)
    description = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    account = models.ForeignKey(
        Account, on_delete=models.CASCADE, related_name='transactions')

    def __str__(self):
        return f"Transaction {self.transaction_id}: {self.description}"
