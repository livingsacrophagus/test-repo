const path = require('path');
const sqlite = require('sqlite-async');

let appDatabase;

const setupDatabase = async() => {
    appDatabase = await sqlite.open(path.join(__dirname, 'ctf-challenge.db'));
    await appDatabase.exec(`
        DROP TABLE IF EXISTS tweets;

        CREATE TABLE IF NOT EXISTS tweets (
            tweetID         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            tweeterID       VARCHAR(255) NOT NULL,
            tweet           TEXT NOT NULL
        );
    
        DROP TABLE IF EXISTS secrets;
        CREATE TABLE IF NOT EXISTS secrets (
            id         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            flag       VARCHAR(255) NOT NULL UNIQUE
        );
        INSERT INTO secrets (flag) VALUES ('CTF{f4k3_fl4g_f0r_t3st1ng!}');
    `);
}

const insertTweet = async(tweeterID, tweet) => {
    return new Promise(async(resolve, reject) => {
        try {
            // TODO: Migrate to prepared statements and rollout to production
            let prepared = await appDatabase.prepare(`INSERT INTO tweets (tweeterID, tweet) VALUES (?, '${tweet}')`);
            await prepared.run(tweeterID);

            prepared = await appDatabase.prepare('SELECT * FROM tweets WHERE tweeterID = ? ORDER BY tweetID DESC');
            resolve(await prepared.get(tweeterID));
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { setupDatabase, insertTweet }