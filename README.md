
# Timetable Harmony Finder

A web application for finding common free time slots among students.

## Security Considerations

### API Key Security

This application uses the Google Gemini AI API for analyzing timetable data. For proper security in a production environment:

1. **NEVER expose API keys in client-side code** in production
2. **Implement a server-side proxy** to make API calls to Gemini
3. **Set up API key restrictions** in the Google Cloud Console:
   - Restrict the key to only your application's domain
   - Set appropriate quotas to prevent abuse
   - Enable request origin restrictions

### Current Implementation

The current implementation includes:
- A server-side proxy endpoint (`/api/generate-ai-insights`) that should be implemented
- A fallback client-side implementation with an exposed API key (for development/demo only)

### Production Recommendations

For a production deployment:
1. Implement the server-side proxy endpoint using:
   - Supabase Edge Functions
   - A serverless function (Vercel, Netlify, etc.)
   - A dedicated backend server
2. Store the API key as an environment variable on the server
3. Remove the fallback client-side implementation
4. Add rate limiting to the proxy endpoint

## Development

To run the application locally:

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.
