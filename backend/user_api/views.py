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

# create account


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
