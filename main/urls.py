from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('chat/', views.chatbot, name='chat'),
    path('about/', views.about, name='about'),
    path('login/', views.login_view, name='login'),

    # APIs
    path('api/chat/', views.chat_api, name='chat_api'),
    path('api/signup/', views.signup_api, name='signup_api'),
    path('api/login/', views.login_api, name='login_api'),
    path('api/logout/', views.logout_api, name='logout_api'),
    
    # NEW: History APIs
    path('api/history/<int:session_id>/', views.get_chat_history, name='get_chat_history'),
    path('api/new_chat/', views.create_new_chat, name='create_new_chat'),
]