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

            // Parse date and time more carefully
            // dateStr format: "3/13/2026" timeStr format: "2:30:45 PM"
            let recordDate = null;
            try {
                // Try parsing US format: M/D/YYYY H:MM:SS AM/PM
                const dateTimeStr = `${dateStr} ${timeStr}`.trim();
                recordDate = new Date(dateTimeStr);
                
                // If parsing failed or gives invalid date, try alternative parsing
                if (isNaN(recordDate.getTime())) {
                    // Manual parsing for M/D/YYYY format
                    const dateParts = dateStr.split('/');
                    const timeParts = timeStr.match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i);
                    
                    if (dateParts.length === 3 && timeParts) {
                        let month = parseInt(dateParts[0]) - 1; // JS months are 0-indexed
                        let day = parseInt(dateParts[1]);
                        let year = parseInt(dateParts[2]);
                        let hours = parseInt(timeParts[1]);
                        let minutes = parseInt(timeParts[2]);
                        let seconds = parseInt(timeParts[3]) || 0;
                        let period = timeParts[4].toUpperCase();
                        
                        // Convert to 24-hour format
                        if (period === 'PM' && hours !== 12) {
                            hours += 12;
                        } else if (period === 'AM' && hours === 12) {
                            hours = 0;
                        }
                        
                        recordDate = new Date(year, month, day, hours, minutes, seconds);
                    }
                }
            } catch (e) {
                recordDate = new Date(0); // Fallback to epoch if parsing fails
            }

            // Check if this record is within the last 7 days
            // Only mark as within 7 days if it's a valid date and actually recent
            const isWithinSevenDays = recordDate && 
                                     !isNaN(recordDate.getTime()) &&
                                     recordDate >= sevenDaysAgo && 
                                     recordDate <= now;

            const tasks = tasksStr ? tasksStr.split(',').map(t => t.trim()).filter(t => t) : [];

            return {
                datetime: `${dateStr} ${timeStr}`.trim(),
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
