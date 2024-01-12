
from django.urls import path
from .views import get_test_func, get_transactions_by_month, register_user, user_login, user_logout, get_user, create_account, create_transaction, get_choices, update_account, delete_account, delete_transaction, delete_all_transactions
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    path('register', register_user, name='register'),
    path('login', user_login, name='login'),
    path('logout', user_logout, name='logout'),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('get_user', get_user, name='get_user'),
    path('get_choices', get_choices, name='get_choices'),
    #     path('get_transaction_meta_datas', get_transaction_meta_datas,
    #          name='get_transaction_meta_datas'),
    path('get_transactions_by_month', get_transactions_by_month,
         name='get_transactions_by_month'),
    path('get_test_func', get_test_func,
         name='get_test_func'),
    path('create_account', create_account, name='create_account'),
    path('update_account', update_account, name='update_account'),
    path('delete_account', delete_account, name='delete_account'),
    path('create_transaction', create_transaction, name='create_transaction'),
    path('delete_transaction', delete_transaction, name='delete_transaction'),
    path('delete_all_transactions', delete_all_transactions,
         name='delete_all_transactions'),
]
