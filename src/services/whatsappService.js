import axios from 'axios';
import config from '../config/env.js';
import { sendToWhatsapp } from './sendToWhatsappService.js';

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      text: { body },
      ...[
        messageId ? {
          context: {
            message_id: messageId,
          }
        } : {}]
      ,
    }
    await sendToWhatsapp(data);
  }

  async markAsRead(messageId) {
    const data = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }
    await sendToWhatsapp(data);
  }

  async sendReplyButton(recipientPhoneNumber, bodyText, buttons) {
    const data = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhoneNumber,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: bodyText
        },
        action: {
          buttons: buttons
        }
      }
    }
    await sendToWhatsapp(data);
  }

  async sendMediaMessage(to, type, mediaUrl, caption) {
    const data = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: type,
      ...mediaObject,
    }
    try {
      const mediaObject = {};
      switch (type) {
        case 'image':
          mediaObject.image = { link: mediaUrl, caption: caption }
          break;
        case 'video':
          mediaObject.video = { link: mediaUrl }
          break;
        case 'document':
          mediaObject.document = { link: mediaUrl, caption: caption, filename: 'pet-house.pdf' }
          break;
        case 'audio':
          mediaObject.audio = { link: mediaUrl }
          break;
        default:
          throw new Error('Unsupported media type');
      }

      await sendToWhatsapp(data);

    } catch (error) {
      console.error('Error al enviar mensaje multimedia: ', error);
    }


  }

  async sendContactMessage(to, contact) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "contacts",
      contacts: [contact],
      // messages: [
      //   {
      //     id: "wamid.gBGGSFcCNEOPAgkO_KJ55r4w_ww"
      //   }
      // ]
    }
    await sendToWhatsapp(data);
  }

  async sendLocationMessage(to, latitude, longitude, name, address) {
    const data = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "location",
      location: {
        latitude: latitude,
        longitude: longitude,
        name: name,
        address: address,
      }
    }
    await sendToWhatsapp(data);
  }

}

export default new WhatsAppService();