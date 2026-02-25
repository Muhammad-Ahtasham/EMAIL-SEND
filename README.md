# Portfolio Email Sender Backend

A Node.js backend API for sending emails from your portfolio website contact form using NodeMailer and Gmail.

## Features

- ✅ Send emails to ahtashamahsan988@gmail.com
- ✅ Environment variable configuration
- ✅ Input validation and error handling
- ✅ CORS support for frontend integration
- ✅ Both text and HTML email formats
- ✅ Health check endpoint

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and add your Gmail credentials:

```env
# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=3000
```

**Important:** For Gmail, you need to use an App Password instead of your regular password:

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use this app password in the `.env` file

### 3. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### POST /api/send-email

Send an email from the portfolio contact form.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Portfolio Inquiry",
  "message": "Hello, I'm interested in your services..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully!",
  "messageId": "1234567890"
}
```

### GET /api/health

Check if the API is running.

**Response:**

```json
{
  "status": "ok",
  "message": "Portfolio Email API is running"
}
```

## Frontend Integration

Here's an example of how to integrate this with your frontend contact form:

```javascript
// Example fetch request from your frontend
const sendEmail = async (formData) => {
  try {
    const response = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      alert('Message sent successfully!');
    } else {
      alert('Failed to send message: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
};
```

## Error Handling

The API includes comprehensive error handling for:

- Missing required fields
- Invalid email format
- Email server connection issues
- Network errors

## Security Notes

- Always use environment variables for sensitive information
- Use Gmail App Passwords instead of regular passwords
- Consider adding rate limiting in production
- Implement CSRF protection if needed

## Troubleshooting

### Common Issues:

1. **"Invalid login credentials"**: Make sure you're using an App Password, not your regular Gmail password
2. **"Less secure app access"**: Enable 2-Factor Authentication and use App Passwords
3. **CORS errors**: The API includes CORS middleware, but you may need to configure it for your specific domain in production

### Testing the API:

You can test the API using curl:

```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'
```

## License

MIT License
