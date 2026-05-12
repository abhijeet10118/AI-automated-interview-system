from rest_framework import serializers
from .models import Interview, Response
from questions.serializers import QuestionSetSerializer


class ResponseSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    question_order = serializers.IntegerField(source='question.order', read_only=True)

    class Meta:
        model = Response
        fields = [
            'id', 'question', 'question_text', 'question_order',
            'answer_text','clarity_score', 'technical_score',
            'communication_score', 'feedback', 'submitted_at'
        ]


class InterviewSerializer(serializers.ModelSerializer):
    question_set = QuestionSetSerializer(read_only=True)
    question_set_id = serializers.IntegerField(write_only=True)
    responses = ResponseSerializer(many=True, read_only=True)
    total_questions = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = [
            'id', 'question_set', 'question_set_id', 'status',
            'started_at', 'ended_at', 'responses', 'total_questions'
        ]

    def get_total_questions(self, obj):
        return obj.question_set.questions.count()