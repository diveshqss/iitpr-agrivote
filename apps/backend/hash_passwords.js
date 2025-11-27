// MongoDB script to hash all user passwords as "password"
// Run this in mongosh or MongoDB Compass

// Hash function (using bcrypt-like hash)
function hashPassword(password) {
  // This is a simple hash for demo purposes - in production use proper bcrypt
  return password; // For demo, we're just setting plain text - DON'T DO THIS IN PRODUCTION
}

// Connect to your database
use AgriVote;

// Update all users to have hashed "password"
db.users.updateMany(
  {}, // Update all documents
  [
    {
      $set: {
        hashed_password: hashPassword("password")
      }
    }
  ]
);

// Alternatively, if you want to use a proper bcrypt hash, run this Node.js script:

// const bcrypt = require('bcrypt');
// const { MongoClient } = require('mongodb');
//
// async function hashPasswords() {
//   const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
//   await client.connect();
//
//   const db = client.db('AgriVote');
//   const users = db.collection('users');
//
//   const userDocs = await users.find({}).toArray();
//
//   for (const user of userDocs) {
//     const hashedPassword = await bcrypt.hash('password', 10);
//     await users.updateOne(
//       { _id: user._id },
//       { $set: { hashed_password: hashedPassword } }
//     );
//     console.log(`Updated password for user: ${user.email}`);
//   }
//
//   await client.close();
// }
//
// hashPasswords();
