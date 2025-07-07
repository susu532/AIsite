# Rapport de la Phase de Conception du Projet StageAI

## 1. Présentation Générale

Le projet StageAI est une plateforme web qui combine plusieurs technologies modernes pour offrir des fonctionnalités d’intelligence artificielle (génération de texte, d’images, chat IA) . Il est structuré en trois parties principales :
- **backend/** : API et logique métier (Flask, IA, MongoDB)

- **frontend/** : Application Next.js pour l’interface IA moderne

---

## 2. Architecture Générale

### a. Architecture en couches

- **Frontend (Next.js)** : Interface utilisateur moderne pour l’IA (génération de texte, d’images, chat).

- **Backend (Flask)** : API REST, gestion de l’authentification, génération IA, stockage MongoDB.

### b. Communication

- Les interfaces frontend  communiquent avec le backend via des requêtes HTTP (fetch/AJAX).
- Le backend expose des endpoints REST pour chaque fonctionnalité (auth, génération, historique, etc.).

---

## 3. Conception du Backend

### a. Technologies

- **Flask** : Framework web Python léger pour l’API.
- **MongoDB** : Base de données NoSQL pour stocker utilisateurs et historiques.
- **Stable Diffusion (diffusers)** : Génération d’images IA.
- **OpenAI API** : Génération de texte/chat IA.
- **Flask-Bcrypt** : Sécurisation des mots de passe.
- **Flask-CORS** : Autorisation des requêtes cross-origin.

### b. Structure des endpoints


- `/generate-text` : Génération de texte IA (avec historique).
- `/generate-image` : Génération d’image IA (avec historique).
- `/history` : Récupération de l’historique utilisateur.
- `/chat` : Chat IA.
- `/images/<filename>` : Accès aux images générées.

### c. Sécurité

- Utilisation de sessions Flask pour l’authentification.
- Hashage des mots de passe avec Bcrypt.
- Gestion des erreurs et des statuts HTTP.

---

## 4. Conception du Frontend (Next.js)

### a. Technologies

- **Next.js** : Framework React pour SSR/SSG, pages dynamiques.
- **TypeScript** : Typage statique.
- **Tailwind CSS** : Design moderne et responsive.
- **Framer Motion** : Animations fluides.

### b. Fonctionnalités

- Génération de texte et d’images via prompts utilisateur.
- Chat IA interactif.
- Affichage dynamique des résultats et de l’historique.
- Appels API vers le backend Flask.

### c. Structure

- `app/page.tsx` : Page principale avec UI pour toutes les fonctionnalités IA.
- `app/layout.tsx` : Layout global, gestion des polices et du thème.
- `public/` : Fichiers statiques (icônes, images).
- `globals.css` : Styles globaux (avec Tailwind).

---







## 7. Choix de conception

- **Séparation claire des responsabilités** : chaque dossier a un rôle précis.
- **Scalabilité** : possibilité d’ajouter d’autres modules IA ou de gestion.
- **Sécurité** : gestion des sessions, hashage des mots de passe.
- **Expérience utilisateur** : UI moderne (Next.js) et classique (React/Bootstrap).

---

## 8. Conclusion

La phase de conception a permis de structurer le projet de façon modulaire, sécurisée et évolutive, en s’appuyant sur des technologies robustes et reconnues. L’architecture facilite la maintenance, l’ajout de nouvelles fonctionnalités IA, et offre une expérience utilisateur riche et variée.

---

## 10. Conclusion

La phase de conception du projet StageAI a permis de poser des bases solides pour une application web moderne, modulaire et évolutive. L’architecture en trois couches (backend Flask, client React, frontend Next.js) garantit une séparation claire des responsabilités, une sécurité renforcée et une grande flexibilité pour l’ajout de nouvelles fonctionnalités, notamment autour de l’intelligence artificielle. Les choix technologiques assurent la maintenabilité du code, la scalabilité de la plateforme et une expérience utilisateur optimale, aussi bien pour la gestion de bibliothèque que pour l’expérimentation IA. Ce socle robuste permettra d’accompagner sereinement les évolutions futures du projet.

---

## Conclusion sur les captures d’écran du code source

Les captures d’écran présentées dans ce rapport illustrent les choix architecturaux et techniques majeurs du projet StageAI. Elles mettent en lumière la structuration du code, la clarté des responsabilités entre les différentes couches (backend, frontend), ainsi que l’intégration des technologies d’intelligence artificielle. Chaque capture, accompagnée de son commentaire, permet de mieux comprendre le fonctionnement interne de l’application et la logique suivie lors de la phase de conception. Cette démarche visuelle facilite la transmission des connaissances et la prise en main du projet par de futurs développeurs ou parties prenantes.

---

