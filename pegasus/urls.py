from django.contrib import admin
from django.urls import path, include  # <--- Make sure 'include' is imported!

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # This line tells Django: "For any other URL, check the 'main' app"
    path('', include('main.urls')),
]