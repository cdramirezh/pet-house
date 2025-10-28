import whatsappService from './whatsappService.js';
import appendToSheet from './googleSheetsService.js';
import openAIService from './openAiService.js';

class MessageHandler {

  constructor() {
    this.appointmentState = {};
    this.assitantState = {};
  }

  isGreeting(message) {
    const greetings = ['hola', 'hello', "hi", "buenas tardes"];
    return greetings.includes(message);
  }

  isMediaRequest(message) {
    const mediaTypes = ['audio', 'image', 'video', 'document']
    return mediaTypes.includes(message);
  }

  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else if (this.isMediaRequest(incomingMessage)) {
        await this.sendMedia(message.from, incomingMessage);
      } else if (this.appointmentState[message.from]) {
        await this.handleAppointmentFlow(message.from, incomingMessage);
      } else if (this.assitantState[message.from]) {
        await this.handleAssistantFlow(message.from, incomingMessage);
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
          title: "Consultar"
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
        this.appointmentState[to] = { step: 'name' };
        response = 'Por favor ingresa tu nombre';
        break;
      case 'consultar':
        response = 'Consultar mi mascota con IA';
        this.assitantState[to] = { step: 'question' };
        break;
      case 'ver ubicación':
        response = 'Esta es nuestra ubicación: 📌 https://goo.gl/maps/example';
        break;
      default:
        response = 'Opción no reconocida. Por favor, elige una opción válida del menú.';
    }

    await whatsappService.sendMessage(to, response, null);
  }

  async sendMedia(to, mediaType) {
    const mediaOptions = {
      audio: {
        mediaUrl: 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac',
        caption: 'Bienvenida',
        type: 'audio',
      },

      image: {
        mediaUrl: 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png',
        caption: 'Esto es una Imagen!',
        type: 'image',
      },

      video: {
        mediaUrl: 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4',
        caption: '¡Esto es una video!',
        type: 'video',
      },

      document: {
        mediaUrl: 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf',
        caption: '¡Esto es un PDF!',
        type: 'document',
      }
    }

    const { mediaUrl, caption, type } = mediaOptions[mediaType];

    await whatsappService.sendMediaMessage(to, type, mediaUrl, caption);
  }

  async handleAppointmentFlow(to, message) {
    const state = this.appointmentState[to];
    let response;

    switch (state.step) {
      case 'name':
        state.name = message;
        state.step = 'petName';
        response = 'Gracias, ¿Cuál es el nombre de tu mascota?';
        break;
      case 'petName':
        state.petName = message;
        state.step = 'petType';
        response = '¿Qué tipo de mascota tienes? (perro, gato, etc.)';
        break;
      case 'petType':
        state.petType = message;
        state.step = 'reason';
        response = 'Cuál es el motivo de tu consulta?';
        break;
      case 'reason':
        state.reason = message;
        response = this.completeAppointment(to);
    }
    await whatsappService.sendMessage(to, response);
  }

  completeAppointment(to) {
    const appointment = this.appointmentState[to];
    delete this.appointmentState[to];

    const userData = [
      to,
      appointment.name,
      appointment.petName,
      appointment.petType,
      appointment.reason,
      new Date().toISOString(),
    ]

    appendToSheet(userData);
    return `Gracias. Resumen de tu cita:\nNombre: ${appointment.name}\nMascota: ${appointment.petName}\nTipo: ${appointment.petType}\nMotivo: ${appointment.reason}`;
  }

  async handleAssistantFlow(to, message) {
    const state = this.assitantState[to];
    let response;

    if (state.step === 'question') {
      response = await openAIService(message);
    }

    this.assitantState[to] = null;
    await whatsappService.sendMessage(to, response);
    const menuMessage = "Te sirvió la respuesta?"
    const buttons = [
      {
        type: "reply",
        reply: {
          id: "UNIQUE_BUTTON_ID_YES",
          title: "Sí",
        }
      },
      {
        type: "reply",
        reply: {
          id: "UNIQUE_BUTTON_ID_NEXT",
          title: "Hacer otra pregunta",
        }
      },
      {
        type: 'reply',
        reply: {
          id: "UNIQUE_BUTTON_ID_EMERGENCY",
          title: "Emergencia",
        }
      }

    ]
    await whatsappService.sendReplyButton(to, menuMessage, buttons);
  }
}

export default new MessageHandler();