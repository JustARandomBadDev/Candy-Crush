# Préparation du projet Candy Crush Simplifié

## 1. Architecture MVC

On va séparer en trois parties :

- **Modèle** : tout ce qui contient les données et les règles du jeu.
- **Vue** : ce qui s’occupe d’afficher la grille et les bonbons dans le canvas.
- **Contrôleur** : celui qui gère les clics, qui demande au modèle de changer les données et qui appelle la vue pour les animations.

---

## 2. Classes principales

On aura 5 classes reparties entre les 3 parties MVC comme ceci :

- **Modèle**
  - Model
  - Candy
- **Contrôleur**
  - Controller
  - Animator
- **Vue**
  - View

### Controller

- Gère les clics utilisateur.
- Vérifie si les bonbons sélectionnés sont voisins.
- Appelle le modèle pour gérer un swap.
- Lance les animations via Animator.
- Attend la fin des animations avant de continuer le traitement.

### Animator

- S’occupe des animations graphiques : swap, retour si invalide, destruction, chute, apparition des nouveaux bonbons.
- Ne touche pas aux données, juste aux positions visuelles.
- Dit au controleur quand une animation est terminée.

### View

- Dessine la grille sur le canvas.
- Affiche les bonbons selon leur position actuelle.
- Ne connaît pas les règles du jeu.
- Affiche le score.

### Candy

- Contient les données d’un bonbon : image & position.

### Model

- Contient la grille de bonbon (tableau 2D).
- Vérifie les alignements et gère les suppressions.
- Gère la chute des bonbons et le remplissage par le haut.

---

## 3. Diagramme de classes Mermaid

Les getters & setters ne sont pas dans le diagramme.

```mermaid
classDiagram
class Controller {
  +handleClick(candy)
  +selectCandy(candy)
  +swapCandies(c1, c2)
}
class Animator {
  +animateSwap(c1, c2)
  +animateDestroy(candies)
  +animateDrop(candies)
}
class View {
  +drawGrid()
  +drawCandies()
}
class Candy {
  -image: image
  -gridPosition: Position
  -state: string
}
class Model {
  -grid: Candy[][]
  -score: number
  +checkMatches()
  +removeMatches()
  +dropCandies()
}

Controller --> Animator
Controller --> Model
Controller --> View
Model --> Candy
View --> Candy
Animator --> Candy
```

---

## 4. Diagramme de séquence

```mermaid
sequenceDiagram
participant Player
participant Controller
participant Model
participant View

Player->>Controller: clique bonbon 1
Player->>Controller: clique bonbon 2
Controller->>View: animateSwap()
View-->>Controller: fin animation
Controller->>Model: vérifier swap valide
alt swap valide
    Controller->>Model: swap logique
    Controller->>Model: checkMatches()
    Model-->>Controller: bonbons à détruire
    Controller->>View: animateDestroy()
    View-->>Controller: fin animation
    Controller->>Model: dropCandies()
    Controller->>View: animateDrop()
    View-->>Controller: fin animation
else swap invalide
    Controller->>View: animateRetourSwap()
    View-->>Controller: fin animation
end
Controller->>Player: rend la main
```

---

## 5. Diagramme de flux

```mermaid
flowchart TD
Start --> ClickCandy1
ClickCandy1 --> ClickCandy2
ClickCandy2 --> AnimateSwap
AnimateSwap --> CheckSwap
CheckSwap -->|Ok| Swap
CheckSwap -->|Pas ok| AnimateRetour
Swap --> CheckMatches
CheckMatches -->|Ok| AnimateDestroy
AnimateDestroy --> DropCandies
DropCandies --> FillNewCandies
FillNewCandies --> CheckMatches
CheckMatches -->|Pas ok| End
AnimateRetour --> End
```

---

## The end
