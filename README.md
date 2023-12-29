Automated Gmail Vacation Responder

This project implements an automated Gmail vacation responder using Node.js and the Gmail API. The application is designed to run as a server and respond to incoming emails with a predefined vacation message, indicating that the recipient is currently away and will respond at the earliest convenience. The automation includes the creation of a custom label in Gmail, identification of unreplied emails in the inbox, and the sending of personalized vacation responses.

Key Features:

OAuth 2.0 Authentication:

The application uses OAuth 2.0 authentication to securely access the Gmail API, ensuring a secure and authorized connection.
Label Management:

The program dynamically manages Gmail labels, creating a custom label ("GenerateVacay-Mails") if it does not already exist.
Unreplied Emails Detection:

The system identifies unreplied emails within the inbox based on specific criteria such as excluding chats and emails from the user.
Labeling Unreplied Emails:

Unreplied emails are automatically labeled with the custom label ("GenerateVacay-Mails") to keep track of those that have been processed.
Vacation Response:

For each unreplied email, the application generates and sends a personalized vacation response. The response includes a polite acknowledgment of the email and a notice of the user's current unavailability.
Randomized Response Interval:

The system introduces a randomized interval between 45 and 120 seconds between each iteration, avoiding predictability and distributing the load on the Gmail API.
Error Handling:

Comprehensive error handling is implemented to manage potential issues during label creation, modification, and email response. Errors are logged for debugging and monitoring.
Server Setup:

The application is configured as an Express server, allowing it to be easily hosted and accessed via a specified endpoint ("/automate-gmail").
How to Use:

Install Dependencies:

Ensure Node.js is installed, then install dependencies using npm install.
Configure OAuth Credentials:

Obtain OAuth 2.0 credentials and save them as "credential.json" in the project directory.
Run the Application:

Start the server using npm start and access the automation endpoint at "http://localhost:4569/automate-gmail" to initiate the Gmail automation.
Monitor Logs:

View console logs for real-time updates on label creation, email processing, and any encountered errors.
Note:
Ensure that the Gmail API is enabled for your Google Cloud project and that the OAuth credentials are configured correctly for successful authentication.

This project is a useful tool for individuals seeking an automated solution to manage email responses during periods of unavailability, such as vacations or holidays.
