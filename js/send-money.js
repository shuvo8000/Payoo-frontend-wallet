
document.addEventListener("DOMContentLoaded",function(){
    const user=setupShell("send-money");
    if(!user)return;

    const form=document.getElementById("sendMoneyForm");
    const alertBox=document.getElementById("formAlert");
    const recipientInput=document.getElementById("recipient");
    const recipientStatus=document.getElementById("recipientStatus");
    const recipientAvatar=document.getElementById("recipientAvatar");
    const recipientName=document.getElementById("recipientName");
    const recipientMobile=document.getElementById("recipientMobile");
    const amountInput=document.getElementById("amount");
    const pinInput=document.getElementById("pin");
    const currentBalance=document.getElementById("currentBalance");
    const togglePin=document.getElementById("togglePin");

    let recipientUser=null;

    function renderBalance(){
        const currentUser=getCurrentUser();

        if(!currentUser||!currentBalance)return;
        currentBalance.textContent=money(currentUser.balance);
    }

    function clearRecipient(){
        recipientUser=null;

        if(recipientStatus){
            recipientStatus.classList.remove("active");
        }

        if(recipientName){
            recipientName.textContent="Recipient";
        }

        if(recipientMobile){
            recipientMobile.textContent="";
        }

        if(recipientAvatar){
            recipientAvatar.textContent="P";
        }
    }

    // Find recipient
    function findRecipient(){
        const mobile=normalizeMobile(recipientInput.value);
        clearRecipient();

        if(!mobile||!validMobile(mobile))return;

        const currentUser=getCurrentUser();

        if(currentUser&&mobile===currentUser.mobile){
            showAlert(
                alertBox,
                "You cannot send money to your own account."
            );
            return;
        }

        const foundUser=findUserByMobile(mobile);

        if(!foundUser){
            showAlert(
                alertBox,
                "No registered Payoo account found with this mobile number."
            );
            return;
        }

        recipientUser=foundUser;
        recipientName.textContent=foundUser.name;
        recipientMobile.textContent=foundUser.mobile;
        recipientAvatar.textContent=initials(foundUser.name);
        recipientStatus.classList.add("active");

        alertBox.innerHTML="";
        alertBox.style.display="none";
    }

    if(recipientInput){
        recipientInput.addEventListener("blur",findRecipient);

        recipientInput.addEventListener("input",function(){
            clearRecipient();

            if(alertBox){
                alertBox.innerHTML="";
                alertBox.style.display="none";
            }
        });
    }

    if(togglePin&&pinInput){
        togglePin.addEventListener("click",function(){
            if(pinInput.type==="password"){
                pinInput.type="text";
                togglePin.textContent="◌";
                togglePin.title="Hide PIN";
            }else{
                pinInput.type="password";
                togglePin.textContent="◉";
                togglePin.title="Show PIN";
            }
        });
    }

    // Send Money form
    form.addEventListener("submit",function(event){
        event.preventDefault();

        const currentUser=getCurrentUser();
        if(!currentUser)return;

        const recipientMobileValue=normalizeMobile(
            recipientInput.value
        );
        const amount=Number(amountInput.value);
        const pin=pinInput.value;

        if(!validMobile(recipientMobileValue)){
            showAlert(
                alertBox,
                "Enter a valid Bangladesh mobile number."
            );
            return;
        }

        if(recipientMobileValue===currentUser.mobile){
            showAlert(
                alertBox,
                "You cannot send money to your own account."
            );
            return;
        }

        recipientUser=findUserByMobile(recipientMobileValue);

        if(!recipientUser){
            showAlert(
                alertBox,
                "No registered Payoo account found with this mobile number."
            );
            return;
        }

        if(!validAmount(
            amount,
            LIMITS.sendMin,
            LIMITS.sendMax
        )){
            showAlert(
                alertBox,
                "Amount must be between "+
                money(LIMITS.sendMin)+" and "+
                money(LIMITS.sendMax)+"."
            );
            return;
        }

        if(Number(currentUser.balance)<amount){
            showAlert(
                alertBox,
                "Insufficient balance. Your available balance is "+
                money(currentUser.balance)+"."
            );
            return;
        }

        if(!verifyPin(currentUser,pin)){
            showAlert(alertBox,"Incorrect Payoo PIN.");
            return;
        }

        const senderBalance=updateBalance(
            currentUser.mobile,
            -amount
        );

        if(!senderBalance){
            showAlert(
                alertBox,
                "Unable to update sender balance."
            );
            return;
        }

        const receiverBalance=updateBalance(
            recipientUser.mobile,
            amount
        );

        if(!receiverBalance){
            updateBalance(currentUser.mobile,amount);

            showAlert(
                alertBox,
                "Unable to update recipient balance."
            );
            return;
        }

        addTransaction({
            type:"send_money",
            sender:currentUser.mobile,
            senderName:currentUser.name,
            recipient:recipientUser.mobile,
            recipientName:recipientUser.name,
            amount:amount,
            fee:0,
            balanceAfter:senderBalance.balance
        });

        addTransaction({
            type:"received_money",
            sender:currentUser.mobile,
            senderName:currentUser.name,
            recipient:recipientUser.mobile,
            recipientName:recipientUser.name,
            amount:amount,
            fee:0,
            balanceAfter:receiverBalance.balance
        });

        const sentToName=recipientUser.name;

        form.reset();
        clearRecipient();
        renderBalance();

        alertBox.innerHTML=
            "✓ "+money(amount)+
            " sent successfully to "+
            sentToName+".";

        alertBox.style.display="block";
        alertBox.style.marginBottom="18px";
        alertBox.style.padding="12px 14px";
        alertBox.style.border="1px solid #bfe8d1";
        alertBox.style.borderRadius="10px";
        alertBox.style.background="#effaf4";
        alertBox.style.color="#16834f";
        alertBox.style.fontSize="13px";
        alertBox.style.fontWeight="600";
    });

    amountInput.value="";
    pinInput.value="";
    clearRecipient();
    renderBalance();
});