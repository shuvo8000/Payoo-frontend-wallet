// Payoo localStorage keys
const PAYOO_KEYS={
    users:"payoo_users",
    current:"payoo_current_user",
    transactions:"payoo_transactions"
};

// Transaction and wallet limits
const LIMITS={
    sendMin:10,
    sendMax:50000,
    addMoneyMin:50,
    addMoneyMax:100000,
    cashOutMin:50,
    cashOutMax:50000,
    rechargeMin:20,
    rechargeMax:10000,
    billMin:20,
    billMax:100000,
    cashOutFee:10
};

// Read data from localStorage
function readJSON(key,fallback){
    const data=localStorage.getItem(key);

    if(!data)return fallback;

    try{
        return JSON.parse(data);
    }catch(error){
        return fallback;
    }
}

// Save data to localStorage
function saveJSON(key,value){
    localStorage.setItem(key,JSON.stringify(value));
}

function getUsers(){
    return readJSON(PAYOO_KEYS.users,[]);
}

function saveUsers(users){
    saveJSON(PAYOO_KEYS.users,users);
}

function getTransactions(){
    return readJSON(PAYOO_KEYS.transactions,[]);
}

function saveTransactions(transactions){
    saveJSON(PAYOO_KEYS.transactions,transactions);
}

function getCurrentMobile(){
    return localStorage.getItem(PAYOO_KEYS.current);
}

function setCurrentMobile(mobile){
    localStorage.setItem(PAYOO_KEYS.current,mobile);
}

function clearCurrentMobile(){
    localStorage.removeItem(PAYOO_KEYS.current);
}

function getCurrentUser(){
    const mobile=getCurrentMobile();
    const users=getUsers();

    if(!mobile)return null;

    for(let i=0;i<users.length;i++){
        if(users[i].mobile===mobile)return users[i];
    }

    return null;
}

function findUserByMobile(mobile){
    const number=normalizeMobile(mobile);
    const users=getUsers();

    for(let i=0;i<users.length;i++){
        if(users[i].mobile===number)return users[i];
    }

    return null;
}

function updateUser(updatedUser){
    const users=getUsers();

    for(let i=0;i<users.length;i++){
        if(users[i].mobile===updatedUser.mobile){
            users[i]=updatedUser;
            saveUsers(users);
            return updatedUser;
        }
    }

    return updatedUser;
}

function updateBalance(mobile,amount){
    const user=findUserByMobile(mobile);

    if(!user)return null;

    const oldBalance=Number(user.balance||0);
    const newBalance=oldBalance+Number(amount);

    user.balance=Number(newBalance.toFixed(2));
    updateUser(user);

    return user;
}

function generateTransactionId(){
    const time=Date.now();
    const random=Math.floor(Math.random()*10000);

    return "TXN"+time+random;
}

function addTransaction(data){
    const transactions=getTransactions();

    const transaction={
        id:generateTransactionId(),
        status:"success",
        date:getCurrentDate(),
        time:getCurrentTime()
    };

    for(const key in data){
        transaction[key]=data[key];
    }

    transactions.unshift(transaction);
    saveTransactions(transactions);

    return transaction;
}

function getCurrentDate(){
    const date=new Date();
    const year=date.getFullYear();
    const month=String(date.getMonth()+1).padStart(2,"0");
    const day=String(date.getDate()).padStart(2,"0");

    return year+"-"+month+"-"+day;
}

function getCurrentTime(){
    const date=new Date();

    return date.toLocaleTimeString("en-BD",{
        hour:"2-digit",
        minute:"2-digit"
    });
}

function getUserTransactions(mobile){
    const currentMobile=normalizeMobile(mobile);
    const transactions=getTransactions();
    const userTransactions=[];

    for(let i=0;i<transactions.length;i++){
        const transaction=transactions[i];
        const sender=normalizeMobile(transaction.sender||"");
        const recipient=normalizeMobile(transaction.recipient||"");
        const account=normalizeMobile(transaction.account||"");

        if(transaction.type==="send_money"){
            if(sender===currentMobile){
                userTransactions.push(transaction);
            }
        }else if(transaction.type==="received_money"){
            if(recipient===currentMobile){
                userTransactions.push(transaction);
            }
        }else if(
            transaction.type==="add_money"||
            transaction.type==="cash_out"||
            transaction.type==="mobile_recharge"||
            transaction.type==="bill_payment"
        ){
            if(account===currentMobile){
                userTransactions.push(transaction);
            }
        }
    }

    return userTransactions;
}

// Format amount as Bangladeshi currency
function formatCurrency(amount){
    const number=Number(amount||0);

    return "৳"+number.toLocaleString("en-BD",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    });
}

function normalizeMobile(value){
    let mobile=String(value||"");

    mobile=mobile.replace(/\s|-/g,"");

    if(mobile.startsWith("+880")){
        mobile="0"+mobile.slice(4);
    }else if(mobile.startsWith("880")){
        mobile="0"+mobile.slice(3);
    }

    return mobile;
}

function validMobile(value){
    const mobile=normalizeMobile(value);

    return /^01[3-9]\d{8}$/.test(mobile);
}

function validPin(pin){
    const value=String(pin||"");

    return /^\d{4,6}$/.test(value);
}

function validAmount(value,min,max){
    const number=Number(value);

    if(!Number.isFinite(number))return false;
    if(number<min||number>max)return false;

    return true;
}

function verifyPin(user,pin){
    if(!user)return false;

    return String(user.pin)===String(pin);
}