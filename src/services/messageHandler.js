import whatsappService from './whatsappService.js';

class MessageHandler {

  isGreeting(message) {
    const greetings = ['hola', 'hello', "hi", "buenas tardes"];
    return greetings.includes(message);
  }

  async handleIncomingMessage(message) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id);
      } else {
        const response = `Echo: ${message.text.body}`;
        await whatsappService.sendMessage(message.from, response, message.id);
      }
      await whatsappService.markAsRead(message.id);
    }
  }

  async sendWelcomeMessage(to, messageId) {
    const welcomeMessage = "Hola, Bienvenido a nuestro servicio de Veterinaria online. "
      + "En qué puedo ayudarte hoy?";
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }
}

export default new MessageHandler();