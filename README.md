# Digital Twin de Hatim Maachi

Digital Twin conversationnel conçu pour présenter mon parcours, mes compétences et mes projets à travers une interface de chat alimentée par un pipeline **RAG (Retrieval-Augmented Generation)**.

Le système récupère les informations pertinentes depuis une base vectorielle avant de générer une réponse personnalisée. Il peut ainsi répondre aux questions d'un recruteur en s'appuyant sur les données réelles de mon profil.

## Fonctionnalités

- Assistant conversationnel spécialisé sur mon profil professionnel
- Recherche sémantique dans une base ChromaDB
- Génération de réponses avec Google Gemini ou Groq
- Profil et instructions de l'assistant centralisés dans `backend/data/profile.json`
- Interface de chat React intégrée au portfolio
- API FastAPI avec endpoints de chat, profil et administration
- Déploiement conteneurisé avec Docker

## Architecture

```text
Visiteur
	|
	v
Chat React / Portfolio
	|
	v
API FastAPI (/api/chat)
	|
	+--> Recherche sémantique ChromaDB
	|
	+--> Contexte du profil
	|
	v
LLM (Gemini ou Groq)
	|
	v
Réponse contextualisée
```

## Technologies

- Python, FastAPI et Uvicorn
- LangChain
- ChromaDB et embeddings Hugging Face
- Google Gemini / Groq
- React, Vite, Tailwind CSS
- Docker

## Lancer le projet localement

### Backend

Depuis la racine du projet :

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload
```

Créer ensuite `backend/.env` avec au moins une clé de modèle :

```env
GEMINI_API_KEY=your_key_here
# ou
GROQ_API_KEY=your_key_here
```

`backend/.env` est ignoré par Git et ne doit jamais être publié.

### Interface React

Dans un second terminal :

```powershell
cd chat-widget
npm install
npm run dev
```

Pour construire la version servie par FastAPI :

```powershell
npm run build
```

L'API est ensuite disponible sur `http://localhost:8000` et la documentation interactive sur `http://localhost:8000/docs`.

## Structure du projet

```text
backend/
  app/main.py       API FastAPI
  app/rag.py        Retrieval-Augmented Generation
  app/ingest.py     Ingestion des données dans ChromaDB
  data/profile.json Données du profil et instructions IA
chat-widget/        Interface React du Digital Twin
index.html          Portfolio public
chat-loader.js      Intégration du widget dans le portfolio
Dockerfile          Build frontend et backend
```

## Déploiement

Le projet peut être déployé avec Docker :

```powershell
docker build -t hatim-digital-twin .
docker run --env-file backend/.env -p 8000:8000 hatim-digital-twin
```

## Objectif

Ce projet transforme un CV statique en expérience interactive : un recruteur peut interroger directement mon Digital Twin pour découvrir mon parcours, mes compétences et mes réalisations.