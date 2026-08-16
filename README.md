# CONTRA PERÚ 🎮

> Shooter run'n'gun estilo *Contra III: The Alien Wars* ambientado en Lima, Perú · abril 2026.

**Gregorio Quispe Vargas** — con su gorra de Alianza Lima y un USB con la
evidencia del fraude — tiene que cruzar **5 distritos de Lima** hasta llegar a
la ONPE en Jesús María. La ciudad no se lo va a poner fácil.

**Jugar:** https://n3ws.tech/contra-peru/

## Concepto

Un POC de juego de acción con estética retro (sprites procesados con tooling
propio) y narrativa de sátira política peruana: el recorrido del ciudadano
común cargando la prueba hasta la autoridad electoral, distrito por distrito.

## Estructura

```
contra-peru/
├── game/     El juego (escenas, entidades, engine de sprites/tilemap)
├── tools/    Pipeline de sprites y ROMs (paletas, headers, tilemaps)
└── docs/     Documentación del proyecto
```

## Correr localmente

Abrir `game/index.html` en un navegador (sin build, sin dependencias).

## Stack

- JavaScript vanilla (canvas), engine propio de sprites + tilemap
- Pipeline de assets en Python (`tools/`) para procesar sprites y paletas
- Sin dependencias externas

## Créditos

POC desarrollado en abril 2026. Inspirado en el clásico *Contra III: The Alien
Wars* (Konami). Proyecto de demostración — no afiliado a ninguna entidad
electoral ni partido político.

## License

MIT (ver `LICENSE`).
