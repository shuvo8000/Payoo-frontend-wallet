
document.addEventListener("DOMContentLoaded",function(){
    const user=setupShell("cash-out");
    if(!user)return;

    const form=document.getElementById("cashOutForm");
    const alertBox=document.getElementById("formAlert");
    const agentInput=document.getElementById("agent");
    const amountInput=document.getElementById("amount");
    const pinInput=document.getElementById("pin");
    const feeElement=document.getElementById("fee");
    const totalElement=document.getElementById("total");
    const togglePin=document.getElementById("togglePin");

    if(feeElement){
        feeElement.textContent=money(LIMITS.cashOutFee);
    }

    function updateTotal(){
        const amount=Number(amountInput.value)||0;
        const total=amount+LIMITS.cashOutFee;

        if(totalElement){
            totalElement.textContent=money(total);
        }
    }

    if(amountInput){
        amountInput.addEventListener("input",updateTotal);
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

    form.addEventListener("submit",function(event){
        event.preventDefault();

        const currentUser=getCurrentUser();
        if(!currentUser)return;

        const agent=normalizeMobile(agentInput.value);
        const amount=Number(amountInput.value);
        const total=amount+LIMITS.cashOutFee;
        const pin=pinInput.value;

        // Validate cash out
        if(!validMobile(agent)){
            showAlert(
                alertBox,
                "Enter a valid Bangladesh agent mobile number."
            );
            return;
        }

        if(!validAmount(amount,LIMITS.cashOutMin,LIMITS.cashOutMax)){
            showAlert(
                alertBox,
                "Amount must be between "+
                money(LIMITS.cashOutMin)+" and "+
                money(LIMITS.cashOutMax)+"."
            );
            return;
        }

        if(Number(currentUser.balance)<total){
            showAlert(
                alertBox,
                "Insufficient balance. You need "+
                money(total)+" including the fee."
            );
            return;
        }

        if(!verifyPin(currentUser,pin)){
            showAlert(alertBox,"Incorrect PIN.");
            return;
        }

        const updatedUser=updateBalance(
            currentUser.mobile,
            -total
        );

        if(!updatedUser){
            showAlert(
                alertBox,
                "Unable to update wallet balance."
            );
            return;
        }

        addTransaction({
            type:"cash_out",
            account:currentUser.mobile,
            agent:agent,
            amount:amount,
            fee:LIMITS.cashOutFee,
            balanceAfter:updatedUser.balance
        });

        form.reset();
        updateTotal();

        showAlert(
            alertBox,
            "Cash Out successful. "+
            money(amount)+" withdrawn with a "+
            money(LIMITS.cashOutFee)+" fee.",
            "success"
        );
    });

    updateTotal();
});