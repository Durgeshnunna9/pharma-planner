const admin = require("firebase-admin");
const serviceAccount = require("./");
const data = require("./sansan_firestore_data.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadData() {
  const batch = db.batch();
  const collectionRef = db.collection("products");

  data.forEach((item, index) => {
    const docRef = collectionRef.doc(); // Auto-generated doc ID
    batch.set(docRef, item);
  });

  await batch.commit();
  console.log("✅ Upload successful");
}

uploadData().catch(console.error);
