from django.contrib.auth.models import AbstractUser
from django.db import models
import random
import string
from django.utils import timezone

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def generate_otp(self):
        self.otp = ''.join(random.choices(string.digits, k=6))
        self.otp_created_at = timezone.now()
        self.save()
        return self.otp

    def verify_otp(self, otp):
        if not self.otp or not self.otp_created_at:
            return False
        # OTP expires in 10 minutes
        expired = (timezone.now() - self.otp_created_at).seconds > 600
        if expired:
            return False
        return self.otp == otp

    def __str__(self):
        return self.email