# Configuration du Système d'Email

Ce projet utilise **Nodemailer** pour envoyer des emails automatiques lors des changements de statut d'inscription (acceptation/rejet).

## Variables d'Environnement Requises

Ajoutez les variables suivantes à votre fichier `.env` :

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@cjdtc.com
```

## Options de Configuration

### 1. Gmail (Recommandé pour développement)

**Étapes :**

1. **Activer l'authentification 2FA** sur votre compte Google
   - Allez sur [Google Account Security](https://myaccount.google.com/security)
   - Activez "Vérification en 2 étapes"

2. **Générer une "App Password"**
   - Allez sur [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Sélectionnez "Mail" et "Windows (ou autre)"
   - Copiez le mot de passe généré

3. **Configurer le fichier `.env`** :
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx
MAIL_FROM=CJ DTC <your-email@gmail.com>
```

### 2. Mailtrap (Recommandé pour production)

**Étapes :**

1. **Créer un compte gratuit** sur [Mailtrap](https://mailtrap.io)

2. **Récupérer les identifiants SMTP** :
   - Allez dans "Email Testing" → "Inboxes"
   - Sélectionnez votre inbox
   - Cliquez sur "Show Credentials"
   - Copiez les informations SMTP

3. **Configurer le fichier `.env`** :
```env
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_FROM=noreply@cjdtc.com
```

### 3. Brevo (anciennement Sendinblue)

**Étapes :**

1. **Créer un compte** sur [Brevo](https://www.brevo.com)

2. **Obtenir les identifiants SMTP** :
   - Allez dans "Settings" → "SMTP & API"
   - Copiez les informations SMTP

3. **Configurer le fichier `.env`** :
```env
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-brevo-email
MAIL_PASSWORD=your-brevo-password
MAIL_FROM=noreply@cjdtc.com
```

## Fonctionnalités d'Email

### Emails Automatiques

Le système envoie automatiquement des emails dans les cas suivants :

#### 1. **Acceptation d'Inscription**
- **Déclencheur** : Admin change le statut à "accepté"
- **Contenu** :
  - Confirmation d'acceptation
  - Détails de la formation
  - Instructions pour commencer
  - Message de bienvenue personnalisé

#### 2. **Rejet d'Inscription**
- **Déclencheur** : Admin change le statut à "rejeté"
- **Contenu** :
  - Notification de rejet
  - Raison (optionnelle, peut être fournie par l'admin)
  - Suggestion de contact

### Flux Admin

```
Admin Page (/admin/enrollments)
    ↓
Clic sur bouton "Accepter" ou "Rejeter"
    ↓
Component EnrollmentStatusChanger
    ↓
PUT /api/enrollments/[id]
    ↓
Mise à jour DB + Email automatique
    ↓
Confirmation affichée à l'admin
```

## Exemples d'Emails

### Email d'Acceptation

```
Sujet: Acceptation de votre inscription - [Nom Formation]

Contenu:
Félicitations, [Prénom]!

Nous avons le plaisir de vous informer que votre inscription
pour la formation suivante a été ACCEPTÉE:

Formation: [Titre Formation]
Date de début: [Date]

[Contenu HTML formaté avec détails...]
```

### Email de Rejet

```
Sujet: Votre inscription - [Nom Formation]

Contenu:
Bonjour [Prénom],

Nous vous informons que votre demande d'inscription
pour la formation [Titre Formation] n'a pas pu être acceptée.

Raison: [Si fournie par l'admin]

Pour plus d'informations, n'hésitez pas à nous contacter...
```

## Dépannage

### "Authentication failed"
- Vérifiez l'App Password Gmail (pas le mot de passe du compte)
- Vérifiez que 2FA est activé

### "Connection timeout"
- Vérifiez le port SMTP (587 pour TLS, 465 pour SSL)
- Vérifiez que MAIL_SECURE correspond (false pour 587, true pour 465)

### "Email not received"
- Vérifiez les logs dans la console
- Pour Mailtrap, vérifiez l'inbox de test
- Vérifiez l'adresse email du destinataire

### Test d'Envoi

Pour tester manuellement, vous pouvez appeler l'endpoint:

```bash
curl -X PUT http://localhost:3000/api/enrollments/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted"
  }'
```

## Variables Utilisées dans Emails

- `{firstName}` - Prénom de l'étudiant
- `{formation.title}` - Titre de la formation
- `{formation.description}` - Description de la formation
- `{startDate}` - Date de début formatée

## Support

Pour plus d'aide:
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Mailtrap Documentation](https://mailtrap.io/blog/nodemailer-gmail/)
