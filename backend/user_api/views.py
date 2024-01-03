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
        recurring_period = request.data.get('recurring_period')
        first_payment_date = request.data.get('first_payment_date')
        final_payment_date = request.data.get('final_payment_date')
        previous_payment_date = request.data.get('previous_payment_date')
        recipient_name = request.data.get('recipient')
        description = request.data.get('description')
        category_description = request.data.get(
            'category')  # New category description
        transaction_type = request.data.get('transaction_type')
        # print(category_description)
        # print(request.data.get('value'))

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
            recipient = Recipient.objects.create(name=recipient_name)

        try:
            # Create the transaction linked to the account and category

            transaction_meta_data = TransactionMetaData.objects.create(
                value=value,
                recurring=recurring,
                recurring_period=recurring_period,
                first_payment_date=first_payment_date,
                final_payment_date=final_payment_date,
                previous_payment_date=previous_payment_date,
                recipient=recipient,
                description=description,
                category=category,
                transaction_type=transaction_type
            )

            transaction = Transaction.objects.create(
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
            if transaction_type == 'income':
                account.current_balance += incoming_value
            if transaction_type == 'expense':
                account.current_balance -= incoming_value
            # Save the updated account object to the database
            account.save()

            return Response(serialized_transaction, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_choices(request):
    if request.method == 'GET':

        try:
            # Fetch category choices from the model
            category_choices = [choice[0]
                                for choice in Category.CATEGORY_CHOICES]

            # Fetch recipient names and their IDs from the Recipient model
            recipients = Recipient.objects.all()
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


# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# def update_transaction(request):
#     if request.method == 'PUT':
#         user = request.user  # Get the authenticated user

#         try:
#             transaction_id = request.data.get('transaction_id')
#             transaction = Transaction.objects.get(pk=transaction_id)

#             account = Account.objects.get(user=user)
#             balance = account.current_balance

#             print(account.current_balance)

#             # Update value in transaction
#             incoming_value_str = request.data.get('value')
#             # Convert incoming value to Decimal
#             incoming_value = Decimal(incoming_value_str)
#             print(incoming_value_str)
#             print(incoming_value)

#             if incoming_value is not None:
#                 # Deduct the existing transaction value from balance
#                 balance -= transaction.value

#                 # Update transaction and meta value
#                 transaction.value = incoming_value

#                 # Add the new transaction value to balance
#                 balance += incoming_value

#             # Fields to be updated
#             fields_to_update = ['value', 'recurring', 'recurring_period', 'first_payment_date',
#                                 'final_payment_date', 'previous_payment_date', 'description']

#             transaction_meta_data_id = request.data.get(
#                 'transaction_meta_data_id')

#             for field in fields_to_update:
#                 field_value = transaction_meta_data_id.get(field)
#                 if field_value is not None:
#                     setattr(transaction.transaction_meta_data_id,
#                             field, field_value)

#             # need special function to update recipient and category
#             recipient_name = transaction_meta_data_id.get('recipient')
#             category_description = transaction_meta_data_id.get('category')

#             try:
#                 # print(recipient_name)
#                 # Check if the category description is within predefined choices
#                 if category_description not in [choice[0] for choice in Category.CATEGORY_CHOICES]:
#                     return Response({'error': 'Invalid category description'}, status=status.HTTP_400_BAD_REQUEST)

#                  # Check if the category already exists
#                 category, created = Category.objects.get_or_create(
#                     description=category_description)
#             except Category.DoesNotExist:
#                 # If the category doesn't exist, create a new one
#                 return Response({'error': 'No category provided'}, status=status.HTTP_400_BAD_REQUEST)

#             try:
#                 # print(recipient_name)
#                 # Check if the recipient already exists
#                 recipient, created = Recipient.objects.get_or_create(
#                     name=recipient_name)
#             except Recipient.DoesNotExist:
#                 # If the recipient doesn't exist, create a new one
#                 recipient = Recipient.objects.create(name=recipient_name)

#             # Update transaction metadata with recipient and category
#             if transaction.transaction_meta_data_id:
#                 transaction.transaction_meta_data_id.recipient = recipient
#                 transaction.transaction_meta_data_id.category = category
#                 transaction.transaction_meta_data_id.save()

#             # Serialize the updated TransactionMetaData instance
#             serializer = TransactionMetaDataSerializer(
#                 transaction.transaction_meta_data_id)
#             serialized_metadata = serializer.data

#             # Serialize the updated Transaction instance
#             serializer = TransactionSerializer(transaction)
#             serialized_transaction = serializer.data

#             return Response({'message': 'Transaction updated successfully', 'transaction_meta_data': serialized_metadata, 'transaction': serialized_transaction}, status=status.HTTP_200_OK)
#         except Transaction.DoesNotExist:
#             return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_transaction(request):
    if request.method == 'PUT':
        user = request.user  # Get the authenticated user

        try:
            # Get Account
            account = Account.objects.get(user=user)
        except Account.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

        print(account)

        try:
            transaction_id = request.data.get('transaction_id')
            transaction = Transaction.objects.get(pk=transaction_id)

            # Get new fields for transaction and cycle through and update with incoming value
            transaction_fields_to_update = ['value', 'recurring', 'recurring_period', 'first_payment_date',
                                            'final_payment_date', 'previous_payment_date', 'description']

            # Same for Trans Meta Deta
            transaction_fields_to_update = ['value', 'recurring', 'recurring_period', 'first_payment_date',
                                            'final_payment_date', 'previous_payment_date', 'description']

        except Transaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'message': 'Transaction updated successfully'}, status=status.HTTP_200_OK)


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

            # Get transaction's value so I can take that from balance
            transaction_value = transaction.transaction_meta_data_id.value
            value = Decimal(transaction_value)

            # Delete the account
            transaction.delete()

            # Grab account and update balance with the transaction value
            account = Account.objects.get(user=user)
            if transaction.transaction_meta_data_id.transaction_type == 'expense':
                account.current_balance += value
            if transaction.transaction_meta_data_id.transaction_type == 'income':
                account.current_balance -= value
            # Save the updated account object to the database
            account.save()

            return Response({'message': 'Transaction deleted successfully'}, status=status.HTTP_200_OK)

        except transaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
