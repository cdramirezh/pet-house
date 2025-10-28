import axios from "axios"
import config from "../config/env.js"

export const sendToWhatsapp = async (data) => {
    try {
        const response = await axios({
            method: 'POST',
            url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
            headers: {
                Authorization: `Bearer ${config.API_TOKEN}`,
            },
            data: data,
        })
        return response.data;
    } catch (error) {
        console.error(error);
    }

}