
document.addEventListener("DOMContentLoaded",function(){
    const user=setupShell("mobile-recharge");
    if(!user)return;

    const form=document.getElementById("rechargeForm");
    const alertBox=document.getElementById("formAlert");
    const mobileInput=form.mobile;
    const operatorInput=form.operator;
    const rechargeTypeInput=form.rechargeType;
    const amountInput=form.amount;
    const pinInput=form.pin;
    const togglePin=document.getElementById("togglePin");

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

    // Mobile Recharge form
    form.addEventListener("submit",function(event){
        event.preventDefault();

        const currentUser=getCurrentUser();
        if(!currentUser)return;

        const mobile=normalizeMobile(mobileInput.value);
        const operator=operatorInput.value;
        const rechargeType=rechargeTypeInput.value;
        const amount=Number(amountInput.value);
        const pin=pinInput.value;

        if(!validMobile(mobile)){
            showAlert(
                alertBox,
                "Enter a valid Bangladesh mobile number."
            );
            return;
        }

        if(!validAmount(
            amount,
            LIMITS.rechargeMin,
            LIMITS.rechargeMax
        )){
            showAlert(
                alertBox,
                "Recharge amount must be between "+
                money(LIMITS.rechargeMin)+" and "+
                money(LIMITS.rechargeMax)+"."
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

        const updatedUser=updateBalance(
            currentUser.mobile,
            -amount
        );

        if(!updatedUser){
            showAlert(
                alertBox,
                "Unable to update your wallet balance."
            );
            return;
        }

        addTransaction({
            type:"mobile_recharge",
            account:currentUser.mobile,
            mobile:mobile,
            amount:amount,
            fee:0,
            operator:operator,
            rechargeType:rechargeType,
            balanceAfter:updatedUser.balance
        });

        form.reset();

        showAlert(
            alertBox,
            money(amount)+" recharge successful for "+
            mobile+".",
            "success"
        );
    });
});