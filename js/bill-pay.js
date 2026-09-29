
document.addEventListener("DOMContentLoaded",function(){
    const user=setupShell("pay-bill");
    if(!user)return;

    const form=document.getElementById("billForm");
    const alertBox=document.getElementById("formAlert");

    // Bill Payment form
    form.addEventListener("submit",function(event){
        event.preventDefault();

        const currentUser=getCurrentUser();
        if(!currentUser)return;

        const billType=form.billType.value;
        const billNumber=form.billNumber.value.trim();
        const amount=Number(form.amount.value);
        const pin=form.pin.value;

        if(!billNumber){
            showAlert(
                alertBox,
                "Enter a valid customer or bill number."
            );
            return;
        }

        if(!validAmount(amount,LIMITS.billMin,LIMITS.billMax)){
            showAlert(
                alertBox,
                "Bill payment amount must be between "+
                money(LIMITS.billMin)+" and "+
                money(LIMITS.billMax)+"."
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
            type:"bill_payment",
            account:currentUser.mobile,
            billNumber:billNumber,
            billType:billType,
            amount:amount,
            fee:0,
            balanceAfter:updatedUser.balance
        });

        form.reset();

        showAlert(
            alertBox,
            money(amount)+" "+billType+
            " bill payment successful.",
            "success"
        );
    });
});