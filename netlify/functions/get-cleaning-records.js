const { google } = require('googleapis');

const sheets = google.sheets('v4');

exports.handler = async (event, context) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
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
        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        // Read data from Google Sheet
        const response = await sheets.spreadsheets.values.get({
            auth,
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: 'Sheet1!A:E',
        });

        const rows = response.data.values || [];

        // Skip header row and format data
        const records = rows.slice(1).map(row => ({
            datetime: row[0] || '',
            bathroom: row[2] || '',
            initials: row[3] || '',
            tasks: row[4] ? row[4].split(',').map(t => t.trim()).filter(t => t) : [],
        })).filter(record => record.initials); // Only include rows with initials

        return {
            statusCode: 200,
            body: JSON.stringify(records),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve records', details: error.message }),
        };
    }
};
