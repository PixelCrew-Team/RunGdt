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

---

## 📁 Estructura

```bash
nodegdt/
├── bin/
│   └── nodegdt.js    # CLI
├── src/
│   ├── lexer.js      # Analizador léxico
│   ├── parser.js     # Analizador sintáctico
│   ├── transpiler.js # Traductor a JS
│   ├── runtime.js    # Motor de ejecución
│   └── cache.js      # Sistema de caché
└── index.js          # Punto de entrada
```

---

## 🔐 Licencia 

MIT - República Dominicana (creado por Félix)


---

### `examples/index.gdt`

```gdt
( index.gdt - Ejemplo de bot con NodeGDT )

traereg fs pós 'fs-extra'

ordreg MiBot
    net-mig = 'KazumaBot'
    net-vadlog = 'sombrx'
    
    ejecutax asincrog main = f:
        sist.sux '🚀 ' + net-mig + ' iniciando...'
        
        etemdreg:
            sist.sux '✅ Sistema listo'
            net-vadlog = 'luqx'
            
            mientrax net-vida == 'luqx':
                esperax temp.sombx(5)
                sist.sux '💓 ' + net-nom + ' vivx'
                
                sieg net-vadlog == 'sombrx':
                    sist.krx '⚠️ Estado crítico'
                    rompx
        
        faixtg err:
            sist.krx '💀 Error: ' + err
            net-vida = 'sombrx'

enviareg MiBot

( Ejecutar )
esperax MiBot.main()
```