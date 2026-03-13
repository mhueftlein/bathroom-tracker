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

        // Read data from Google Sheet (updated to 6 columns with new structure)
        const response = await sheets.spreadsheets.values.get({
            auth,
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: 'Sheet1!A:F',
        });

        const rows = response.data.values || [];
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Skip header row and format data
        const records = rows.slice(1).map(row => {
            const dateStr = row[0] || '';
            const timeStr = row[1] || '';
            const checklistType = row[2] || '';
            const bathroom = row[3] || '';
            const initials = row[4] || '';
            const tasksStr = row[5] || '';

            // Combine date and time into full datetime
            const datetime = `${dateStr} ${timeStr}`.trim();
            const recordDate = new Date(datetime);

            // Check if this record is within the last 7 days
            const isWithinSevenDays = recordDate >= sevenDaysAgo && recordDate <= now;

            const tasks = tasksStr ? tasksStr.split(',').map(t => t.trim()).filter(t => t) : [];

            return {
                datetime: datetime,
                checklistType: checklistType,
                bathroom: bathroom || null,
                initials: initials,
                tasks: tasks,
                isWithinSevenDays: isWithinSevenDays,
            };
        }).filter(record => record.initials); // Only include rows with initials

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
