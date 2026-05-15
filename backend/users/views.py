from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
import os
from .serializers import RegisterSerializer, UserSerializer
from .models import CustomUser


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()
            otp = user.generate_otp()
            # Return OTP to frontend — frontend sends the email via EmailJS
            return Response(
                {
                    'message': 'Account created',
                    'email': user.email,
                    'username': user.username,
                    'otp': otp  # frontend uses this to send email
                },
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
            return Response(
                {'error': 'User not found or already verified'},
                status=status.HTTP_404_NOT_FOUND
            )
        otp = user.generate_otp()
        return Response({
            'message': 'OTP generated',
            'email': user.email,
            'username': user.username,
            'otp': otp
        })


class FeedbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Just acknowledge — frontend sends email via EmailJS
        return Response({'message': 'Feedback received!'})


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)