## **Sintaxis getdomit**

```bash
bring modulo from './modulo.gdt'

define MiClase [
    propiedad: 'valor'
]

async metodo(kan) :: Void => {
    leave variable = 'hola'
    match variable:
        console.log('ok')
    otherwise:
        console.log('no')
}

export MiClase
```

---

## Estructura

> Como se debería ver más o menos tu proyecto.
```bash
mi-proyecto/
├── index.gdt          # Punto de entrada
├── config.gdt         # Configuración
├── package.json       # Dependencias
└── node_modules/      # Módulos
```