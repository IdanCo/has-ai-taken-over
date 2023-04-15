import * as functions from "firebase-functions";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const addNumbers = functions.https.onCall((data, context) => {
  const { number1, number2 } = data;

  if (typeof number1 !== 'number' || typeof number2 !== 'number') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Both number1 and number2 must be numbers.'
    );
  }

  return {
    result: number1 + number2,
  };
});
