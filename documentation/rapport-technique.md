# Rapport Technique
# Mini-projet DevSecOps – Conception, intégration et déploiement sécurisés d’une application de gestion des tâches

**Année universitaire :** 2026–2027  
**Formation :** Licence Informatique – RSI  
**Projet :** Task Manager DevSecOps  
**Dépôt GitHub :** https://github.com/MaladieBoy/task-manager-devsecops  
**Image Docker :** `xxmaladiexx/task-manager`

---

## 1. Introduction

### 1.1 Contexte du projet

Le développement logiciel moderne nécessite une intégration continue, un déploiement automatisé et une prise en compte de la sécurité tout au long du cycle de vie d'une application.

Le DevSecOps représente une approche qui intègre les pratiques de sécurité dans les processus DevOps. Au lieu de réaliser les contrôles de sécurité uniquement à la fin du développement, ils sont intégrés progressivement dans le pipeline CI/CD.

Ce mini-projet consiste à concevoir et mettre en place une chaîne DevSecOps permettant de construire, tester, analyser, conteneuriser et déployer une application de gestion des tâches.

### 1.2 Objectifs

Les principaux objectifs sont :

- Utiliser Git et GitHub pour la gestion du code source.
- Automatiser la compilation et les tests avec Maven.
- Mettre en place un pipeline CI/CD avec Jenkins.
- Analyser la qualité et la sécurité du code avec SonarQube.
- Détecter les dépendances vulnérables avec OWASP Dependency-Check.
- Conteneuriser l'application avec Docker.
- Analyser les images Docker avec Trivy.
- Déployer l'application sur Kubernetes avec Minikube.
- Réaliser une analyse dynamique avec OWASP ZAP.
- Générer et conserver les rapports de sécurité.

---

## 2. Architecture du projet

### 2.1 Architecture générale

Le projet utilise plusieurs outils complémentaires afin d'automatiser les différentes étapes du cycle DevSecOps.

Les principaux composants sont :

| Composant | Technologie | Rôle |
|---|---|---|
| Gestion du code | Git / GitHub | Versionnement et hébergement du code |
| Application | Java / Spring Boot | Application de gestion des tâches |
| Build et tests | Maven | Compilation et exécution des tests |
| CI/CD | Jenkins | Automatisation du pipeline |
| Analyse du code | SonarQube | Analyse statique et Quality Gate |
| Analyse des dépendances | OWASP Dependency-Check | Détection des CVE |
| Conteneurisation | Docker | Construction et exécution des images |
| Analyse d'image | Trivy | Détection des vulnérabilités |
| Registry | Docker Hub | Publication de l'image Docker |
| Orchestration | Kubernetes / Minikube | Déploiement de l'application |
| Analyse dynamique | OWASP ZAP | Tests de sécurité sur l'application déployée |

### 2.2 Architecture de l'application

L'application Task Manager est développée avec Java et Spring Boot.

Elle expose une API REST permettant de gérer des tâches :

- `GET /tasks` : récupérer toutes les tâches.
- `GET /tasks/{id}` : récupérer une tâche par son identifiant.
- `POST /tasks` : créer une tâche.
- `PUT /tasks/{id}` : modifier une tâche.
- `DELETE /tasks/{id}` : supprimer une tâche.

Une interface web permet également d'interagir avec l'application.

Les données sont stockées en mémoire dans cette version du projet. Elles ne sont donc pas conservées après le redémarrage de l'application.

### 2.3 Architecture DevSecOps

Le fonctionnement général est le suivant :

1. Le code source est versionné dans GitHub.
2. Jenkins récupère le projet.
3. Maven compile l'application et exécute les tests.
4. SonarQube analyse le code source.
5. Le Quality Gate vérifie les conditions de qualité configurées.
6. OWASP Dependency-Check analyse les dépendances.
7. Docker construit l'image de l'application.
8. Trivy analyse l'image.
9. Jenkins publie l'image sur Docker Hub.
10. Kubernetes déploie la nouvelle version.
11. OWASP ZAP réalise une analyse dynamique de l'application déployée.

---

## 3. Mise en place du pipeline CI/CD

### 3.1 Environnement de travail

Le projet a été réalisé dans un environnement Linux EndeavourOS.

Les principaux outils installés et utilisés sont :

| Outil | Version / Configuration |
|---|---|
| Java | OpenJDK 25 |
| Maven | 3.9.11 |
| Jenkins | 2.590 |
| SonarQube | Community Build 26.11 |
| Docker | 29.8.1 |
| Trivy | 0.76.2 |
| OWASP Dependency-Check | 13.0.0 |
| OWASP ZAP | 2.17.0 |
| Kubernetes | 1.35.1 |
| Minikube | Docker driver |

### 3.2 Configuration de Jenkins

Jenkins est utilisé comme serveur d'intégration et de déploiement continu.

Il est accessible localement à l'adresse :

`http://localhost:8090`

Un fichier `Jenkinsfile` définit les différentes étapes du pipeline.

Les outils et accès nécessaires sont configurés dans Jenkins, notamment :

- JDK 25.
- Maven 3.9.11.
- Connexion à SonarQube.
- Identifiants Docker Hub.
- Clé API NVD pour Dependency-Check.
- Configuration d'accès au cluster Kubernetes.

Les informations sensibles sont stockées dans le système de credentials de Jenkins afin d'éviter leur inscription directe dans le code du pipeline.

### 3.3 Description des étapes du pipeline

Le pipeline contient neuf étapes principales.

**1. Build and Unit Tests**

Cette étape exécute :

`mvn clean verify`

Maven nettoie les anciens fichiers générés, compile le projet et exécute les tests unitaires.

**2. SonarQube Analysis**

SonarQube analyse le code source afin d'identifier les problèmes de qualité et les éventuels problèmes de sécurité détectables par les règles disponibles.

**3. Quality Gate**

Le pipeline attend le résultat du Quality Gate de SonarQube.

Si les conditions configurées ne sont pas satisfaites, le pipeline est interrompu.

**4. OWASP Dependency-Check**

Cette étape analyse les dépendances du projet à la recherche de vulnérabilités connues.

Les résultats sont générés aux formats HTML et XML.

**5. Docker Build**

Docker construit une image à partir du Dockerfile du projet.

L'image utilise un tag correspondant au numéro du build Jenkins.

**6. Trivy Image Scan**

Trivy analyse l'image Docker, notamment les dépendances Java et les composants du système.

Le pipeline recherche les vulnérabilités de sévérité HIGH et CRITICAL.

La commande utilise `--exit-code 0`, ce qui permet au pipeline de continuer même si des vulnérabilités sont détectées. Les résultats sont conservés dans un rapport.

**7. Push to Docker Hub**

Après la construction et l'analyse de l'image, Jenkins se connecte à Docker Hub et publie l'image.

Les identifiants sont récupérés depuis les credentials Jenkins.

**8. Deploy to Kubernetes**

Jenkins met à jour l'image utilisée par le Deployment Kubernetes, puis attend la fin du déploiement avec la commande `kubectl rollout status`.

**9. OWASP ZAP DAST Scan**

Après le déploiement, OWASP ZAP réalise une analyse dynamique de l'application accessible via le service Kubernetes.

Un rapport HTML est généré.

### 3.4 Archivage des résultats

À la fin du pipeline, Jenkins publie les résultats des tests unitaires et archive les rapports de sécurité.

Les rapports conservés comprennent :

- Le rapport OWASP Dependency-Check.
- Le rapport Trivy.
- Le rapport OWASP ZAP.

Ces fichiers permettent de consulter les résultats des analyses après l'exécution du pipeline.

---

## 4. Intégration des outils de sécurité

### 4.1 SonarQube – SAST

SonarQube réalise une analyse statique du code source sans exécuter l'application.

Il permet notamment de détecter certains problèmes de qualité, de maintenabilité et de sécurité.

Dans ce projet, SonarQube est intégré à Jenkins et suivi d'un Quality Gate.

### 4.2 OWASP Dependency-Check – Analyse des dépendances

OWASP Dependency-Check identifie les bibliothèques utilisées par le projet et recherche les vulnérabilités connues associées à leurs versions.

Il s'appuie notamment sur les informations des bases de vulnérabilités telles que la National Vulnerability Database (NVD).

### 4.3 Trivy – Analyse des images Docker

Trivy analyse les images de conteneurs afin d'identifier les vulnérabilités présentes dans les paquets du système et les dépendances applicatives.

Dans ce projet, le rapport est généré avant la publication de l'image sur Docker Hub.

### 4.4 OWASP ZAP – DAST

OWASP ZAP réalise des tests dynamiques sur une application en fonctionnement.

Contrairement à l'analyse statique, il envoie des requêtes HTTP à l'application déployée afin d'observer les réponses et de détecter certains problèmes de sécurité.

Il permet notamment d'identifier des en-têtes HTTP de sécurité manquants et d'autres alertes liées au comportement de l'application.

---

## 5. Résultats et analyse

Les résultats présentés dans cette section correspondent aux analyses observées lors du build Jenkins numéro 15, sauf indication contraire.

### 5.1 SonarQube – Analyse statique

SonarQube a été intégré au pipeline Jenkins afin d'analyser le code source et d'évaluer sa qualité.

Les résultats précédemment observés étaient :

- **Quality Gate :** Passed.
- **Nouveaux problèmes :** 0 dans l'analyse inspectée.
- **Security Hotspots :** 0 dans l'analyse inspectée.
- **Coverage et duplications :** non calculés dans les résultats inspectés.

Le Quality Gate est configuré pour interrompre le pipeline si les conditions définies ne sont pas respectées.

Un Quality Gate réussi ne garantit cependant pas l'absence totale de vulnérabilités dans l'application.

### 5.2 OWASP Dependency-Check – Analyse des dépendances

Le rapport du build Jenkins numéro 15 a identifié 85 correspondances CVE réparties sur cinq dépendances.

| Dépendance | Sévérité | Nombre de CVE |
|---|---|---:|
| Jackson Core 3.0.2 | High | 1 |
| Jackson Databind 3.0.2 | High | 8 |
| Log4j API 2.25.2 | Medium | 3 |
| Spring Core 7.0.1 | Critical | 38 |
| Tomcat Embed Core 11.0.14 | Critical | 35 |
| **Total** | | **85** |

Ces résultats montrent que plusieurs dépendances nécessitent une attention particulière, notamment Spring Core et Tomcat Embed Core.

Les correspondances CVE détectées ne doivent pas automatiquement être considérées comme des vulnérabilités exploitables. Chaque résultat doit être vérifié en fonction des versions concernées et de l'utilisation réelle du composant dans l'application.

### 5.3 Trivy – Analyse de l'image Docker

Trivy a analysé l'image :

`xxmaladiexx/task-manager:15`

Le rapport a identifié les résultats suivants :

| Cible | Vulnérabilités |
|---|---:|
| Image de base Ubuntu 26.04 | 0 |
| Application Java JAR | 32 |
| Binaire Pebble | 0 |
| **Total** | **32** |

Les 32 vulnérabilités identifiées dans les dépendances Java sont réparties comme suit :

- **Critical :** 10.
- **High :** 22.

Les bibliothèques concernées comprennent notamment Apache Tomcat, Spring Boot, Spring Framework et Jackson.

Aucune vulnérabilité n'a été détectée dans les paquets du système d'exploitation Ubuntu analysés. En revanche, plusieurs vulnérabilités ont été identifiées dans les dépendances Java intégrées dans le fichier JAR.

L'étape Trivy utilise l'option `--exit-code 0`. Les résultats sont donc enregistrés dans le rapport sans interrompre automatiquement le pipeline.

### 5.4 OWASP ZAP – Analyse dynamique

OWASP ZAP a réalisé une analyse dynamique de l'application déployée à l'adresse :

`http://192.168.49.2:30080`

Le rapport généré avec ZAP 2.17.0 présente les alertes suivantes :

| Niveau de risque | Nombre d'alertes |
|---|---:|
| High | 0 |
| Medium | 2 |
| Low | 1 |
| Informational | 2 |

Les principales alertes détectées sont :

- **Content Security Policy (CSP) Header Not Set :** niveau Medium.
- **Missing Anti-clickjacking Header :** niveau Medium.
- **X-Content-Type-Options Header Missing :** niveau Low.

Ces alertes indiquent l'absence de certains en-têtes HTTP de sécurité. Une configuration appropriée de ces en-têtes pourrait améliorer la protection côté navigateur.

ZAP a également signalé une erreur et un avertissement dans ses journaux. Par ailleurs, 91 % des réponses observées avaient un code HTTP 4xx. Ces éléments doivent être pris en compte lors de l'évaluation de la couverture du scan.

L'absence d'alertes de niveau High ne signifie pas que l'application est totalement sécurisée. Les résultats dépendent des routes accessibles et des tests effectivement réalisés.

### 5.5 Analyse globale

Les quatre outils apportent des analyses complémentaires :

- SonarQube analyse le code source.
- Dependency-Check recherche les vulnérabilités connues dans les dépendances.
- Trivy analyse l'image Docker et ses composants.
- ZAP teste dynamiquement l'application déployée.

Les résultats les plus importants proviennent des analyses de dépendances et de l'image Docker, notamment pour Spring, Tomcat et Jackson.

ZAP a principalement identifié des en-têtes HTTP de sécurité manquants, sans alerte de niveau High.

Dependency-Check et Trivy analysent tous les deux les dépendances Java, mais utilisent des méthodes et des bases de données différentes. Leurs résultats peuvent se chevaucher. Il ne faut donc pas additionner leurs nombres de vulnérabilités comme s'il s'agissait de problèmes distincts.

Dans l'ensemble, le pipeline a exécuté les étapes configurées et généré les rapports nécessaires à l'analyse. Ces résultats démontrent l'intérêt d'intégrer des contrôles de sécurité automatisés dans le processus CI/CD.

---

## 6. Difficultés rencontrées et solutions apportées

### 6.1 Problèmes liés à Docker

Lors de l'utilisation de Docker, un problème de démarrage du service a été rencontré. L'erreur était liée à la configuration du réseau et à certains modules du noyau Linux nécessaires au fonctionnement du bridge Docker.

Le problème a été diagnostiqué et corrigé en démarrant sur le noyau LTS et en chargeant les modules nécessaires, notamment `br_netfilter` et `xt_addrtype`.

Après cette correction, le service Docker a pu redémarrer normalement.

### 6.2 Problèmes liés à Kubernetes

Lors d'une exécution du pipeline, le déploiement Kubernetes a échoué parce que Minikube était arrêté.

Jenkins ne pouvait donc pas accéder au cluster Kubernetes.

La solution a consisté à redémarrer Minikube, vérifier l'état du nœud avec `kubectl get nodes`, puis relancer le pipeline.

Le déploiement a ensuite été effectué correctement.

### 6.3 Configuration des credentials Jenkins

Les outils du pipeline nécessitent plusieurs informations d'authentification, notamment pour SonarQube, Docker Hub et l'accès à la base NVD.

Pour éviter d'inscrire directement les informations sensibles dans le Jenkinsfile, des credentials Jenkins ont été configurés et utilisés dans les étapes correspondantes.

### 6.4 Analyse des vulnérabilités

Les outils de sécurité ont détecté plusieurs vulnérabilités dans les dépendances Java.

Il a été nécessaire de distinguer les résultats fournis par les scanners des vulnérabilités réellement exploitables.

Les versions affectées, les versions corrigées et le contexte d'utilisation des bibliothèques doivent être vérifiés avant toute décision de correction.

### 6.5 Limites identifiées

Certaines améliorations restent possibles :

- Mettre à jour les dépendances présentant des vulnérabilités confirmées.
- Ajouter les en-têtes HTTP de sécurité manquants.
- Configurer une politique de blocage du pipeline pour les vulnérabilités HIGH et CRITICAL.
- Renforcer la sécurité du Dockerfile, notamment en utilisant un utilisateur non privilégié.
- Améliorer la couverture des tests dynamiques ZAP.
- Ajouter une base de données persistante pour conserver les tâches après redémarrage.
- Améliorer la gestion des secrets et la sécurisation des accès.

Ces améliorations constituent des pistes d'évolution et ne sont pas toutes implémentées dans la version actuelle.

---

## 7. Conclusion

Ce mini-projet a permis de mettre en place une chaîne DevSecOps intégrant les principales étapes du cycle de vie d'une application : gestion du code source, compilation, tests, analyse de sécurité, construction d'une image Docker, publication et déploiement Kubernetes.

L'intégration de Jenkins permet d'automatiser les différentes étapes du processus. Les outils SonarQube, OWASP Dependency-Check, Trivy et OWASP ZAP apportent des contrôles complémentaires à différents niveaux.

Les analyses réalisées ont également montré que la réussite d'un build ou d'un déploiement ne signifie pas nécessairement que l'application est exempte de vulnérabilités. Les rapports générés permettent d'identifier les problèmes nécessitant une investigation et des corrections.

Ce projet constitue une première mise en pratique des principes DevSecOps et montre l'importance d'intégrer la sécurité dès les premières étapes du développement logiciel.

