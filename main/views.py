import os
import json
from dotenv import load_dotenv
from google import genai
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import ChatSession, Message

# Load environment variables from .env file
load_dotenv()

# --- CONFIGURATION ---
# Get API key from environment variable
GENAI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Initialize the NEW Client
client = genai.Client(api_key=GENAI_API_KEY)

# Use the standard Flash model
MODEL_NAME = "gemini-2.5-flash"

# 1. Home Page View
def home(request):
    return render(request, 'main/home.html')

# 2. Chatbot Interface View
@login_required(login_url='/login/')
def chatbot(request):
    sessions = ChatSession.objects.filter(user=request.user).order_by('-updated_at')
    return render(request, 'main/index.html', {'sessions': sessions})

# 3. About View
def about(request):
    return render(request, 'main/about.html')

# 4. Login View
@ensure_csrf_cookie
def login_view(request):
    if request.user.is_authenticated:
        return redirect('chat')
    return render(request, 'main/login.html')

# --- APIs ---

@login_required
def get_chat_history(request, session_id):
    session = get_object_or_404(ChatSession, id=session_id, user=request.user)
    messages = session.messages.order_by('created_at')
    
    history = []
    for msg in messages:
        history.append({
            'role': 'user' if msg.role == 'user' else 'ai',
            'content': msg.content
        })
    return JsonResponse({'success': True, 'history': history, 'title': session.title})

@login_required
def create_new_chat(request):
    session = ChatSession.objects.create(user=request.user, title="New Chat")
    return JsonResponse({'success': True, 'session_id': session.id})

# --- FIXED CHAT API (USING NEW SDK) ---
@login_required
def chat_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message')
            session_id = data.get('session_id')

            # 1. Get or Create Session
            if session_id:
                session = ChatSession.objects.get(id=session_id, user=request.user)
            else:
                session = ChatSession.objects.create(user=request.user, title=user_message[:30] + "...")
                session_id = session.id

            # 2. Save User Message
            Message.objects.create(session=session, role='user', content=user_message)

            # 3. Generate Response (NEW SDK METHOD)
            # This is the simplified call for the new library
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=user_message
            )
            
            ai_text = response.text

            # 4. Save AI Response
            Message.objects.create(session=session, role='model', content=ai_text)
            
            # Update Title
            session.save()
            if session.messages.count() <= 2:
                session.title = user_message[:30]
                session.save()

            return JsonResponse({'success': True, 'response': ai_text, 'session_id': session.id})

        except Exception as e:
            print(f"❌ GEMINI ERROR: {e}")
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'error': 'Invalid request'})

# --- AUTH APIs (Keep same) ---
def signup_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            full_name = data.get('name')
            if User.objects.filter(username=email).exists():
                return JsonResponse({'success': False, 'error': 'Email already registered'})
            user = User.objects.create_user(username=email, email=email, password=password)
            user.first_name = full_name
            user.save()
            login(request, user)
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid method'})

def login_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            user = authenticate(request, username=email, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False, 'error': 'Invalid email or password'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid method'})

def logout_api(request):
    logout(request)
    return JsonResponse({'success': True})