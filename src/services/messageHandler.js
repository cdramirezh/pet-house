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
    } else if (message?.type === 'interactive') {
      const optionTitle = message?.interactive?.button_reply?.title.toLowerCase().trim();
      const optionId = message?.interactive?.button_reply?.id;

      await this.handleMenuOption(message.from, optionTitle);
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

  async handleMenuOption(to, optionTitle) {
    let response;
    switch (optionTitle) {
      case 'agendar cita':
        response = 'Agendar cita con veterianario';
        break;
      case 'consultar historial':
        response = 'Consultar historial médico de mi mascota';
        break;
      case 'ver ubicación':
        response = 'Esta es nuestra ubicación: 📌 https://goo.gl/maps/example';
        break;
      default:
        response = 'Opción no reconocida. Por favor, elige una opción válida del menú.';
    }
    
    await whatsappService.sendMessage(to, response, null);
  }
}

export default new MessageHandler();