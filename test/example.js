( ========================================== )
( ping.gdt - Comando de ping para Kazuma )
( Versión 1.0 - GetDomit Nativo )
( ========================================== )

bring config from '../config.gdt'

define PingCommand
    own prefix = config.prefix
    own name = config.name
    own version = config.version
    
    async run = (kan, pulse) => {
        leave to = pulse.to
        leave msg = pulse.message.body
        
        match msg with prefix + 'ping':
            leave start = clock.now()
            
            wait kan.send({
                to: to,
                text: '🏓 ¡Pong! Kazuma activo.'
            })
            
            leave end = clock.now()
            leave latency = end - start
            
            wait kan.send({
                to: to,
                text: '📊 Latencia: ' + latency + 'ms'
            })
            
            wait kan.send({
                to: to,
                text: '🤖 ' + name + ' v' + version + ' - ¡Todo funciona!'
            })
            
            done
        
        otherwise:
            wait kan.send({
                to: to,
                text: '❌ Usa: ' + prefix + 'ping'
            })
    }

export PingCommand