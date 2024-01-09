# accounts/views.py

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import UserSerializer, AccountSerializer, TransactionSerializer, CategoryChoicesSerializer, RecipientSerializer, TransactionMetaDataSerializer

from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404

from .models import CustomUser, Account, Transaction, Category, TransactionMetaData, Recipient

from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from decimal import Decimal
from datetime import datetime
from django.db.models import Count
from dateutil.relativedelta import relativedelta


# Endpoint for user logout, requires authentication
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    if request.method == 'POST':
        try:
            # Delete the user's token to logout
            request.user.auth_token.delete()
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Endpoint for user login, allows both username and email login


@api_view(['POST'])
def user_login(request):
    if request.method == 'POST':
        print(request.data)  # Print incoming data (for debugging)
        print(request.POST)  # Print POST data (for debugging)
        username = request.data.get('username')
        password = request.data.get('password')

        user = None
        # Check if the input is an email, search by email if true
        if '@' in username:
            try:
                user = CustomUser.objects.get(email=username)
            except ObjectDoesNotExist:
                pass

        # If user not found by email, try username and password
        if not user:
            user = authenticate(username=username, password=password)

        if user:
            # If user found, generate or retrieve token and respond
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user_id': user.id, 'username': user.username, 'status': 'Successfully logged in!'}, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Endpoint to register a new user, doesn't require authentication


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Create a token for the newly registered user
            token, created = Token.objects.get_or_create(user=user)

            # Return the token along with user information
            response_data = {
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                # Add any other user-related information you want to include
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# getting user details


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    if request.method == 'GET':
        user = request.user  # Get the user associated with the token
        account = None

        try:
            token = Token.objects.get(user=user)
            user_token = token.key  # Retrieve the token key
        except Token.DoesNotExist:
            user_token = None

        serialized_account = None
        serialized_transactions = []

        try:
            # Retrieve the account linked to the authenticated user
            account = Account.objects.get(user=user)
            account_serializer = AccountSerializer(account)
            serialized_account = account_serializer.data

            # Retrieve transactions linked to the account
            transactions = Transaction.objects.filter(account=account)
            transaction_serializer = TransactionSerializer(
                transactions, many=True)
            serialized_transactions = transaction_serializer.data
        except Account.DoesNotExist:
            pass

        # Get the current month and year
        today = datetime.now()
        current_month = today.month
        current_year = today.year

        # Get income transactions for the current month and year
        current_month_transactions_income = Transaction.objects.filter(
            date__month=current_month,
            date__year=current_year,
            account=account,
            transaction_meta_data_id__transaction_type='income'
        )

        # Get sum of all ingoing payments
        income_value = sum(
            transaction.transaction_meta_data_id.value for transaction in current_month_transactions_income)

        # Get income transactions for the current month and year
        current_month_transactions_expense = Transaction.objects.filter(
            date__month=current_month,
            date__year=current_year,
            account=account,
            transaction_meta_data_id__transaction_type='expense'
        )

        # Get sum of all outgoing payments
        expense_value = sum(
            transaction.transaction_meta_data_id.value for transaction in current_month_transactions_expense)

        # Get transactions for the current month and year
        current_month_transactions = Transaction.objects.filter(
            date__month=current_month,
            date__year=current_year,
            account=account
        )

        for transaction in current_month_transactions:
         # Access the transaction data for this month and year
            print(
                f"Transaction {transaction.transaction_id}: {transaction.date}")

        current_month_transactions_serializer = TransactionSerializer(
            current_month_transactions, many=True)

        serializer = UserSerializer(user)
        serialized_user = serializer.data

        user_details = {
            'user_id': serialized_user['id'],
            'username': serialized_user['username'],
            'token': user_token,
            'account': serialized_account,
            'transactions': serialized_transactions,
            'current_month_transactions': current_month_transactions_serializer.data,
            'expense_total': expense_value,
            'income_total': income_value
        }

        return Response(user_details, status=status.HTTP_200_OK)


# creating linked account


@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def create_account(request):
    if request.method == 'POST':
        user = request.user  # Get the authenticated user

        # get namne off account from request
        bank_name = request.data.get('bank_name')

        try:
            # Create the account linked to the authenticated user
            account = Account.objects.create(
                bank_name=bank_name,
                current_balance=0,
                user=user  # Link the account to the user
            )

            # Optionally, you can serialize the newly created account
            serializer = AccountSerializer(account)
            serialized_account = serializer.data

            response_data = {
                'message': 'Account created successfully',
                'account': serialized_account  # Include the serialized account data
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# creating transaction


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_transaction(request):
    if request.method == 'POST':
        user = request.user  # Get the authenticated user

        # Extract data from the request
        incoming_value = request.data.get('value')
        value = Decimal(incoming_value)
        recurring = request.data.get('recurring', False)
        recipient_name = request.data.get('recipient')
        description = request.data.get('description')
        category_description = request.data.get(
            'category')  # New category description
        transaction_type = request.data.get('transaction_type')

        # GET DATE FOR TRANSACTION (NOT META)
        date = request.data.get('date')

        try:
            # Retrieve the account linked to the authenticated user
            account = Account.objects.get(user=user)
        except Account.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Check if the category description is within predefined choices
            if category_description not in [choice[0] for choice in Category.CATEGORY_CHOICES]:
                return Response({'error': 'Invalid category description'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if the category already exists
            category = Category.objects.get(description=category_description)
        except Category.DoesNotExist:
            # If the category doesn't exist, create a new one
            category = Category.objects.create(
                description=category_description)

        try:
            # Check if the recipient already exists
            recipient = Recipient.objects.get(name=recipient_name)
        except Recipient.DoesNotExist:
            # If the recipient doesn't exist, create a new one
            recipient = Recipient.objects.create(
                name=recipient_name, account=account)

        try:
            # Create the transaction linked to the account and category

            transaction_meta_data = TransactionMetaData.objects.create(
                value=value,
                recurring=recurring,

                first_payment_date=date,

                recipient=recipient,
                description=description,
                category=category,
                transaction_type=transaction_type
            )

            transaction = Transaction.objects.create(
                # Add date
                date=date,
                # value=value,
                account=account,
                transaction_meta_data_id=transaction_meta_data,
            )

            # Serialize the transaction data before returning in the response
            # Assuming TransactionSerializer exists
            serializer = TransactionSerializer(transaction)
            serialized_transaction = serializer.data

            # Grab account and update balance with the incoming value
            account = Account.objects.get(user=user)
            incoming_value = Decimal(value)

            date_time = datetime.strptime(date, '%Y-%m-%d')
            first_payment_date = date_time

            today = datetime.now()

            if first_payment_date.month == today.month and first_payment_date.year == today.year:

                if transaction_type == 'income':
                    account.current_balance += incoming_value
                if transaction_type == 'expense':
                    account.current_balance -= incoming_value
                # Save the updated account object to the database
                account.save()
            else:
                print('transaction is not this month')

            return Response(serialized_transaction, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_choices(request):
    if request.method == 'GET':
        user = request.user
        account = Account.objects.get(user=user)
        try:
            # Fetch category choices from the model
            category_choices = [choice[0]
                                for choice in Category.CATEGORY_CHOICES]

            # Fetch recipient names and their IDs from the Recipient model
            recipients = Recipient.objects.filter(account=account)
            serializer = RecipientSerializer(recipients, many=True)

            data = {
                'category_choices': category_choices,
                'recipients': serializer.data  # Include recipient IDs and names in the response
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Updating Account


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_account(request):
    if request.method == 'PUT':
        user = request.user  # Get the user associated with the token
    try:
        # Retrieve the account linked to the authenticated user
        account = Account.objects.get(user=user)

        # Retrieve values sent in request payload and update account with them
        bank_name = request.data.get('bank_name')

        account.bank_name = bank_name

        account.save()

        # Serialize account data to return to frontend

        account_serializer = AccountSerializer(account)
        serialized_account = account_serializer.data

        response_data = {
            'message': 'Account updated successfully',
            'account': serialized_account
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Delete account view

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    if request.method == 'DELETE':
        user = request.user  # Get the authenticated user

        try:
            # Retrieve the account linked to the authenticated user
            account = Account.objects.get(user=user)

            # Delete the account
            account.delete()

            return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)

        except Account.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_transaction(request):
    print(request)
    if request.method == 'DELETE':

        user = request.user  # Get the authenticated user

        transaction_id = request.data.get('transaction_id')

        try:
            # Retrieve the account linked to the authenticated user
            transaction = Transaction.objects.get(
                transaction_id=transaction_id)

            # Get transaction's value so I can take that from balance, and also date to compare for affecting balance
            transaction_value = transaction.transaction_meta_data_id.value
            value = Decimal(transaction_value)
            date = transaction.date

            # Delete the account
            transaction.delete()

            # Grab account and update balance with the transaction value
            account = Account.objects.get(user=user)

            today = datetime.now()

            if date.month == today.month and date.year == today.year:

                if transaction.transaction_meta_data_id.transaction_type == 'expense':
                    account.current_balance += value
                if transaction.transaction_meta_data_id.transaction_type == 'income':
                    account.current_balance -= value
                # Save the updated account object to the database
                account.save()
            else:
                print('transaction is not this month')

            return Response({'message': 'Transaction deleted successfully'}, status=status.HTTP_200_OK)

        except transaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transaction_meta_datas(request):
    if request.method == 'GET':

        user = request.user  # Get the authenticated user
        account = Account.objects.get(user=user)

        # Get all transactions from an account

        try:

            # --------------------- Duplicate checking code ------------------------------------
            # Get a count of each unique transaction_meta_data_id
            metadata_count = Transaction.objects.filter(account=account).values(
                'transaction_meta_data_id').annotate(count=Count('transaction_meta_data_id'))

            for item in metadata_count:
                meta_obj = TransactionMetaData.objects.get(
                    transaction_meta_data_id=item['transaction_meta_data_id'])
                if meta_obj.recurring is True:

                    print(meta_obj.recurring)
                    print(meta_obj.value)

            # Filter out duplicates (where count is greater than 1)
            duplicates = [item['transaction_meta_data_id']
                          for item in metadata_count if item['count'] > 1]

            # Filter transactions_for_account by checking for duplicate transaction_meta_data_id
            duplicate_transactions = Transaction.objects.filter(
                account=account, transaction_meta_data_id__in=duplicates)

            # Now, duplicate_transactions contains transactions with duplicate metadata
            # You can loop through these to inspect or handle them as needed
            # Serialize duplicate transactions
            duplicate_serializer = TransactionSerializer(
                duplicate_transactions, many=True)

            data = {
                'trans_with_duplicates': duplicate_serializer.data, 'count': metadata_count,
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# CREATING FUNCTION TO MIMIC NEW MONTH FUNCTION
# Goal is to start balance with 0 and make all the new transactions, find out what the remaining balance is and then send the balance and transactions back sorted via income vs expense
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_test_func(request):
    if request.method == 'GET':

        user = request.user  # Get the authenticated user
        # Get the user's account
        try:
            account = Account.objects.get(user=user)
            # resetting account balance
            account.current_balance = 0
            account.save()
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Get the current month and year
            today = datetime.now()
            current_month = today.month
            current_year = today.year

            # ------------ ADDING CODE -------------
            # Get a count of each unique transaction_meta_data_id
            metadata_count = Transaction.objects.filter(account=account).values(
                'transaction_meta_data_id').annotate(count=Count('transaction_meta_data_id'))

            for item in metadata_count:
                meta_obj = TransactionMetaData.objects.get(
                    transaction_meta_data_id=item['transaction_meta_data_id'])
                if meta_obj.recurring is True:
                    delta = relativedelta(meta_obj.first_payment_date, today)
                    if delta.months > 0 or delta.years > 0:
                        # first_payment_date is in a future month compared to today
                        continue  # Skip creating a transaction for this meta_obj

                    print(meta_obj.recurring)
                    print(meta_obj.value)

                    first_payment_day = meta_obj.first_payment_date.day
                    new_date = datetime(today.year, today.month,
                                        first_payment_day).date()

                    Transaction.objects.create(
                        # Add date
                        date=new_date,
                        # value=value,
                        account=account,
                        transaction_meta_data_id=meta_obj,
                    )

                    if meta_obj.transaction_type == 'expense':
                        account.current_balance -= Decimal(meta_obj.value)
                    if meta_obj.transaction_type == 'income':
                        account.current_balance += Decimal(meta_obj.value)
                        # Save the updated account object to the database
                    account.save()

            # Get income transactions for the current month and year
            current_month_transactions_income = Transaction.objects.filter(
                date__month=current_month,
                date__year=current_year,
                account=account,
                transaction_meta_data_id__transaction_type='income'
            )

            income_value = sum(
                transaction.transaction_meta_data_id.value for transaction in current_month_transactions_income)

            print(current_month_transactions_income)
            print(income_value)

            # Get income transactions for the current month and year
            current_month_transactions_expense = Transaction.objects.filter(
                date__month=current_month,
                date__year=current_year,
                account=account,
                transaction_meta_data_id__transaction_type='expense'
            )

            expense_value = sum(
                transaction.transaction_meta_data_id.value for transaction in current_month_transactions_expense)

            print(current_month_transactions_expense)
            print(expense_value)

            # ------------------ END -------------------

            transactions_for_account = Transaction.objects.filter(
                account=account)

            # serialize transactions to send back
            serialized_transactions = TransactionSerializer(
                transactions_for_account, many=True)

            data = {
                'transactions': serialized_transactions.data,
                # 'transaction_metadata_list': meta_data_serializer.data,
                'expenses': expense_value,
                'incomes': income_value,
                # 'income_value': income_values,
                # 'expense_value': expense_values,
                # 'balance': balance,
                # 'recurring_transactions': recurring_serializer.data,
                # 'not_recurring_transactions': not_recurring_serializer.data
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_all_transactions(request):
    if request.method == 'DELETE':

        user = request.user  # Get the authenticated user
        # Get the user's account
        account = Account.objects.get(user=user)

        try:
            transactions_for_account = Transaction.objects.filter(
                account=account)

            transactions_for_account.delete()

            account.current_balance = 0

            # Save the updated account object to the database
            account.save()

            return Response('successfully deleted transactions', status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transactions_by_month(request):
    if request.method == 'GET':

        user = request.user  # Get the authenticated user
        # Get the user's account
        account = Account.objects.get(user=user)
        date_string = request.data.get('date')
        date = datetime.strptime(date_string, "%Y-%m-%d")
        month = date.month
        year = date.year

        try:
            # get account balance
            balance = account.current_balance

            # filter transactions by date and account
            transactions_for_account_by_date = Transaction.objects.filter(
                account=account,
                date__month=month,
                date__year=year
            ).order_by('date')

            transaction_serializer = TransactionSerializer(
                transactions_for_account_by_date, many=True)

            data = {
                'transactions': transaction_serializer.data,
                'balance': balance
            }
            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
