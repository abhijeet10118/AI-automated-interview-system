from django.urls import path
from .views import (
    StartInterviewView, SubmitAnswerView,
    CompleteInterviewView, InterviewListView,
    InterviewDetailView, AnalyticsView
)

urlpatterns = [
    path('start/', StartInterviewView.as_view(), name='start-interview'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('<int:interview_id>/submit/', SubmitAnswerView.as_view(), name='submit-answer'),
    path('<int:interview_id>/complete/', CompleteInterviewView.as_view(), name='complete-interview'),
    path('', InterviewListView.as_view(), name='interview-list'),
    path('<int:interview_id>/', InterviewDetailView.as_view(), name='interview-detail'),
]