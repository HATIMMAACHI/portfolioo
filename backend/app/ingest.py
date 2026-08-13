import os
import sys
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from dotenv import load_dotenv

# Load env variables from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

def get_embeddings():
    hf_token = os.getenv("HF_TOKEN")
    if hf_token:
        print("Using HuggingFace API Embeddings via HF_TOKEN (Light RAM)...")
        from langchain_huggingface import HuggingFaceEndpointEmbeddings
        return HuggingFaceEndpointEmbeddings(
            model="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
            huggingfacehub_api_token=hf_token
        )
    else:
        print("Loading local HuggingFace embeddings model (Requires PyTorch and high RAM)...")
        from langchain_huggingface import HuggingFaceEmbeddings
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )

def get_base_dir():
    # Base directory of the portfolio project (parent of backend)
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def load_cv():
    cv_path = os.path.join(get_base_dir(), "assets", "MAACHIIII.pdf")
    if not os.path.exists(cv_path):
        cv_path = os.path.join(get_base_dir(), "assets", "resume.pdf") # Try fallback
    
    if not os.path.exists(cv_path):
        print(f"Warning: CV PDF not found at {cv_path}")
        return []
    
    print(f"Loading CV from {cv_path}...")
    try:
        reader = PdfReader(cv_path)
        documents = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                doc = Document(
                    page_content=text,
                    metadata={"source": "CV (Resume)", "page": i + 1}
                )
                documents.append(doc)
        print(f"Loaded {len(documents)} pages from CV.")
        return documents
    except Exception as e:
        print(f"Error reading CV: {e}")
        return []

def load_portfolio_projects():
    html_path = os.path.join(get_base_dir(), "index.html")
    if not os.path.exists(html_path):
        print(f"Warning: index.html not found at {html_path}")
        return []
    
    print(f"Loading projects and skills from {html_path}...")
    try:
        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        soup = BeautifulSoup(content, "html.parser")
        documents = []
        
        # 1. Extract About Me info
        about_section = soup.find(id="about")
        if about_section:
            about_text = about_section.get_text(separator="\n", strip=True)
            documents.append(Document(
                page_content=f"À propos de Hatim Maachi (Portfolio):\n{about_text}",
                metadata={"source": "Portfolio (À propos)"}
            ))
            
        # 2. Extract Projects
        projects = soup.find_all(class_="project-card")
        for proj in projects:
            title_el = proj.find("h3")
            desc_el = proj.find("p")
            tech_tags = [tag.get_text() for tag in proj.find_all(class_="tech-tag")]
            
            if title_el and desc_el:
                title = title_el.get_text(strip=True)
                desc = desc_el.get_text(strip=True)
                techs = ", ".join(tech_tags)
                
                project_content = f"Projet Académique: {title}\nDescription: {desc}\nTechnologies: {techs}"
                doc = Document(
                    page_content=project_content,
                    metadata={"source": f"Portfolio (Projet: {title})", "type": "project"}
                )
                documents.append(doc)
                
        # 3. Extract Skills
        skills_section = soup.find(id="skills")
        if skills_section:
            categories = skills_section.find_all(class_="skill-category")
            skills_content = "Compétences techniques de Hatim Maachi:\n"
            for cat in categories:
                cat_title_el = cat.find("h3")
                cat_title = cat_title_el.get_text(strip=True) if cat_title_el else "Catégorie"
                skill_items = [item.get_text(strip=True) for item in cat.find_all(class_="skill-item")]
                skills_content += f"- {cat_title}: {', '.join(skill_items)}\n"
                
            documents.append(Document(
                page_content=skills_content,
                metadata={"source": "Portfolio (Compétences)"}
            ))
            
        # 4. Extract Contact
        contact_section = soup.find(id="contact")
        if contact_section:
            contact_info = contact_section.find(class_="contact-info")
            if contact_info:
                details = contact_info.get_text(separator="\n", strip=True)
                documents.append(Document(
                    page_content=f"Informations de contact et réseaux de Hatim Maachi:\n{details}",
                    metadata={"source": "Portfolio (Contact)"}
                ))

        print(f"Extracted {len(documents)} documents from index.html.")
        return documents
    except Exception as e:
        print(f"Error reading index.html: {e}")
        return []

def load_github_repos():
    username = "HATIMMAACHI"
    url = f"https://api.github.com/users/{username}/repos"
    print(f"Fetching GitHub repositories for {username}...")
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print(f"Warning: Failed to fetch GitHub repos (Status code: {response.status_code}). Using static fallback.")
            return get_github_fallback()
            
        repos = response.json()
        documents = []
        for repo in repos:
            # Skip forks to focus on original work
            if repo.get("fork"):
                continue
                
            name = repo.get("name")
            desc = repo.get("description") or "Pas de description fournie."
            lang = repo.get("language") or "Non spécifié"
            stars = repo.get("stargazers_count", 0)
            url = repo.get("html_url")
            topics = ", ".join(repo.get("topics", []))
            
            repo_content = f"Dépôt GitHub: {name}\nDescription: {desc}\nLangage principal: {lang}\nLien: {url}\nÉtoiles: {stars}\nSujets: {topics}"
            doc = Document(
                page_content=repo_content,
                metadata={"source": f"GitHub ({name})", "type": "github"}
            )
            documents.append(doc)
            
        print(f"Loaded {len(documents)} repositories from GitHub API.")
        return documents
    except Exception as e:
        print(f"Error fetching GitHub repos: {e}. Using static fallback.")
        return get_github_fallback()

def get_github_fallback():
    # Static fallback for repo information in case of API limits/offline issues
    repos_info = [
        {
            "name": "Skill-ROI-Forecaster",
            "desc": "Plateforme d'aide à la décision carrière (dataset LinkedIn/GitHub). Modèles ML implémentés : Random Forest, Apriori, K-Means. Déployé via Streamlit.",
            "lang": "Python",
            "url": "https://github.com/HATIMMAACHI/Skill-ROI-Forecaster"
        },
        {
            "name": "Gestion-Departement-PFE",
            "desc": "Application web complète pour la gestion des besoins matériels, données pédagogiques et assemblées, avec auth sécurisée et génération de PDF.",
            "lang": "Java",
            "url": "https://github.com/HATIMMAACHI/Gestion-Departement-PFE"
        },
        {
            "name": "NexaDesk",
            "desc": "Application de gestion des ressources matérielles universitaires. Architecture N-tiers, sécurité JWT, double sidebar (design system moderne).",
            "lang": "Java",
            "url": "https://github.com/HATIMMAACHI/NexaDesk"
        },
        {
            "name": "Conference-Platform",
            "desc": "Application type EasyChair avec authentification multi-rôle, soumission d'articles, gestion des comités et notifications par email.",
            "lang": "Java",
            "url": "https://github.com/HATIMMAACHI/Conference-Platform"
        }
    ]
    documents = []
    for repo in repos_info:
        repo_content = f"Dépôt GitHub: {repo['name']}\nDescription: {repo['desc']}\nLangage principal: {repo['lang']}\nLien: {repo['url']}"
        doc = Document(
            page_content=repo_content,
            metadata={"source": f"GitHub ({repo['name']})", "type": "github"}
        )
        documents.append(doc)
    return documents

import json

def load_profile_json():
    profile_path = os.path.join(get_base_dir(), "backend", "data", "profile.json")
    if not os.path.exists(profile_path):
        print(f"Warning: profile.json not found at {profile_path}")
        return []
    try:
        with open(profile_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        content_parts = []
        content_parts.append(f"Nom complet de l'étudiant: {data.get('name', '')}")
        content_parts.append(f"Titre et sous-titre de profil: {data.get('subtitle', '')}")
        content_parts.append(f"Bio résumé de Hatim: {data.get('bio', '')}")
        content_parts.append(f"Présentation générale (À Propos): {data.get('about_bio', '')}")
        content_parts.append(f"Années d'expérience ou d'études: {data.get('experience_years', '')}")
        
        stats = data.get("stats", {})
        content_parts.append(f"Statistiques portfolio: {stats.get('projects_count', '')} projets réalisés, {stats.get('tech_count', '')} technologies maîtrisées, {stats.get('studies_years', '')} ans d'études.")
        
        contact = data.get("contact", {})
        content_parts.append(f"Email de contact professionnel: {contact.get('email', '')}")
        content_parts.append(f"Téléphone mobile: {contact.get('phone', '')}")
        content_parts.append(f"Localisation géographique: {contact.get('location', '')}")
        
        socials = data.get("socials", {})
        content_parts.append(f"Réseaux et profils sociaux: GitHub ({socials.get('github', '')}), LinkedIn ({socials.get('linkedin', '')}), Facebook ({socials.get('facebook', '')}), Instagram ({socials.get('instagram', '')}).")
        
        skills = data.get("skills", [])
        skills_text = "Compétences techniques et technologiques :\n"
        for cat in skills:
            skills_text += f"- {cat.get('category', '')}: {', '.join(cat.get('items', []))}\n"
        content_parts.append(skills_text)
            
        projects = data.get("projects", [])
        projects_text = "Projets académiques et personnels réalisés par Hatim Maachi :\n"
        for proj in projects:
            projects_text += f"- Projet: {proj.get('title', '')}\n  Description: {proj.get('description', '')}\n  Technologies: {', '.join(proj.get('tech', []))}\n"
        content_parts.append(projects_text)

        ai_instr = data.get("ai_instructions", "")
        if ai_instr:
            content_parts.append(f"Consignes système de l'assistant IA: {ai_instr}")
            
        doc_text = "\n\n".join(content_parts)
        return [Document(page_content=doc_text, metadata={"source": "Profile JSON", "type": "admin_profile"})]
    except Exception as e:
        print(f"Error loading profile.json: {e}")
        return []

def reingest_profile():
    """
    Called from main.py background tasks to regenerate ChromaDB embeddings when changes are saved.
    """
    try:
        print("Starting background re-ingestion of RAG database...")
        cv_docs = load_cv()
        github_docs = load_github_repos()
        profile_docs = load_profile_json()
        
        all_docs = cv_docs + github_docs + profile_docs
        
        if not all_docs:
            print("Error: No documents loaded for re-ingestion.")
            return False
            
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=80)
        chunks = text_splitter.split_documents(all_docs)
        
        embeddings = get_embeddings()
        chroma_db_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "chroma_db"))
        
        # Rewrite ChromaDB vector store
        Chroma.from_documents(documents=chunks, embedding=embeddings, persist_directory=chroma_db_dir)
        print("=== Re-ingestion completed successfully! ===")
        return True
    except Exception as e:
        print(f"Error during background re-ingestion: {e}")
        return False

def main():
    print("=== Commencer le pipeline d'ingestion RAG ===")
    
    cv_docs = load_cv()
    github_docs = load_github_repos()
    profile_docs = load_profile_json()
    
    all_docs = cv_docs + github_docs + profile_docs
    
    if not all_docs:
        print("Error: No documents loaded. Exiting.")
        sys.exit(1)
        
    print(f"Total documents loaded: {len(all_docs)}")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=80,
        separators=["\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_documents(all_docs)
    print(f"Split documents into {len(chunks)} chunks.")
    
    embeddings = get_embeddings()
    
    chroma_db_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "chroma_db"))
    print(f"Saving embeddings in ChromaDB: {chroma_db_dir}...")
    
    try:
        vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=chroma_db_dir
        )
        print("=== Ingestion terminée avec succès ! ChromaDB est opérationnel ===")
    except Exception as e:
        print(f"Error writing to ChromaDB: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
