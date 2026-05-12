import os
import PyPDF2
import io
from groq import Groq
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import QuestionSet, Question
from .serializers import QuestionSetSerializer

client = Groq(api_key=os.getenv('GROQ_API_KEY'))


def extract_text_from_pdf(file):
    text = ''
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
        for page in reader.pages:
            text += page.extract_text() or ''
    except Exception:
        text = ''
    return text.strip()


def extract_topic_from_resume(resume_text, role):
    prompt = f"""Based on this resume, identify the top 3 technical topics/skills most relevant for a {role} interview.

Resume:
{resume_text[:2000]}

Return ONLY a comma-separated list of topics. Example: Django REST Framework, PostgreSQL, System Design
No explanations, no numbering, just the comma-separated topics."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=100,
    )
    return response.choices[0].message.content.strip()


def build_prompt(role, difficulty, topic, resume_text=None):
    if resume_text:
        return f"""You are an expert technical interviewer.

A candidate has applied for a {role} role. Here is their resume:

--- RESUME START ---
{resume_text[:3000]}
--- RESUME END ---

Generate exactly 7 interview questions that are:
- Specific to THIS candidate's experience and background
- Focused on: {topic}
- Difficulty level: {difficulty}
- Mix of questions about their past work AND technical knowledge

Rules:
- Return ONLY a numbered list
- No explanations, no intro text
- Format: 1. Question here"""
    else:
        return f"""Generate exactly 7 interview questions for:
- Role: {role}
- Topic: {topic}
- Difficulty: {difficulty}

Rules:
- Return ONLY a numbered list
- No explanations, no intro text
- Format: 1. Question here"""


class GenerateQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        role = request.data.get('role')
        difficulty = request.data.get('difficulty')
        resume_file = request.FILES.get('resume')

        if not role or not difficulty:
            return Response(
                {'error': 'role and difficulty are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        resume_text = ''
        topic = request.data.get('topic', '')

        if resume_file:
            if not resume_file.name.endswith('.pdf'):
                return Response(
                    {'error': 'Resume must be a PDF file'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            resume_text = extract_text_from_pdf(resume_file)
            topic = extract_topic_from_resume(resume_text, role)

        if not topic:
            return Response(
                {'error': 'topic is required when no resume is uploaded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        prompt = build_prompt(role, difficulty, topic, resume_text)

        try:
            ai_response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1000,
            )
            raw = ai_response.choices[0].message.content.strip()

            lines = [l.strip() for l in raw.split('\n') if l.strip()]
            questions_text = []
            for line in lines:
                if line and line[0].isdigit() and '.' in line:
                    q = line.split('.', 1)[1].strip()
                    if q:
                        questions_text.append(q)

            question_set = QuestionSet.objects.create(
                user=request.user,
                role=role,
                difficulty=difficulty,
                topic=topic,
                resume_text=resume_text
            )
            for i, q_text in enumerate(questions_text):
                Question.objects.create(
                    question_set=question_set,
                    text=q_text,
                    order=i + 1
                )

            serializer = QuestionSetSerializer(question_set)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class QuestionSetListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sets = QuestionSet.objects.filter(user=request.user).order_by('-created_at')
        serializer = QuestionSetSerializer(sets, many=True)
        return Response(serializer.data)