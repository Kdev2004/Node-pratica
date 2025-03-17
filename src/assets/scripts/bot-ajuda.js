const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

function initializeBot() {
    const client = new Client({
        authStrategy: new LocalAuth()
    });

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Bot conectado com sucesso!');
    });

    const conversationState = {};
    const timers = {}; // Objeto para armazenar os temporizadores

    client.on('message', async message => {
        if (message.from.includes('@g.us')) {
            return; // Ignora mensagens de grupos
        }

        console.log('Mensagem recebida:', message.body, 'De:', message.from);

        // Lógica para mensagens normais
        if (conversationState[message.from] === 'awaiting_response') {
            conversationState[message.from] = 'awaiting_finalization';
            await message.reply('Dúvida recebida com sucesso! Iremos retornar em breve.');
        } else if (conversationState[message.from] === 'awaiting_finalization') {
            return; // Ignora mensagens subsequentes
        } else {
            conversationState[message.from] = 'awaiting_response';
            await message.reply('Olá, seja bem-vindo(a) ao canal de atendimento do Mercado Natela! Informe sua dúvida e iremos ajudar o mais breve possível!');

            // Inicia o temporizador de 10 minutos
            timers[message.from] = setTimeout(async () => {
                delete conversationState[message.from]; // Remove o estado da conversa
                delete timers[message.from]; // Remove o temporizador do objeto
                await client.sendMessage(message.from, 'Atendimento finalizado automaticamente após 10 minutos.');
            }, 600000); // 10 minutos em milissegundos
        }
    });

    client.initialize();
}

module.exports = initializeBot;