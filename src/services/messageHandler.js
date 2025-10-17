import whatsappService from './whatsappService.js';

class MessageHandler {

  isGreeting(message) {
    const greetings = ['hola', 'hello', "hi", "buenas tardes"];
    return greetings.includes(message);
  }

  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else {
        const response = `Echo: ${message.text.body}`;
        await whatsappService.sendMessage(message.from, response, message.id);
      }
      await whatsappService.markAsRead(message.id);
    }
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const senderFullName = senderInfo?.profile?.name || senderInfo.wa_id;
    const senderFirstName = senderFullName.split(' ')[0] || 'there';
    const welcomeMessage = `Hola ${senderFirstName}, Bienvenido a nuestro servicio de Veterinaria online. 
En qué puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una opción";
    const buttons = [
      {
        type: "reply",
        reply: {
          id: "UNIQUE_BUTTON_ID_1",
          title: "Agendar cita"
        }
      },
      {
        type: "reply",
        reply: {
          id: "UNIQUE_BUTTON_ID_2",
          title: "Consultar historial"
        }
      },
      {
        type: "reply",
        reply: {
          id: "UNIQUE_BUTTON_ID_3",
          title: "Ver ubicación"
        }
      }
    ]

    await whatsappService.sendReplyButton(to, menuMessage, buttons);
  }
}

export default new MessageHandler();