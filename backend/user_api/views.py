# accounts/views.py

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import UserSerializer, AccountSerializer, TransactionSerializer

from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist

from .models import CustomUser, Account, Transaction, Category

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_account(request):
    if request.method == 'POST':
        user = request.user  # Get the authenticated user

        # You might receive some additional data in the request body
        # For example, 'bank_name', 'initial_balance', etc.
        bank_name = request.data.get('bank_name')
        initial_balance = request.data.get(
            'initial_balance', 0)  # Default balance

        try:
            # Create the account linked to the authenticated user
            account = Account.objects.create(
                bank_name=bank_name,
                current_balance=initial_balance,
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
        value = request.data.get('value')
        recurring = request.data.get('recurring', False)
        description = request.data.get('description')
        category_description = request.data.get(
            'category_description')  # New category description

        try:
            # Retrieve the account linked to the authenticated user
            account = Account.objects.get(user=user)
        except Account.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Check if the category already exists
            category = Category.objects.get(description=category_description)
        except Category.DoesNotExist:
            # If the category doesn't exist, create a new one
            category = Category.objects.create(
                description=category_description)

        try:
            # Create the transaction linked to the account and category
            transaction = Transaction.objects.create(
                value=value,
                recurring=recurring,
                description=description,
                category=category,
                account=account
            )
            # Serialize the transaction data before returning in the response
            # Assuming TransactionSerializer exists
            serializer = TransactionSerializer(transaction)
            serialized_transaction = serializer.data

            return Response(serialized_transaction, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
