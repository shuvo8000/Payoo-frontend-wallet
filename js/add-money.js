document.addEventListener("DOMContentLoaded",function(){
    const user=setupShell("add-money");
    if(!user)return;

    const form=document.getElementById("addMoneyForm");
    const alertBox=document.getElementById("formAlert");
    const fundingMethod=document.getElementById("fundingMethod");
    const bankSourceFields=document.getElementById("bankSourceFields");
    const mobileBankingFields=document.getElementById("mobileBankingFields");
    const bankName=document.getElementById("bankName");
    const bankAccountNumber=document.getElementById("bankAccountNumber");
    const mobileProvider=document.getElementById("mobileProvider");
    const mobileNumber=document.getElementById("mobileNumber");
    const currentBalance=document.getElementById("currentBalance");
    const togglePin=document.getElementById("togglePin");
    const pinInput=document.getElementById("pin");

    // Show current balance
    function renderBalance(){
        const currentUser=getCurrentUser();
        if(!currentUser||!currentBalance)return;
        currentBalance.textContent=money(currentUser.balance);
    }

    renderBalance();

    // Change funding method
    function updateFundingMethod(){
        const method=fundingMethod.value;

        if(method==="Bank Account"){
            bankSourceFields.classList.add("active");
            mobileBankingFields.classList.remove("active");
            mobileProvider.value="";
            mobileNumber.value="";
            bankName.required=true;
            bankAccountNumber.required=true;
            mobileProvider.required=false;
            mobileNumber.required=false;
        }else if(method==="Mobile Banking"){
            bankSourceFields.classList.remove("active");
            mobileBankingFields.classList.add("active");
            bankName.value="";
            bankAccountNumber.value="";
            bankName.required=false;
            bankAccountNumber.required=false;
            mobileProvider.required=true;
            mobileNumber.required=true;
        }
    }

    if(fundingMethod){
        fundingMethod.addEventListener("change",updateFundingMethod);
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

    // Validate source account
    function validateSource(){
        const method=fundingMethod.value;

        if(method==="Bank Account"){
            if(!bankName.value){
                showAlert(alertBox,"Please select a bank.");
                return false;
            }

            const accountNumber=bankAccountNumber.value.replace(/\s|-/g,"");

            if(!/^\d{6,20}$/.test(accountNumber)){
                showAlert(alertBox,"Enter a valid bank account number.");
                return false;
            }

            return true;
        }

        if(method==="Mobile Banking"){
            if(!mobileProvider.value){
                showAlert(alertBox,"Select a mobile banking provider.");
                return false;
            }

            if(!validMobile(mobileNumber.value)){
                showAlert(alertBox,"Enter a valid Bangladesh mobile number.");
                return false;
            }

            return true;
        }

        showAlert(alertBox,"Please select a funding method.");
        return false;
    }

    // Add Money form
    form.addEventListener("submit",function(event){
        event.preventDefault();

        const currentUser=getCurrentUser();
        if(!currentUser)return;

        const amount=Number(form.amount.value);
        const pin=form.pin.value;
        const method=fundingMethod.value;

        if(!validAmount(amount,LIMITS.addMoneyMin,LIMITS.addMoneyMax)){
            showAlert(
                alertBox,
                "Amount must be between "+
                money(LIMITS.addMoneyMin)+" and "+
                money(LIMITS.addMoneyMax)+"."
            );
            return;
        }

        if(!validateSource())return;

        if(!verifyPin(currentUser,pin)){
            showAlert(alertBox,"Incorrect Payoo PIN.");
            return;
        }

        let provider="";
        let sourceAccount="";
        let selectedBank="";

        if(method==="Bank Account"){
            provider="Bank Account";
            selectedBank=bankName.value;
            sourceAccount=bankAccountNumber.value.replace(/\s|-/g,"");
        }else if(method==="Mobile Banking"){
            provider=mobileProvider.value;
            sourceAccount=normalizeMobile(mobileNumber.value);
        }

        const updatedUser=updateBalance(
            currentUser.mobile,
            amount
        );

        if(!updatedUser){
            showAlert(
                alertBox,
                "Unable to update your wallet balance."
            );
            return;
        }

        addTransaction({
            type:"add_money",
            account:currentUser.mobile,
            amount:amount,
            fee:0,
            method:method,
            provider:provider,
            bankName:selectedBank,
            sourceAccount:sourceAccount,
            balanceAfter:updatedUser.balance
        });

        form.reset();
        fundingMethod.value="Bank Account";
        updateFundingMethod();
        renderBalance();

        let successSource=provider;
        if(selectedBank)successSource=selectedBank;

        showAlert(
            alertBox,
            money(amount)+" added successfully using "+
            successSource+".",
            "success"
        );
    });

    updateFundingMethod();
});