import fs from 'fs/promises';
import path from 'path';

let dbLock = Promise.resolve();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { userId, friendId } = body;

    if (!userId || !friendId) {
        return { statusCode: 400, statusMessage: 'Brakujące ID' };
    }

    return new Promise((resolve) => {
        dbLock = dbLock.then(async () => {
            try {
                const userFriendsPath = path.join('./db/friends', `friends_${userId}.json`);
                let userFriends: string[] = [];
                try {
                    const userData = await fs.readFile(userFriendsPath, 'utf8');
                    userFriends = JSON.parse(userData);
                } catch (e) {}

                userFriends = userFriends.filter(id => id !== friendId);
                await fs.writeFile(userFriendsPath, JSON.stringify(userFriends, null, 2), 'utf8');

                const friendFriendsPath = path.join('./db/friends', `friends_${friendId}.json`);
                let friendFriends: string[] = [];
                try {
                    const friendData = await fs.readFile(friendFriendsPath, 'utf8');
                    friendFriends = JSON.parse(friendData);
                } catch (e) { }

                friendFriends = friendFriends.filter(id => id !== userId);
                await fs.writeFile(friendFriendsPath, JSON.stringify(friendFriends, null, 2), 'utf8');

                resolve({ statusCode: 200, message: 'Friend removed successfully' });
            } catch (error) {
                console.error('Błąd podczas usuwania znajomego:', error);
                resolve({ statusCode: 500, statusMessage: 'Błąd serwera' });
            }
        });
    });
});