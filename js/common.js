// Check if user is logged in
function requireAuth(){
    const user=getCurrentUser();

    if(!user){
        location.href="index.html";
        return null;
    }

    return user;
}

// Redirect logged-in user
function redirectIfLoggedIn(){
    const user=getCurrentUser();

    if(user){
        location.href="dashboard.html";
    }
}

// Logout user
function logout(){
    clearCurrentMobile();
    location.href="index.html";
}

// Get user initials
function initials(name){
    const words=String(name||"P").trim().split(/\s+/);
    let result="";

    for(let i=0;i<words.length&&i<2;i++){
        result+=words[i].charAt(0);
    }

    return result.toUpperCase();
}

function getProfilePhoto(mobile){
    if(!mobile)return null;

    const number=normalizeMobile(mobile);
    return localStorage.getItem("payoo_profile_photo_"+number);
}

function renderAvatar(element,user){
    if(!element||!user)return;

    const photo=getProfilePhoto(user.mobile);

    if(photo){
        element.innerHTML="";

        const image=document.createElement("img");
        image.src=photo;
        image.alt="Profile";
        element.appendChild(image);
    }else{
        element.textContent=initials(user.name);
    }
}

// Show small message
function showToast(message){
    const oldToast=document.querySelector(".toast");

    if(oldToast)oldToast.remove();

    const toast=document.createElement("div");
    toast.className="toast";
    toast.textContent=message;

    document.body.appendChild(toast);

    setTimeout(function(){
        toast.remove();
    },2800);
}

function showAlert(container,message,type){
    if(!container)return;
    if(!type)type="error";

    container.innerHTML=
        '<div class="alert alert-'+type+'">'+
        escapeHTML(message)+
        "</div>";
}

function escapeHTML(value){
    const text=String(value||"");

    return text
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

// Setup common page elements
function setupShell(activePage){
    const user=requireAuth();

    if(!user)return null;

    const nameElements=document.querySelectorAll("[data-user-name]");

    for(let i=0;i<nameElements.length;i++){
        nameElements[i].textContent=user.name||"";
    }

    const mobileElements=document.querySelectorAll("[data-user-mobile]");

    for(let i=0;i<mobileElements.length;i++){
        mobileElements[i].textContent=user.mobile||"";
    }

    const avatarElements=document.querySelectorAll("[data-avatar]");

    for(let i=0;i<avatarElements.length;i++){
        renderAvatar(avatarElements[i],user);
    }

    const navLinks=document.querySelectorAll("[data-nav]");

    for(let i=0;i<navLinks.length;i++){
        if(navLinks[i].dataset.nav===activePage){
            navLinks[i].classList.add("active");
        }
    }

    const logoutButtons=document.querySelectorAll("[data-logout]");

    for(let i=0;i<logoutButtons.length;i++){
        logoutButtons[i].addEventListener("click",logout);
    }

    return user;
}

function money(value){
    return formatCurrency(value);
}

function transactionTypeLabel(type){
    if(type==="add_money")return "Add Money";
    if(type==="send_money")return "Send Money";
    if(type==="received_money")return "Received Money";
    if(type==="cash_out")return "Cash Out";
    if(type==="mobile_recharge")return "Mobile Recharge";
    if(type==="bill_payment")return "Bill Payment";

    return type;
}

// Create transaction row
function renderTransactionRow(transaction,currentMobile){
    const current=normalizeMobile(currentMobile);
    const recipient=normalizeMobile(transaction.recipient||"");

    let incoming=false;

    if(transaction.type==="add_money")incoming=true;

    if(
        transaction.type==="received_money"&&
        recipient===current
    ){
        incoming=true;
    }

    let sign="-";
    let amountClass="amount-negative";

    if(incoming){
        sign="+";
        amountClass="amount-positive";
    }

    let party="Wallet";

    if(transaction.type==="send_money"){
        party="To "+(
            transaction.recipientName||
            transaction.recipient||"-"
        );
    }else if(transaction.type==="received_money"){
        party="From "+(
            transaction.senderName||
            transaction.sender||"-"
        );
    }else if(transaction.type==="add_money"){
        party=
            transaction.bankName||
            transaction.provider||
            transaction.method||
            "Wallet";
    }else if(transaction.type==="cash_out"){
        party="Agent "+(
            transaction.account||
            transaction.recipient||"-"
        );
    }else if(transaction.type==="mobile_recharge"){
        party=transaction.mobile||"-";
    }else if(transaction.type==="bill_payment"){
        party=transaction.billNumber||"-";
    }

    return `
        <tr>
            <td>
                <a href="transaction-details.html?id=${encodeURIComponent(transaction.id)}">
                    <strong>${escapeHTML(transaction.id)}</strong>
                </a>
            </td>
            <td>${escapeHTML(transactionTypeLabel(transaction.type))}</td>
            <td class="${amountClass}">
                ${sign}${money(transaction.amount)}
            </td>
            <td>${escapeHTML(party)}</td>
            <td>
                ${escapeHTML(transaction.date||"-")}
                ${escapeHTML(transaction.time||"")}
            </td>
            <td>
                <span class="badge badge-success">
                    ${escapeHTML(transaction.status||"success")}
                </span>
            </td>
        </tr>
    `;
}

function copyText(text){
    if(!navigator.clipboard){
        showToast("Copy is not supported by this browser.");
        return;
    }

    navigator.clipboard.writeText(text)
        .then(function(){
            showToast("Account number copied");
        })
        .catch(function(){
            showToast("Unable to copy account number.");
        });
}