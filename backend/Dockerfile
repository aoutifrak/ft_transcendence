FROM python:3.14.0a2-slim-bullseye

WORKDIR /backend

ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    netcat-openbsd \
    build-essential \
    libffi-dev \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    liblcms2-dev 
    
COPY requirements.txt .

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

COPY  . .

RUN chmod +x start.sh

EXPOSE 8000

CMD ["sh", "./start.sh"]