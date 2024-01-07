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
            pass  # Handle the case where the account doesn't exist gracefully

        serializer = UserSerializer(user)
        serialized_user = serializer.data

        user_details = {
            'user_id': serialized_user['id'],
            'username': serialized_user['username'],
            'token': user_token,
            'account': serialized_account,
            'transactions': serialized_transactions
        }

        return Response(user_details, status=status.HTTP_200_OK)


# creating linked account


@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def create_account(request):
    if request.method == 'POST':
        user = request.user  # Get the authenticated user

        # You might receive some additional data in the request body
        # For example, 'bank_name', 'initial_balance', etc.
        bank_name = request.data.get('bank_name')
        # initial_balance = request.data.get(
        #     'current_balance', 0)  # Default balance
        # balance = Decimal(initial_balance)

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

    # elif request.method == 'PUT':
    #     user = request.user  # Get the authenticated user
    #     # Handle account update logic
    #     try:
    #         account = Account.objects.get(user=user)  # Get the user's account
    #         serializer = AccountSerializer(
    #             account, data=request.data, partial=True)

    #         if serializer.is_valid():
    #             serializer.save()
    #             return Response({'message': 'Account updated successfully', 'account': serializer.data}, status=status.HTTP_200_OK)
    #         else:
    #             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    #     except Account.DoesNotExist:
    #         return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

    #     except Exception as e:
    #         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

        # first_payment_date = request.data.get('first_payment_date')

        recipient_name = request.data.get('recipient')
        description = request.data.get('description')
        category_description = request.data.get(
            'category')  # New category description
        transaction_type = request.data.get('transaction_type')
        # print(category_description)
        # print(request.data.get('value'))

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
            print(first_payment_date.month)
            today = datetime.now()
            print(today.month)
            if first_payment_date.month == today.month and first_payment_date.year == today.year:
                print(first_payment_date)
                print(today.month)
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
        # current_balance = request.data.get(
        #     'current_balance', 0)

        account.bank_name = bank_name
        # account.current_balance = current_balance

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
        print(request.data)
        print(transaction_id)

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

            print(date.month)
            today = datetime.now()
            print(today.month)
            if date.month == today.month and date.year == today.year:
                print(date.month)
                print(today.month)
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

            # transactions_for_account = Transaction.objects.filter(
            #     account=account)

            # # find the trans meta data for every transaction in transactions_for_account
            # transactionmetadatas_for_account = [
            #     transaction.transaction_meta_data_id for transaction in transactions_for_account]

            # # Serialize the trans meta data to send back
            # serializer = TransactionMetaDataSerializer(
            #     transactionmetadatas_for_account, many=True)

            # data = {
            #     'transaction_metadata_list': serializer.data,
            # }

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

                # if item['recurring'] is True:
                #     print(item['transaction_meta_data_id'])

            # Filter out duplicates (where count is greater than 1)
            duplicates = [item['transaction_meta_data_id']
                          for item in metadata_count if item['count'] > 1]

            # Filter transactions_for_account by checking for duplicate transaction_meta_data_id
            duplicate_transactions = Transaction.objects.filter(
                account=account, transaction_meta_data_id__in=duplicates)

            # Now, duplicate_transactions contains transactions with duplicate metadata
            # You can loop through these to inspect or handle them as needed
            # Serialize duplicate transactions
            duplicate_Serializer = TransactionSerializer(
                duplicate_transactions, many=True)

            data = {
                'trans_with_duplicates': duplicate_Serializer.data, 'count': metadata_count,
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
            account.current_balance = 0
            account.save()
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Get all transactions from an account

        try:

            # transactions_for_account = Transaction.objects.filter(
            #     account=account)

            # # serialize transactions to send back
            # serialized_transactions = TransactionSerializer(
            #     transactions_for_account, many=True)

            # # find the trans meta data for every transaction in transactions_for_account
            # transactionmetadatas_for_account = [
            #     transaction.transaction_meta_data_id for transaction in transactions_for_account]

            # # Serialize the trans meta data to send back
            # meta_data_serializer = TransactionMetaDataSerializer(
            #     transactionmetadatas_for_account, many=True)

            # # Filter transactions based on metadata's transaction_type
            # expense_transactions = Transaction.objects.filter(
            #     account=account,
            #     transaction_meta_data_id__transaction_type='expense'
            # )

            # serialized_expenses = TransactionSerializer(
            #     expense_transactions, many=True)

            # # Filter transactions based on metadata's transaction_type
            # income_transactions = Transaction.objects.filter(
            #     account=account,
            #     transaction_meta_data_id__transaction_type='income'
            # )

            # serialized_incomes = TransactionSerializer(
            #     income_transactions, many=True)

            # # Filter only the value of incomes
            # income_values = sum(
            #     transaction.transaction_meta_data_id.value for transaction in income_transactions)

            # # Filter only the value of expenses
            # expense_values = sum(
            #     transaction.transaction_meta_data_id.value for transaction in expense_transactions)

            # balance = income_values - expense_values

            # # Get all transactions that's meta data has recurring as true
            # recurring_transactions = TransactionMetaData.objects.filter(
            #     transaction_meta_data__account=account,
            #     recurring=True
            # )
            # # Duplicate transactions that's meta data has recurring as true
            # # print(recurring_transactions)
            # recurring_serializer = TransactionMetaDataSerializer(
            #     recurring_transactions, many=True)

            # # Get all transactions that's meta data has recurring as false
            # not_recurring_transactions = TransactionMetaData.objects.filter(
            #     transaction_meta_data__account=account,
            #     recurring=False
            # )

            # ------------ ADDING CODE -------------
            # Get a count of each unique transaction_meta_data_id
            metadata_count = Transaction.objects.filter(account=account).values(
                'transaction_meta_data_id').annotate(count=Count('transaction_meta_data_id'))

            for item in metadata_count:
                meta_obj = TransactionMetaData.objects.get(
                    transaction_meta_data_id=item['transaction_meta_data_id'])
                if meta_obj.recurring is True:

                    print(meta_obj.recurring)
                    print(meta_obj.value)

                    first_payment_day = meta_obj.first_payment_date.day
                    today = datetime.now()
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

            # ------------------ END -------------------

            # for meta_data in metadata_count:
            #     # Assuming meta_data.first_payment_date is a datetime.date object
            #     first_payment_day = meta_data.first_payment_date.day

            #     print(first_payment_day)

            #     # Get today's date
            #     today = datetime.now()

            #     # Create a new date with the day from first_payment_date and the month and year from today
            #     new_date = datetime(today.year, today.month,
            #                         first_payment_day).date()

            #     print(new_date.strftime('%Y-%m-%d'))

            #     # Create new transaction based on recurring meta datas
            #     Transaction.objects.create(
            #         # Add date
            #         date=formatted_today,
            #         # value=value,
            #         account=account,
            #         transaction_meta_data_id=meta_data,
            #     )

            # Duplicate transactions that's meta data has recurring as false
            # print(not_recurring_transactions)
            # not_recurring_serializer = TransactionMetaDataSerializer(
            #     not_recurring_transactions, many=True)

            transactions_for_account = Transaction.objects.filter(
                account=account)

            # serialize transactions to send back
            serialized_transactions = TransactionSerializer(
                transactions_for_account, many=True)

            data = {
                'transactions': serialized_transactions.data,
                # 'transaction_metadata_list': meta_data_serializer.data,
                # 'expenses': serialized_expenses.data,
                # 'incomes': serialized_incomes.data,
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
