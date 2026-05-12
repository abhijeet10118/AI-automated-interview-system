from django.db import models
from users.models import CustomUser
from questions.models import QuestionSet, Question


class Interview(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    question_set = models.ForeignKey(QuestionSet, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.question_set.topic} ({self.status})"


class Response(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField(blank=True, default='')
    clarity_score = models.FloatField(null=True, blank=True)
    technical_score = models.FloatField(null=True, blank=True)
    communication_score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True, default='')
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response to Q{self.question.order} in Interview {self.interview.id}"