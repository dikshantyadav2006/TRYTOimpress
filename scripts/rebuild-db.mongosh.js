// Rebuild site data for the expanded 18-chapter flow.
// Usage: mongosh "mongodb://127.0.0.1:27017/proposal" rebuild-db.mongosh.js
//
// - Deletes the pages collection so the 19-page template is re-seeded per owner
//   (on API boot via migrateOnBoot, or on next registration via seedSite).
// - Deletes the 7 smaller content collections so they are re-added for every
//   NEW registration (seedSite seeds starter content per ownerId; existing
//   users are not backfilled).
// - Updates the stored landing footer to match the new chapter count.
//
// After running: restart the API (server.ts calls migrateOnBoot on boot).

db.pages.deleteMany({});
db.notes.deleteMany({});
db.compliments.deleteMany({});
db.wishes.deleteMany({});
db.promises.deleteMany({});
db.dreams.deleteMany({});
db.capsules.deleteMany({});
db.surprises.deleteMany({});

db.sitesettings.updateMany(
  {},
  { $set: { "landing.footer": "one little journey · eighteen little chapters" } },
);

print("Done. Restart the API so migrateOnBoot can rebuild the pages.");
