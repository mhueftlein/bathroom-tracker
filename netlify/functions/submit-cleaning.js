const { google } = require('googleapis');

const sheets = google.sheets('v4');

async function getSheets() {
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return sheets;
}

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    if (!process.env.GOOGLE_SHEETS_ID) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Google Sheets not configured' }),
        };
    }

    try {
        const data = JSON.parse(event.body);
        const { checklist_type, bathroom, initials, datetime, tasks } = data;

        // Validate required fields
        if (!checklist_type || !initials || !datetime || !tasks) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' }),
            };
        }

        // For bathroom checklists, bathroom is required
        if (checklist_type === 'bathroom' && !bathroom) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Bathroom type required for bathroom checklists' }),
            };
        }

        // Format the data for Google Sheets
        const timestamp = new Date(datetime).toLocaleString();
        const tasksString = tasks.join(', ');
        const bathroomValue = bathroom || '';

        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // Append data to Google Sheet
        // Columns: Timestamp (Date), Timestamp (Time), Checklist Type, Bathroom, Initials, Tasks
        await sheets.spreadsheets.values.append({
            auth,
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: 'Sheet1!A:F',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [timestamp.split(',')[0], timestamp.split(',')[1]?.trim() || '', checklist_type, bathroomValue, initials, tasksString],
                ],
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Record submitted' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to submit record', details: error.message }),
        };
    }
};
