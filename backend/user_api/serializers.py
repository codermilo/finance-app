# accounts/serializers.py

from rest_framework import serializers
from .models import CustomUser, Account, Transaction, TransactionMetaData, Recipient


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

    def update(self, instance, validated_data):
        # Update the instance fields with validated data
        instance.bank_name = validated_data.get(
            'bank_name', instance.bank_name)
        instance.current_balance = validated_data.get(
            'current_balance', instance.current_balance)
        instance.save()
        return instance


class TransactionMetaDataSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    recipient = serializers.StringRelatedField()

    class Meta:
        model = TransactionMetaData
        fields = ('recurring', 'recurring_period', 'first_payment_date', 'final_payment_date',
                  'previous_payment_date', 'recipient', 'description', 'category')


class TransactionSerializer(serializers.ModelSerializer):
    transaction_meta_data_id = TransactionMetaDataSerializer()

    class Meta:
        model = Transaction
        fields = '__all__'


# getting the choices for category for transaction form


class CategoryChoicesSerializer(serializers.Serializer):
    category_choices = serializers.ListField(child=serializers.CharField())


class RecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipient
        fields = ('id', 'name')  # Include primary key and name
