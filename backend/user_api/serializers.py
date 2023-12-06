from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from .models import Account, Transaction

UserModel = get_user_model()


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'  # Specify the fields you want to include


class AccountSerializer(serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Account
        fields = ['account_id', 'current_balance', 'bank_name', 'transactions']


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = '__all__'

    def create(self, clean_data):
        print(clean_data)
        print(clean_data['accountDetails'])
        current_balance = clean_data['accountDetails']['current_balance']
        bank_name = clean_data['accountDetails']['bank_name']
        account = Account.objects.create(
            current_balance=current_balance, bank_name=bank_name)
        user_obj = UserModel.objects.create_user(
            email=clean_data['email'], password=clean_data['password'])
        user_obj.username = clean_data['username']
        user_obj.account = account
        user_obj.save()
        return user_obj


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    ##

    def check_user(self, clean_data):
        user = authenticate(
            username=clean_data['email'], password=clean_data['password'])
        if not user:
            raise ValidationError('user not found')
        return user


class UserSerializer(serializers.ModelSerializer):
    account = AccountSerializer()  # Include the account serializer

    class Meta:
        model = UserModel
        fields = '__all__'


# class TransactionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Transaction
#         fields = '__all__'  # Include all fields or specify the fields you want to expose

#     def create(self, validated_data):
#         # Extract 'account' data from validated data
#         account_data = validated_data.pop('account')

#         # Create the transaction associated with the specified account
#         transaction = Transaction.objects.create(
#             **validated_data, account_id=account_data)
#         return transaction

class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['value', 'recurring', 'description', 'category',
                  'account']  # Fields for creating transactions
