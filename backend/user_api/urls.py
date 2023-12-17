
from django.urls import path
from .views import register_user, user_login, user_logout, get_user, create_account, create_transaction
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    path('register', register_user, name='register'),
    path('login', user_login, name='login'),
    path('logout', user_logout, name='logout'),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('get_user', get_user, name='get_user'),
    path('create_account', create_account, name='create_account'),
    path('create_transaction', create_transaction, name='create_transaction'),
]
