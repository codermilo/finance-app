# accounts/serializers.py

from rest_framework import serializers
from .models import CustomUser, Account, Transaction


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('account_id', 'current_balance', 'bank_name', 'user')


class TransactionSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()

    class Meta:
        model = Transaction
        fields = '__all__'  # Include all fields from the Transaction model
