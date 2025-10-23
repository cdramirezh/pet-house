import path from 'path';
import { google } from 'googleapis';
import config from '../config/env.js';

const sheets = google.sheets('v4');

async function addRowToSheet({ auth, spreadsheetId, range, values }) {
    const request = {
        spreadsheetId,
        range: range || 'reservas',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [values],
        },
        auth,
    }

    try {
        const response = await sheets.spreadsheets.values.append(request);
        return response.data;
    } catch (error) {
        console.error('Error añadiendo fila a la hoja:', error)
    }
}

const appendToSheet = async (data) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'credentials', config.CREDENTIAL),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        })
        const authClient = await auth.getClient();
        const spreadsheetId = config.SPREADSHEET_ID;

        await addRowToSheet({ auth: authClient, spreadsheetId, values: data })
        return 'Datos correctamente agregados';
    } catch (error) {
        console.error('Error en appendToSheet:', error);
    }
}

export default appendToSheet;