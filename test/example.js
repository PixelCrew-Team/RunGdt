// ==========================================
// ping.js - Comando de ping para Kazuma
// Versión 1.0 - Traducido a JavaScript
// ==========================================

const config = require('../config.gdt');

class PingCommand {
    constructor() {
        this.prefix = config.prefix;
        this.name = config.name;
        this.version = config.version;
    }
    
    async run(kan, pulse) {
        const to = pulse.to;
        const msg = pulse.message.body;
        
        if (msg === this.prefix + 'ping') {
            const start = Date.now();
            
            await kan.send({
                to: to,
                text: '🏓 ¡Pong! Kazuma activo.'
            });
            
            const end = Date.now();
            const latency = end - start;
            
            await kan.send({
                to: to,
                text: '📊 Latencia: ' + latency + 'ms'
            });
            
            await kan.send({
                to: to,
                text: '🤖 ' + this.name + ' v' + this.version + ' - ¡Todo funciona!'
            });
            
            return;
        } else {
            await kan.send({
                to: to,
                text: '❌ Usa: ' + this.prefix + 'ping'
            });
        }
    }
}

module.exports = PingCommand;