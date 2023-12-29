const express = require("express");
const app = express();
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const fs = require("fs").promises;
const { google } = require("googleapis");
const PORT = 4569;
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];

const labelName = "GenerateVacay-Mails";

app.get("/automate-gmail", async (req, res) => {
  try {
    // Oauth.2.0 authentication implementation:
    const auth = await authenticate({
      keyfilePath: path.join(__dirname, "credential.json"),
      scopes: SCOPES,
    });
    // getting authorized mail:
    const gmail = google.gmail({ version: "v1", auth });
    // available labels on the gmail:
    const response = await gmail.users.labels.list({
      userId: "me",
    });

    // to get unreplied mails from gmail:
    const gettingUnrepliedMessages = async (auth) => {
      console.log("Function getUnrepliedMessages has been called.");

      try {
        const gmail = google.gmail({ version: "v1", auth });

        const response = await gmail.users.messages.list({
          userId: "me",
          labelIds: ["INBOX"],
          q: "-in:chats -from:me -has:userlabels",
        });

        return response.data.messages || [];
      } catch (error) {
        console.error("Error in getUnrepliedMessages:", error);
        throw error; // Re-throw the error for the calling function to handle
      }
    };
    // for adding label:

    const modifyMessageLabels = async (auth, messageId, labelIdToAdd) => {
      console.log("Function modifyMessageLabels has been called.");

      const gmail = google.gmail({ version: "v1", auth });

      try {
        await gmail.users.messages.modify({
          userId: "me",
          id: messageId,
          requestBody: {
            addLabelIds: [labelIdToAdd],
            removeLabelIds: ["INBOX"],
          },
        });

        console.log(`Labels modified for message with id ${messageId}`);
        return { error: null };
      } catch (error) {
        console.error("Error in modifyMessageLabels:", error);
        return { error };
      }
    };
    // for creating label:

    const createOrUpdateLabel = async (auth) => {
      console.log("Function createOrUpdateLabel has been called.");

      const gmail = google.gmail({ version: "v1", auth });

      try {
        const response = await gmail.users.labels.create({
          userId: "me",
          requestBody: {
            name: labelName,
            labelListVisibility: "labelShow",
            messageListVisibility: "show",
          },
        });

        console.log(`Label "${labelName}" created with id ${response.data.id}`);
        return { error: null, labelId: response.data.id };
      } catch (error) {
        if (error.code === 409) {
          const response = await gmail.users.labels.list({
            userId: "me",
          });

          const existingLabel = response.data.labels.find(
            (label) => label.name === labelName
          );

          if (existingLabel) {
            console.log(
              `Label "${labelName}" already exists with id ${existingLabel.id}`
            );
            return { error: null, labelId: existingLabel.id };
          }
        }

        console.error("Error in createOrUpdateLabel:", error);
        return { error };
      }
    };
    // for sending replies:
    const sendReply = async (auth, message) => {
      console.log("function sendReply got hitted  ");

      const gmail = google.gmail({ version: "v1", auth });
      const res = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "metadata",
        metadataHeaders: ["Subject", "From"],
      });
      const subject = res.data.payload.headers.find(
        (header) => header.name === "Subject"
      ).value;
      const from = res.data.payload.headers.find(
        (header) => header.name === "From"
      ).value;
      const matchResult = from.match(/<(.*)>/);

      const replyTo = matchResult ? matchResult[1] : from; // Check if match was successful

      const replySubject = subject.startsWith("Re:")
        ? subject
        : `Re: ${subject}`;
      const replyBody = `Hello,\n\nThank you for your email. I'm currently out of the office on vacation and will attend to your message as soon as possible.\n\nBest regards,\nVaishnavi Rangoju`;

      const rawMessage = [
        `From: me`,
        `To: ${replyTo}`,
        `Subject: ${replySubject}`,
        `In-Reply-To: ${message.id}`,
        `References: ${message.id}`,
        "",
        replyBody,
      ].join("\n");
      const encodedMessage = Buffer.from(rawMessage)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });
      console.log(`Reply sent for message with id ${message.id}`);
      return { error: null };
    };

    const main = async () => {
      console.log("Function main has been called.");

      try {
        const labelId = await createOrUpdateLabel(auth, labelName);
        console.log(
          `Label has been created or already exists with id ${labelId}`
        );

        setInterval(async () => {
          const messages = await gettingUnrepliedMessages(auth);
          console.log(`Found ${messages.length} unreplied messages`);

          for (const message of messages) {
            await sendReply(auth, message);
            console.log(`Sent reply to message with id ${message.id}`);

            const messageId = message.id;
            await modifyMessageLabels(auth, messageId, labelId, "INBOX");
            console.log(`Added label to message with id ${message.id}`);
          }
        }, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000); // Random interval between 45 and 120 seconds
      } catch (error) {
        console.error("Error in main:", error);
      }
    };

    await main();
    res.status(200).send("Gmail automation started successfully.");
  } catch (error) {
    console.error("Error in Gmail automation:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the Express app
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
