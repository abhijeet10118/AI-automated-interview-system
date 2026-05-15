from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
import resend
import os
from .serializers import RegisterSerializer, UserSerializer
from .models import CustomUser

resend.api_key = os.getenv('RESEND_API_KEY')

def send_otp_email(to_email, username, otp):
    resend.Emails.send({
        "from": "PrepAI <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "Your PrepAI Verification Code",
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0a0a1a; color: white; border-radius: 12px;">
            <h2 style="color: #6366f1;">Welcome to PrepAI 🎯</h2>
            <p>Hi {username},</p>
            <p>Your verification code is:</p>
            <div style="background: #1a1a2e; border: 2px solid #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #a5b4fc;">{otp}</span>
            </div>
            <p style="color: #666;">This code expires in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this, ignore this email.</p>
        </div>
        """
    })

def send_resend_otp_email(to_email, otp):
    resend.Emails.send({
        "from": "PrepAI <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "Your PrepAI Verification Code",
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0a0a1a; color: white; border-radius: 12px;">
            <h2 style="color: #6366f1;">New Verification Code</h2>
            <div style="background: #1a1a2e; border: 2px solid #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #a5b4fc;">{otp}</span>
            </div>
            <p style="color: #666;">Expires in 10 minutes.</p>
        </div>
        """
    })


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
                send_otp_email(user.email, user.username, otp)
            except Exception as e:
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
            return Response(
                {'error': 'User not found or already verified'},
                status=status.HTTP_404_NOT_FOUND
            )

        otp = user.generate_otp()
        try:
            send_resend_otp_email(user.email, otp)
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'New OTP sent'})


class FeedbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        message = request.data.get('message')

        if not all([name, email, message]):
            return Response({'error': 'All fields required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            resend.Emails.send({
                "from": "PrepAI Feedback <onboarding@resend.dev>",
                "to": [os.getenv('EMAIL_HOST_USER', 'interviewplatformai@gmail.com')],
                "subject": f"PrepAI Feedback from {name}",
                "html": f"""
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>New Feedback</h2>
                    <p><strong>From:</strong> {name} ({email})</p>
                    <p><strong>Message:</strong></p>
                    <p>{message}</p>
                </div>
                """
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'Feedback sent!'})


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)