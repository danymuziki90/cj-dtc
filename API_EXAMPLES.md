# 📊 Exemples de Données - Format JSON

## 📝 Exemple 1: Inscription Complète Créée

### Request POST `/api/enrollments` (FormData)
```
Content-Type: multipart/form-data

firstName=Jean&
lastName=Dupont&
email=jean@example.com&
phone=%2B33612345678&
address=123%20Rue%20de%20Paris%2C%2075001%20Paris&
formationId=1&
startDate=2024-03-15T00%3A00%3A00.000Z&
notes=Je%20suis%20passionn%C3%A9%20par%20le%20dev%20web&
motivation=[PDF File Content]
```

### Response 201
```json
{
  "id": 1,
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "address": "123 Rue de Paris, 75001 Paris",
  "formationId": 1,
  "startDate": "2024-03-15T00:00:00.000Z",
  "status": "pending",
  "notes": "Je suis passionné par le dev web",
  "motivationLetter": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MNCjExIDAgb2JqCjw8L1R5cGUvWE9iamVjdC9TdWJ0eXBlL0ltYWdlL1dpZHRoIDEwMTcvSGVpZ2h0IDUxNS9Db2xvclNwYWNlL0RldmljZVJHQi9MZW5ndGggMzI2MTAvRmlsdGVyL0ZsYXRlRGVjb2RlPj5zdHJlYW0KeJzt...",
  "createdAt": "2024-02-15T10:30:00.000Z",
  "updatedAt": "2024-02-15T10:30:00.000Z"
}
```

---

## ✅ Exemple 2: Changement de Statut - ACCEPTATION

### Request PUT `/api/enrollments/1`
```json
{
  "status": "accepted"
}
```

### Response 201
```json
{
  "id": 1,
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "address": "123 Rue de Paris, 75001 Paris",
  "formationId": 1,
  "startDate": "2024-03-15T00:00:00.000Z",
  "status": "accepted",
  "notes": "Je suis passionné par le dev web",
  "motivationLetter": "data:application/pdf;base64,...",
  "createdAt": "2024-02-15T10:30:00.000Z",
  "updatedAt": "2024-02-15T14:45:00.000Z",
  "formation": {
    "id": 1,
    "title": "Développement Web Avancé",
    "slug": "dev-web-avance",
    "description": "Une formation complète..."
  }
}
```

### Email Envoyé (HTML)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #002D72; color: white; padding: 20px; text-align: center;">
    <h1>🎉 Félicitations, Jean!</h1>
  </div>
  
  <div style="padding: 20px; background-color: #f9f9f9;">
    <p>Nous avons le plaisir de vous informer que votre inscription</p>
    <p><strong>pour la formation suivante a été ACCEPTÉE</strong>:</p>
    
    <div style="background-color: white; padding: 15px; border-left: 4px solid #E30613; margin: 20px 0;">
      <p><strong>Formation:</strong> Développement Web Avancé</p>
      <p><strong>Date de début:</strong> 15 mars 2024</p>
      <p><strong>Description:</strong> Une formation complète sur le développement web moderne...</p>
    </div>
    
    <p>Vous pouvez dès maintenant accéder à l'espace étudiant pour préparer votre formation.</p>
    
    <a href="http://localhost:3000/espace-etudiants" style="
      display: inline-block;
      background-color: #002D72;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    ">Accéder à mon espace étudiant</a>
    
    <p style="color: #666; font-size: 12px; margin-top: 30px;">
      Si vous avez des questions, n'hésitez pas à nous contacter.
    </p>
  </div>
</body>
</html>
```

---

## ❌ Exemple 3: Changement de Statut - REJET

### Request PUT `/api/enrollments/2`
```json
{
  "status": "rejected",
  "reason": "Nous avons reçu trop de candidatures pour cette formation. Veuillez candidater pour la prochaine session en juin."
}
```

### Response 201
```json
{
  "id": 2,
  "firstName": "Marie",
  "lastName": "Martin",
  "email": "marie@example.com",
  "phone": "+33687654321",
  "address": "456 Avenue Lyon, 69000 Lyon",
  "formationId": 1,
  "startDate": "2024-03-15T00:00:00.000Z",
  "status": "rejected",
  "notes": "Intéressée par UX/UI",
  "motivationLetter": "data:application/pdf;base64,...",
  "createdAt": "2024-02-14T14:20:00.000Z",
  "updatedAt": "2024-02-15T15:10:00.000Z",
  "formation": {
    "id": 1,
    "title": "Développement Web Avancé",
    "slug": "dev-web-avance"
  }
}
```

### Email Envoyé (HTML)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #E30613; color: white; padding: 20px; text-align: center;">
    <h1>Votre Inscription</h1>
  </div>
  
  <div style="padding: 20px; background-color: #f9f9f9;">
    <p>Bonjour Marie,</p>
    <p>Nous vous remercions pour votre intérêt envers notre formation.</p>
    
    <div style="background-color: white; padding: 15px; border-left: 4px solid #E30613; margin: 20px 0;">
      <p><strong>Formation:</strong> Développement Web Avancé</p>
      <p><strong>Date de début:</strong> 15 mars 2024</p>
    </div>
    
    <p><strong>Malheureusement, nous ne pouvons pas accepter votre candidature.</strong></p>
    
    <div style="background-color: #ffe0e0; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p><strong>Raison:</strong></p>
      <p>Nous avons reçu trop de candidatures pour cette formation. Veuillez candidater pour la prochaine session en juin.</p>
    </div>
    
    <p>N'hésitez pas à nous contacter si vous souhaitez connaître les sessions futures ou si vous avez des questions.</p>
    
    <p style="color: #666; font-size: 12px; margin-top: 30px;">
      CJ DTC - Centre de Formation<br>
      Email: contact@cjdtc.com<br>
      Tél: +33 (0)1 23 45 67 89
    </p>
  </div>
</body>
</html>
```

---

## 📋 Exemple 4: Liste des Inscriptions Récupérées

### Request GET `/api/enrollments`
```
GET /api/enrollments
```

### Response 200
```json
{
  "enrollments": [
    {
      "id": 1,
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean@example.com",
      "phone": "+33612345678",
      "address": "123 Rue de Paris, 75001 Paris",
      "formationId": 1,
      "startDate": "2024-03-15T00:00:00.000Z",
      "status": "accepted",
      "notes": "Je suis passionné par le dev web",
      "motivationLetter": "data:application/pdf;base64,...",
      "createdAt": "2024-02-15T10:30:00.000Z",
      "updatedAt": "2024-02-15T14:45:00.000Z"
    },
    {
      "id": 2,
      "firstName": "Marie",
      "lastName": "Martin",
      "email": "marie@example.com",
      "phone": "+33687654321",
      "address": "456 Avenue Lyon, 69000 Lyon",
      "formationId": 1,
      "startDate": "2024-03-15T00:00:00.000Z",
      "status": "rejected",
      "notes": "Intéressée par UX/UI",
      "motivationLetter": "data:application/pdf;base64,...",
      "createdAt": "2024-02-14T14:20:00.000Z",
      "updatedAt": "2024-02-15T15:10:00.000Z"
    },
    {
      "id": 3,
      "firstName": "Pierre",
      "lastName": "Lefebvre",
      "email": "pierre@example.com",
      "phone": "+33698765432",
      "address": "789 Boulevard Toulouse, 31000 Toulouse",
      "formationId": 2,
      "startDate": "2024-04-01T00:00:00.000Z",
      "status": "pending",
      "notes": null,
      "motivationLetter": null,
      "createdAt": "2024-02-16T09:15:00.000Z",
      "updatedAt": "2024-02-16T09:15:00.000Z"
    }
  ],
  "total": 3
}
```

---

## 🗄️ Exemple 5: Schéma de Données en Base

### Table: Enrollment (Prisma)
```prisma
model Enrollment {
  id                Int       @id @default(autoincrement())
  firstName         String
  lastName          String
  email             String
  phone             String?
  address           String?                    // ✨ NEW
  formationId       Int
  startDate         DateTime
  status            String    @default("pending")
  notes             String?
  motivationLetter  String?                    // ✨ NEW
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  formation         Formation @relation(fields: [formationId], references: [id])
}
```

### Exemple de Row en Base
```sql
id: 1
firstName: 'Jean'
lastName: 'Dupont'
email: 'jean@example.com'
phone: '+33612345678'
address: '123 Rue de Paris, 75001 Paris'
formationId: 1
startDate: 2024-03-15 00:00:00
status: 'accepted'
notes: 'Je suis passionné par le dev web'
motivationLetter: 'data:application/pdf;base64,JVBERi0xLjQK...'
createdAt: 2024-02-15 10:30:00
updatedAt: 2024-02-15 14:45:00
```

---

## 🎨 Exemple 6: Réponse d'Erreur

### Request PUT `/api/enrollments/999` (ID inexistant)
```json
{
  "status": "accepted"
}
```

### Response 404
```json
{
  "error": "Enrollment not found",
  "status": 404
}
```

---

### Request PUT `/api/enrollments/1` (Statut invalide)
```json
{
  "status": "invalid-status"
}
```

### Response 400
```json
{
  "error": "Invalid status. Must be one of: pending, accepted, rejected, cancelled",
  "status": 400
}
```

---

## 📧 Exemple 7: Logs d'Envoi d'Email (Console)

### Acceptation
```
🧪 Processing enrollment status change...
✅ Email sent to jean@example.com
   Subject: Acceptation de votre inscription - Développement Web Avancé
   Status: accepted
   Response: Message sent
```

### Rejet
```
🧪 Processing enrollment status change...
✅ Email sent to marie@example.com
   Subject: Votre inscription - Développement Web Avancé
   Reason: Nous avons reçu trop de candidatures pour cette formation
   Status: rejected
   Response: Message sent
```

### Erreur SMTP
```
❌ Failed to send email
   Error: Invalid login credentials for SMTP
   Check MAIL_USER and MAIL_PASSWORD in .env
   Status: 500
```

---

## 🔐 Exemple 8: Fichier Lettre de Motivation en Base64

### Fichier Original
```
PDF: motivation.pdf (50 KB)
```

### Stocké en DB
```json
{
  "motivationLetter": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MNCjExIDAgb2JqCjw8L1R5cGUvWE9iamVjdC9TdWJ0eXBlL0ltYWdlL1dpZHRoIDEwMTcvSGVpZ2h0IDUxNS9Db2xvclNwYWNlL0RldmljZVJHQi9MZW5ndGggMzI2MTAvRmlsdGVyL0ZsYXRlRGVjb2RlPj5zdHJlYW0KeJzt0k1zmzAQBWAkKIZDL7Q7naRJD+n0kp7atDPtYXpI..."
}
```

### Récupéré et Téléchargé
```
Clic sur "Télécharger"
  ↓
Base64 décodé
  ↓
Fichier: Jean_Dupont_motivation.pdf (50 KB)
  ↓
Ouvert dans lecteur PDF
```

---

## 📱 Exemple 9: Payload Formulaire Frontend

### JavaScript FormData Creation
```javascript
const formData = new FormData();
formData.append('firstName', 'Jean');
formData.append('lastName', 'Dupont');
formData.append('email', 'jean@example.com');
formData.append('phone', '+33612345678');
formData.append('address', '123 Rue de Paris, 75001 Paris');
formData.append('formationId', '1');
formData.append('startDate', '2024-03-15T00:00:00');
formData.append('notes', 'Intéressé par technologies modernes');
formData.append('motivation', fileObject); // File from <input type="file">

// Envoi
const response = await fetch('/api/enrollments', {
  method: 'POST',
  body: formData  // FormData envoyé directement
});
```

---

## 🎯 Résumé des Formats

| Type | Format | Stockage |
|------|--------|----------|
| Address | Texte | String en DB |
| Status | Enum | String: "pending", "accepted", "rejected", "cancelled" |
| Lettre | PDF/DOC | Base64 data URL en DB |
| Email | SMTP | HTML formaté |
| Dates | ISO 8601 | DateTime en DB |
| Raison Rejet | Texte | String optionnel |

Tous les exemples sont basés sur des données réelles du système! 📊
