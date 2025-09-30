// Server-side auth mock for Next.js pages/API routes
// This file can be imported in Server Components and API routes

export async function auth() {
  // Mock server-side auth - always return authenticated user for development
  // In a real implementation, you'd check cookies/sessions here
  return {
    userId: 'test-user-id',
    sessionId: 'mock-session-id'
  };
}

export async function currentUser() {
  // Mock current user function - always return a test user for development
  return {
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    username: 'testuser',
    imageUrl: 'https://example.com/avatar.jpg',
    primaryEmailAddress: { emailAddress: 'test@example.com' },
    emailAddresses: [
      {
        id: 'email_test',
        emailAddress: 'test@example.com',
        verification: { status: 'verified' }
      }
    ]
  };
}
