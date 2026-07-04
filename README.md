# NodeGDT - Runtime para GetDomit

**NodeGDT** es el runtime oficial para el lenguaje de programación **GetDomit**.
Permite ejecutar archivos `.gdt` directamente en Node.js sin necesidad de compilación manual.

## Instalación

```bash
npm install -g nodegdt
```

## Uso

1. Ejecutar un archivo gdt 

```bash
nodegdt run index.gdt
```
2. Modo Watch (reinicio automático)

```bash
nodegdt run index.gdt --watch
```

3. Compilar GDT a javascript 

```bash 
nodegdt build index.gdt -o dist/
```

4. Iniciar Proyecto

```bash
nodegdt init
```

---

## Ejemplo

```gdt
( index.gdt )
traereg fs pós 'fs-extra'

ordreg MiApp
    ejecutax asincrog main = f:
        sist.sux '🚀 Hola GetDomit!'
        esperax fs.sillax('test.txt', 'Contenido GetDomit')

enviareg MiApp
```