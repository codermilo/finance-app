# accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import datetime


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    # Add custom fields here, if needed

    def __str__(self):
        return self.username


class Account(models.Model):
    account_id = models.AutoField(primary_key=True)
    current_balance = models.DecimalField(
        default=0, max_digits=10, decimal_places=2)
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


# recipient object for handling names of recipients of transactions


class Recipient(models.Model):
    # Assuming unique recipient names
    name = models.CharField(max_length=100, unique=True)
    # I want to tie recipients to a specific account
    account = models.ForeignKey(
        Account, on_delete=models.CASCADE, related_name='recipient', null=True)

    def __str__(self):
        return self.name


# object that holds all the data for each transaction. One can be related to many transaction objects


class TransactionMetaData(models.Model):
    transaction_meta_data_id = models.AutoField(primary_key=True)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    recurring = models.BooleanField(default=False)
    first_payment_date = models.DateField()
    recipient = models.ForeignKey(
        Recipient, on_delete=models.CASCADE, null=True)
    description = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    # Transaction_type can only be "income" or "expense"
    TRANSACTION_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    transaction_type = models.CharField(
        max_length=10,
        choices=TRANSACTION_CHOICES,
        default='expense'
    )

    def __str__(self):
        return f"Transaction {self.transaction_meta_data_id}: {self.description}"

# object that is made for each transaction, most of the data is in the linked meta data object. Many of these can be linked to a single meta data object


class Transaction(models.Model):
    transaction_id = models.AutoField(primary_key=True)
    # value = models.DecimalField(max_digits=10, decimal_places=2)
    # ADDING DATE FOR EACH TRANSACTION
    # WHEN I MAKE A NEW TRASACTION WITH RECURRING VIEW I NEED TO GIVE A NEW DATE (Same date but new month)
    date = models.DateField(default=datetime.now)
    account = models.ForeignKey(
        Account, on_delete=models.CASCADE, related_name='transactions')
    transaction_meta_data_id = models.ForeignKey(
        TransactionMetaData, on_delete=models.CASCADE, related_name='transaction_meta_data', null=True)

    def __str__(self):
        return f"Transaction {self.transaction_id}: {self.transaction_meta_data_id.description}"
