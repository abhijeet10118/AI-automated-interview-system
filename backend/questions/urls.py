from django.urls import path
from .views import GenerateQuestionsView, QuestionSetListView

urlpatterns = [
    path('generate/', GenerateQuestionsView.as_view(), name='generate-questions'),
    path('my-sets/', QuestionSetListView.as_view(), name='question-sets'),
]