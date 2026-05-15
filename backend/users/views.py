from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.mail import send_mail
from .serializers import RegisterSerializer, UserSerializer
from .models import CustomUser
import os

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()

            otp = user.generate_otp()
            try:
                send_mail(
                    subject='Your PrepAI Verification Code',
                    message=f'''Hi {user.username},

Your verification code is: {otp}

This code expires in 10 minutes.

Welcome to PrepAI!''',
                    from_email=None,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as e:
                # Delete user if email fails so they can try again
                user.delete()
                return Response(
                    {'error': f'Failed to send email: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response(
                {'message': 'OTP sent to your email', 'email': user.email},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.verify_otp(otp):
            user.is_active = True
            user.otp = None
            user.save()
            return Response({'message': 'Email verified! You can now login.'})
        return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = CustomUser.objects.get(email=email, is_active=False)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found or already verified'}, status=status.HTTP_404_NOT_FOUND)

        otp = user.generate_otp()
        send_mail(
            subject='Your PrepAI Verification Code',
            message=f'Your new verification code is: {otp}\n\nExpires in 10 minutes.',
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return Response({'message': 'New OTP sent'})


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
class FeedbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        message = request.data.get('message')

        if not all([name, email, message]):
            return Response({'error': 'All fields required'}, status=status.HTTP_400_BAD_REQUEST)

        send_mail(
            subject=f'PrepAI Feedback from {name}',
            message=f'From: {name} <{email}>\n\n{message}',
            from_email=None,
            recipient_list=[os.getenv('EMAIL_HOST_USER')],
            fail_silently=False,
        )
        return Response({'message': 'Feedback sent!'})