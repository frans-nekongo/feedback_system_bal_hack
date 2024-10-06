// utils/auth.js
const users = [
    { username: 'demo', password: 'demo', role: 'student' },
    { username: 'admin', password: 'admin', role: 'admin' },
];

export function authenticate(username, password) {
    const user = users.find(
        (user) => user.username === username && user.password === password
    );
    return user ? user.role : null; // Return the role if authenticated, otherwise null
}
