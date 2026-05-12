from django.db import models
from users.models import CustomUser

class QuestionSet(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    role = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=20)
    topic = models.CharField(max_length=100)
    resume_text = models.TextField(blank=True, default='')  # stores extracted resume text
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} - {self.topic} ({self.difficulty})"


class Question(models.Model):
    question_set = models.ForeignKey(QuestionSet, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.text[:60]