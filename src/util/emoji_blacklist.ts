import { Database } from 'sqlite3';
import { resolvePathFromSource } from './resolve_path';

const db = new Database(resolvePathFromSource('../db/emperor.sqlite'));

export enum SqliteBoolean {
  FALSE = 0,
  TRUE = 1,
}

export async function isInEmojiBlacklist(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    const stmt = db.prepare(
      'SELECT EXISTS(SELECT 1 FROM users WHERE user_id=? AND emoji_blacklisted=TRUE)'
    );

    stmt.get([id], (_, row) => {
      resolve(Boolean(Object.values(row)[0]));
    });
  });
}

export async function addToEmojiBlacklist(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const stmt =
      db.prepare(`INSERT INTO users(user_id, emoji_blacklisted) VALUES(?, TRUE)
    ON CONFLICT(user_id) DO UPDATE SET emoji_blacklisted = TRUE`);

    stmt.run([id], (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function removeFromEmojiBlacklist(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const stmt =
      db.prepare(`INSERT INTO users(user_id, emoji_blacklisted) VALUES(?, FALSE)
    ON CONFLICT(user_id) DO UPDATE SET emoji_blacklisted = FALSE`);

    stmt.run([id], (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
