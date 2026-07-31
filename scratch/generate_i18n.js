const fs = require('fs');

const fr = {
  "home_title": "CJ DEVELOPMENT TRAINING CENTER",
  "home_tagline": "Bâtir des compétences. Transformer des destins. Créer des opportunités.",
  "discover_trainings": "Découvrir nos formations",
  "about_title": "À propos de CJ DEVELOPMENT TRAINING CENTER",
  "about_text": "Centre panafricain d'excellence en formation professionnelle, leadership et insertion.",
  "formations_title": "Nos formations",
  "formations_text": "Explorez nos programmes OIP, GRH, Leadership et bien plus.",
  
  "student": {
    "dashboard": "Tableau de bord",
    "my_formations": "Mes formations",
    "my_assignments": "Mes Travaux",
    "news": "Actualités",
    "calendar": "Calendrier",
    "notifications": "Notifications",
    "support": "Support & Questions",
    
    "overview": {
      "welcome": "Heureux de vous revoir",
      "completion_rate": "Taux d'achèvement",
      "average_grade": "Moyenne Générale",
      "certifications": "Certifications",
      "next_course": "Prochain Cours",
      "no_course": "Aucun cours programmé",
      "recent_activities": "Activités récentes",
      "no_activities": "Aucune activité récente",
      "my_progress": "Ma progression",
      "total_hours": "heures totales"
    },
    
    "assignments": {
      "title": "Travaux et Évaluations",
      "subtitle": "Gérez vos devoirs, TP et examens à remettre.",
      "to_do": "À remettre",
      "submitted": "Remis",
      "graded": "Corrigé",
      "deadline": "Date limite",
      "no_assignments": "Aucun travail trouvé.",
      "submit_work": "Remettre le travail",
      "view_feedback": "Voir la correction",
      "grade": "Note",
      "download_instructions": "Télécharger les consignes",
      "upload_files": "Téléverser des fichiers",
      "status": {
        "pending": "En attente",
        "submitted": "Soumis",
        "graded": "Corrigé"
      }
    },
    
    "formations": {
      "title": "Mes Formations",
      "subtitle": "Suivez votre progression et accédez à vos cours.",
      "continue": "Continuer",
      "completed": "Terminée",
      "in_progress": "En cours",
      "modules": "modules",
      "start": "Commencer",
      "no_formations": "Vous n'êtes inscrit à aucune formation."
    }
  }
};

const en = {
  "home_title": "CJ DEVELOPMENT TRAINING CENTER",
  "home_tagline": "Building skills. Changing lives. Creating opportunities.",
  "discover_trainings": "Discover our trainings",
  "about_title": "About CJ DEVELOPMENT TRAINING CENTER",
  "about_text": "Pan-African center for professional training, leadership and employment.",
  "formations_title": "Our trainings",
  "formations_text": "Explore IOP, HRM, Leadership programs and more.",
  
  "student": {
    "dashboard": "Dashboard",
    "my_formations": "My Trainings",
    "my_assignments": "My Assignments",
    "news": "News",
    "calendar": "Calendar",
    "notifications": "Notifications",
    "support": "Support & FAQ",
    
    "overview": {
      "welcome": "Welcome back",
      "completion_rate": "Completion Rate",
      "average_grade": "Average Grade",
      "certifications": "Certifications",
      "next_course": "Next Course",
      "no_course": "No course scheduled",
      "recent_activities": "Recent Activities",
      "no_activities": "No recent activity",
      "my_progress": "My Progress",
      "total_hours": "total hours"
    },
    
    "assignments": {
      "title": "Assignments and Assessments",
      "subtitle": "Manage your homework, practical work and exams.",
      "to_do": "To Do",
      "submitted": "Submitted",
      "graded": "Graded",
      "deadline": "Deadline",
      "no_assignments": "No assignments found.",
      "submit_work": "Submit Work",
      "view_feedback": "View Feedback",
      "grade": "Grade",
      "download_instructions": "Download Instructions",
      "upload_files": "Upload Files",
      "status": {
        "pending": "Pending",
        "submitted": "Submitted",
        "graded": "Graded"
      }
    },
    
    "formations": {
      "title": "My Trainings",
      "subtitle": "Track your progress and access your courses.",
      "continue": "Continue",
      "completed": "Completed",
      "in_progress": "In Progress",
      "modules": "modules",
      "start": "Start",
      "no_formations": "You are not enrolled in any training."
    }
  }
};

fs.writeFileSync('i18n/fr.json', JSON.stringify(fr, null, 2));
fs.writeFileSync('i18n/en.json', JSON.stringify(en, null, 2));
console.log('i18n files updated successfully.');
