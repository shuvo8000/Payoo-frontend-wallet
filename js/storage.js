// Payoo localStorage keys
const PAYOO_KEYS = {
    users: "payoo_users",
    current: "payoo_current_user",
    transactions: "payoo_transactions"
};

// Transaction and wallet limits
const LIMITS = {
    sendMin: 10,
    sendMax: 50000,
    addMoneyMin: 50,
    addMoneyMax: 100000,
    cashOutMin: 50,
    cashOutMax: 50000,
    rechargeMin: 20,
    rechargeMax: 10000,
    billMin: 20,
    billMax: 100000,
    cashOutFee: 10
};

// Read data from localStorage
function readJSON(key, fallback) {
    const data = localStorage.getItem(key);

    if (!data) {
        return fallback;
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        return fallback;
    }
}

// Save data to localStorage
function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Get all users
function getUsers() {
    return readJSON(PAYOO_KEYS.users, []);
}

// Save all users
function saveUsers(users) {
    saveJSON(PAYOO_KEYS.users, users);
}

// Get all transactions
function getTransactions() {
    return readJSON(PAYOO_KEYS.transactions, []);
}

// Save all transactions
function saveTransactions(transactions) {
    saveJSON(PAYOO_KEYS.transactions, transactions);
}

// Get logged-in user's mobile number
function getCurrentMobile() {
    return localStorage.getItem(PAYOO_KEYS.current);
}

// Set logged-in user's mobile number
function setCurrentMobile(mobile) {
    localStorage.setItem(PAYOO_KEYS.current, mobile);
}

// Logout current user
function clearCurrentMobile() {
    localStorage.removeItem(PAYOO_KEYS.current);
}

// Get currently logged-in user
function getCurrentUser() {
    const mobile = getCurrentMobile();
    const users = getUsers();

    if (!mobile) {
        return null;
    }

    for (let i = 0; i < users.length; i++) {
        if (users[i].mobile === mobile) {
            return users[i];
        }
    }

    return null;
}

// Find a user by mobile number
function findUserByMobile(mobile) {
    const number = normalizeMobile(mobile);
    const users = getUsers();

    for (let i = 0; i < users.length; i++) {
        if (users[i].mobile === number) {
            return users[i];
        }
    }

    return null;
}

// Update user information
function updateUser(updatedUser) {
    const users = getUsers();

    for (let i = 0; i < users.length; i++) {
        if (users[i].mobile === updatedUser.mobile) {
            users[i] = updatedUser;
            saveUsers(users);
            return updatedUser;
        }
    }

    return updatedUser;
}

// Update wallet balance
function updateBalance(mobile, amount) {
    const user = findUserByMobile(mobile);

    if (!user) {
        return null;
    }

    const oldBalance = Number(user.balance || 0);
    const newBalance = oldBalance + Number(amount);

    user.balance = Number(newBalance.toFixed(2));

    updateUser(user);

    return user;
}

// Create a unique transaction ID
function generateTransactionId() {
    const time = Date.now();
    const random = Math.floor(Math.random() * 10000);

    return "TXN" + time + random;
}

// Add a new transaction
function addTransaction(data) {
    const transactions = getTransactions();

    const transaction = {
        id: generateTransactionId(),
        status: "success",
        date: getCurrentDate(),
        time: getCurrentTime()
    };

    // Add transaction information
    for (const key in data) {
        transaction[key] = data[key];
    }

    // Put newest transaction first
    transactions.unshift(transaction);

    saveTransactions(transactions);

    return transaction;
}

// Get current date
function getCurrentDate() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

// Get current time
function getCurrentTime() {
    const date = new Date();

    return date.toLocaleTimeString("en-BD", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Get transactions of a specific user
function getUserTransactions(mobile) {
    const currentMobile = normalizeMobile(mobile);
    const transactions = getTransactions();
    const userTransactions = [];

    for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];

        const sender = normalizeMobile(transaction.sender || "");
        const recipient = normalizeMobile(transaction.recipient || "");
        const account = normalizeMobile(transaction.account || "");

        // Sent money
        if (transaction.type === "send_money") {
            if (sender === currentMobile) {
                userTransactions.push(transaction);
            }
        }

        // Received money
        else if (transaction.type === "received_money") {
            if (recipient === currentMobile) {
                userTransactions.push(transaction);
            }
        }

        // Other wallet transactions
        else if (
            transaction.type === "add_money" ||
            transaction.type === "cash_out" ||
            transaction.type === "mobile_recharge" ||
            transaction.type === "bill_payment"
        ) {
            if (account === currentMobile) {
                userTransactions.push(transaction);
            }
        }
    }

    return userTransactions;
}

// Format amount as Bangladeshi currency
function formatCurrency(amount) {
    const number = Number(amount || 0);

    return "৳" + number.toLocaleString("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Convert different mobile formats to one format
function normalizeMobile(value) {
    let mobile = String(value || "");

    // Remove spaces and hyphens
    mobile = mobile.replace(/\s|-/g, "");

    // Convert +8801712345678 to 01712345678
    if (mobile.startsWith("+880")) {
        mobile = "0" + mobile.slice(4);
    }

    // Convert 8801712345678 to 01712345678
    else if (mobile.startsWith("880")) {
        mobile = "0" + mobile.slice(3);
    }

    return mobile;
}

// Check Bangladesh mobile number
function validMobile(value) {
    const mobile = normalizeMobile(value);

    return /^01[3-9]\d{8}$/.test(mobile);
}

// Check PIN
function validPin(pin) {
    const value = String(pin || "");

    return /^\d{4,6}$/.test(value);
}

// Check amount
function validAmount(value, min, max) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return false;
    }

    if (number < min || number > max) {
        return false;
    }

    return true;
}

// Check user's PIN
function verifyPin(user, pin) {
    if (!user) {
        return false;
    }

    return String(user.pin) === String(pin);
}