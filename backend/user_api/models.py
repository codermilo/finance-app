# accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    # Add custom fields here, if needed

    def __str__(self):
        return self.username
    
class Account(models.Model):
    account_id = models.AutoField(primary_key=True)
    current_balance = models.DecimalField(
        default=500, max_digits=10, decimal_places=2)
    bank_name = models.CharField(max_length=100)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE,
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
