from rest_framework import serializers
from .models import QuestionSet, Question

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'order']


class QuestionSetSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuestionSet
        fields = ['id', 'role', 'difficulty', 'topic', 'created_at', 'questions']