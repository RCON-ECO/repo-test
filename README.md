# Ma liste de tâches intelligente

Une petite application web en français pour organiser ses tâches, sans compte ni serveur. Elle fonctionne sur ordinateur et sur mobile.

## Utilisation

Ouvrez `index.html` dans un navigateur moderne. Pour servir l'application localement, vous pouvez aussi lancer :

```sh
python3 -m http.server 8000
```

Puis ouvrez <http://localhost:8000>.

Ajoutez une tâche avec le bouton dédié. Le titre est obligatoire ; description, date limite et catégorie sont facultatives. Vous pouvez modifier, cocher, rouvrir ou supprimer chaque tâche. La suppression demande confirmation.

La recherche et les filtres se combinent. Les tâches à faire sont triées par échéance, puis par priorité à échéance égale ; les tâches sans échéance apparaissent ensuite, avant les tâches terminées. Les tâches à faire en retard ou prévues aujourd'hui sont signalées. Les compteurs portent sur toutes les tâches, indépendamment des filtres.

## Stockage et confidentialité

Les tâches sont enregistrées dans le `localStorage` du navigateur : elles ne sont pas synchronisées entre appareils et peuvent être perdues si les données du navigateur sont effacées. Le mode privé ou certaines configurations peuvent limiter leur conservation. Aucun compte, serveur ou service externe n'est utilisé. Si le stockage échoue, l'application affiche un avertissement et les modifications ne sont conservées que pendant la session.

## Tests

Avec Node.js 18 ou plus récent :

```sh
node --test tests/*.test.js
```

Ces tests couvrent les règles de tri, d'échéance, de filtrage et de validation ; ils ne remplacent pas un test manuel de l'interface dans un navigateur.

## Publication facultative sur GitHub Pages

Après fusion sur `main`, dans les paramètres du dépôt, ouvrez **Pages**, choisissez **Deploy from a branch**, puis la branche `main` et le dossier `/ (root)`. GitHub affichera ensuite l'adresse de publication.
