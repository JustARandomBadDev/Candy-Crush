# Implémentation Candy Crush

## Objectif

Mon objectif pendant l'implémentation était de suivre au maximum le [plan du TP d'avant](doc/last_readme.md) pour voir le code que ça donnerait.

Spoiler alert : ça n'a pas une bonne tête.

## Les différences

### Model

- **+ randomColor() :** pour avoir une couleur de candy aléatoire.
- **+ checkAllMatches() :** pour checker les matchs sur la grille entière.

### View

- **- drawGrid() :** c'était pas agréable à regarder avec.
- **+ start() & stop() :** j'avais pas pensé au fait que l'update des animations (les positions) serait en async avec **requestAnimationFrame()**, donc la view est en async aussi, et **start()** démarre un update en boucle avec **requestAnimationFrame()** aussi, et **stop()**, pour stopper la boucle d'update du canvas (c'est pour opti pour pas update le canvas alors que rien n'à bougé).

### Animator

- **+ anim() :** juste une méthode générique qui gère l'async et qui est utilisé pas les autres méthodes d'animation.

### Candy

- **gridPosition :** au final j'ai pas stocké, la pos dans la grid mais la position pixel dans le canvas, comme ça avec Animator, je modifie la pos pixel des candies, et la view update ne temps réèl.

## Conclusion

Mon plan de base était pas asser poussé, en essayant de le suivre un max, j'ai un code pas du tout maintenable, des méthodes qui font + de 50 lignes alors que j'aurais pu diviser ça en plusieurs méthodes.

Si j'avais eu le temps, je l'aurais refais en js comme vous m'aviez conseillé de le faire, et j'aurais aussi amélioré mon candy crush en ts, mais en ce moment c'est asser compliqué.

## NW.js

Merci à @maximedrn pour m'avoir aider à setup NW.js.
