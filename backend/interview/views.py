from django.utils import timezone
from groq import Groq
import os
import json
from rest_framework.views import APIView
from rest_framework.response import Response as DRFResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Interview, Response
from .serializers import InterviewSerializer, ResponseSerializer
from questions.models import QuestionSet, Question

client = Groq(api_key=os.getenv('GROQ_API_KEY'))


def get_ai_feedback(question_text, answer_text):
    prompt = f"""You are an expert technical interviewer. Evaluate this interview answer.

Question: {question_text}

Candidate's Answer: {answer_text}

Rate the answer on these 3 dimensions (score 1-10) and give specific feedback.

Return ONLY valid JSON in exactly this format, nothing else:
{{
  "clarity_score": 7,
  "technical_score": 6,
  "communication_score": 8,
  "feedback": "Your specific feedback here. What was good, what was missing, how to improve."
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=500,
    )
    raw = response.choices[0].message.content.strip()

    # Clean JSON if wrapped in backticks
    if '```' in raw:
        raw = raw.split('```')[1]
        if raw.startswith('json'):
            raw = raw[4:]

    return json.loads(raw.strip())


class StartInterviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question_set_id = request.data.get('question_set_id')
        try:
            question_set = QuestionSet.objects.get(id=question_set_id, user=request.user)
        except QuestionSet.DoesNotExist:
            return DRFResponse({'error': 'Question set not found'}, status=status.HTTP_404_NOT_FOUND)

        interview = Interview.objects.create(
            user=request.user,
            question_set=question_set
        )
        serializer = InterviewSerializer(interview)
        return DRFResponse(serializer.data, status=status.HTTP_201_CREATED)


class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
        except Interview.DoesNotExist:
            return DRFResponse({'error': 'Interview not found'}, status=status.HTTP_404_NOT_FOUND)

        if interview.status == 'completed':
            return DRFResponse({'error': 'Interview already completed'}, status=status.HTTP_400_BAD_REQUEST)

        question_id = request.data.get('question_id')
        answer_text = request.data.get('answer_text', '')

        try:
            question = Question.objects.get(id=question_id, question_set=interview.question_set)
        except Question.DoesNotExist:
            return DRFResponse({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get AI feedback
        try:
            feedback_data = get_ai_feedback(question.text, answer_text)
        except Exception as e:
            feedback_data = {
                'clarity_score': None,
                'technical_score': None,
                'communication_score': None,
                'feedback': f'Feedback unavailable: {str(e)}'
            }

        response_obj, created = Response.objects.get_or_create(
            interview=interview,
            question=question,
            defaults={
                'answer_text': answer_text,
                'clarity_score': feedback_data.get('clarity_score'),
                'technical_score': feedback_data.get('technical_score'),
                'communication_score': feedback_data.get('communication_score'),
                'feedback': feedback_data.get('feedback', ''),
            }
        )
        if not created:
            response_obj.answer_text = answer_text
            response_obj.clarity_score = feedback_data.get('clarity_score')
            response_obj.technical_score = feedback_data.get('technical_score')
            response_obj.communication_score = feedback_data.get('communication_score')
            response_obj.feedback = feedback_data.get('feedback', '')
            response_obj.save()

        serializer = ResponseSerializer(response_obj)
        return DRFResponse(serializer.data, status=status.HTTP_200_OK)


class CompleteInterviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
        except Interview.DoesNotExist:
            return DRFResponse({'error': 'Interview not found'}, status=status.HTTP_404_NOT_FOUND)

        interview.status = 'completed'
        interview.ended_at = timezone.now()
        interview.save()

        serializer = InterviewSerializer(interview)
        return DRFResponse(serializer.data)


class InterviewListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interviews = Interview.objects.filter(user=request.user).order_by('-started_at')
        serializer = InterviewSerializer(interviews, many=True)
        return DRFResponse(serializer.data)


class InterviewDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
        except Interview.DoesNotExist:
            return DRFResponse({'error': 'Interview not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = InterviewSerializer(interview)
        return DRFResponse(serializer.data)
    
class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interviews = Interview.objects.filter(
            user=request.user, status='completed'
        ).order_by('started_at')

        # Score over time
        score_trend = []
        for iv in interviews:
            scored = [r for r in iv.responses.all() if r.clarity_score]
            if scored:
                avg = sum((r.clarity_score + r.technical_score + r.communication_score) / 3 for r in scored) / len(scored)
                score_trend.append({
                    'date': iv.started_at.strftime('%b %d'),
                    'score': round(avg, 1),
                    'role': iv.question_set.role,
                    'topic': iv.question_set.topic,
                })

        # Per dimension averages
        all_scored = []
        for iv in interviews:
            all_scored.extend([r for r in iv.responses.all() if r.clarity_score])

        dimensions = {}
        if all_scored:
            dimensions = {
                'clarity': round(sum(r.clarity_score for r in all_scored) / len(all_scored), 1),
                'technical': round(sum(r.technical_score for r in all_scored) / len(all_scored), 1),
                'communication': round(sum(r.communication_score for r in all_scored) / len(all_scored), 1),
            }

        # Topic performance
        topic_scores = {}
        for iv in interviews:
            topic = iv.question_set.topic
            scored = [r for r in iv.responses.all() if r.clarity_score]
            if scored:
                avg = sum((r.clarity_score + r.technical_score + r.communication_score) / 3 for r in scored) / len(scored)
                if topic not in topic_scores:
                    topic_scores[topic] = []
                topic_scores[topic].append(avg)

        topic_avg = [
            {'topic': t, 'score': round(sum(v) / len(v), 1)}
            for t, v in topic_scores.items()
        ]
        topic_avg.sort(key=lambda x: x['score'])

        return DRFResponse({
            'total_interviews': interviews.count(),
            'score_trend': score_trend,
            'dimensions': dimensions,
            'topic_performance': topic_avg,
            'weak_topics': topic_avg[:2] if len(topic_avg) >= 2 else topic_avg,
        })