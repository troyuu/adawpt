from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError

from apps.core.permissions import IsAdmin
from apps.core.throttles import LoginThrottle, RegisterThrottle
from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    UserListSerializer,
    ChangePasswordSerializer,
)


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [RegisterThrottle]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        data = RegisterSerializer(user).data
        data['full_name'] = user.full_name
        data['avatar'] = request.build_absolute_uri(user.avatar.url) if user.avatar else None
        return Response(
            {
                'success': True,
                'data': data,
                'message': 'Registration successful',
                'errors': None,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        avatar_url = None
        if user.avatar:
            avatar_url = request.build_absolute_uri(user.avatar.url)
        return Response(
            {
                'success': True,
                'data': {
                    'id': str(user.id),
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'full_name': user.full_name,
                    'role': user.role,
                    'avatar': avatar_url,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    },
                },
                'message': 'Login successful',
                'errors': None,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except TokenError:
            pass

        return Response(
            {
                'success': True,
                'data': None,
                'message': 'Logout successful',
                'errors': None,
            },
            status=status.HTTP_200_OK,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response(
            {
                'success': True,
                'data': None,
                'message': 'Password changed successfully',
                'errors': None,
            },
            status=status.HTTP_200_OK,
        )


class DeactivateAccountView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        user.is_active = False
        user.save(update_fields=['is_active'])
        return Response(
            {
                'success': True,
                'data': None,
                'message': 'Account deactivated successfully',
                'errors': None,
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestView(generics.GenericAPIView):
    """Request a password reset link via email."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response(
                {'success': False, 'data': None, 'message': 'Email is required.', 'errors': {'email': ['This field is required.']}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Always return success to avoid leaking user existence
        # TODO: Integrate email sending (e.g. django-allauth, Celery task)
        if User.objects.filter(email=email, is_active=True).exists():
            pass  # send_password_reset_email(user) — wire up when email backend is configured
        return Response(
            {
                'success': True,
                'data': None,
                'message': 'If an account with that email exists, a password reset link has been sent.',
                'errors': None,
            },
            status=status.HTTP_200_OK,
        )


class ResendVerificationEmailView(generics.GenericAPIView):
    """Resend the email verification link."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # TODO: Integrate email verification (e.g. django-allauth, Celery task)
        return Response(
            {
                'success': True,
                'data': None,
                'message': 'If your email is registered, a verification link has been sent.',
                'errors': None,
            },
            status=status.HTTP_200_OK,
        )


class UserViewSet(viewsets.ModelViewSet):
    """Admin-only user management."""
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'email']

    def get_queryset(self):
        # Exclude the current user from the list
        return self.queryset.exclude(id=self.request.user.id)

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserProfileSerializer

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if user.id == request.user.id:
            return Response(
                {
                    'success': False,
                    'data': None,
                    'message': 'You cannot edit your own account from user management.',
                    'errors': None,
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)
