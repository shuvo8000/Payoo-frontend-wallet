document.addEventListener("DOMContentLoaded",function(){
    const form=document.getElementById("loginForm");
    const alertBox=document.getElementById("formAlert");
    const pinInput=document.getElementById("loginPin");
    const pinToggle=document.getElementById("pinToggle");

    if(!form)return;

    function showLoginMessage(message,type){
        if(!alertBox)return;

        alertBox.textContent=message;
        alertBox.style.display="block";
        alertBox.style.marginBottom="18px";
        alertBox.style.padding="12px 14px";
        alertBox.style.borderRadius="10px";
        alertBox.style.fontSize="13px";
        alertBox.style.fontWeight="600";

        if(type==="success"){
            alertBox.style.border="1px solid #bfe8d1";
            alertBox.style.background="#effaf4";
            alertBox.style.color="#16834f";
        }else{
            alertBox.style.border="1px solid #f0cccc";
            alertBox.style.background="#fff4f4";
            alertBox.style.color="#c23b3b";
        }
    }

    function clearLoginMessage(){
        if(!alertBox)return;

        alertBox.textContent="";
        alertBox.style.display="none";
    }

    // Show or hide PIN
    if(pinToggle&&pinInput){
        pinToggle.addEventListener("click",function(){
            if(pinInput.type==="password"){
                pinInput.type="text";
                pinToggle.textContent="◌";
                pinToggle.title="Hide PIN";
            }else{
                pinInput.type="password";
                pinToggle.textContent="◉";
                pinToggle.title="Show PIN";
            }
        });
    }

    // Login form
    form.addEventListener("submit",function(event){
        event.preventDefault();
        clearLoginMessage();

        const mobile=normalizeMobile(form.mobile.value);
        const pin=form.pin.value;

        if(!mobile){
            showLoginMessage("Enter your mobile number.");
            return;
        }

        if(!validMobile(mobile)){
            showLoginMessage("Enter a valid Bangladesh mobile number.");
            return;
        }

        if(!pin){
            showLoginMessage("Enter your PIN.");
            return;
        }

        if(!validPin(pin)){
            showLoginMessage("Enter a valid 4–6 digit PIN.");
            return;
        }

        // Find user
        const user=findUserByMobile(mobile);

        if(!user){
            showLoginMessage("Incorrect mobile number or PIN.");
            return;
        }

        if(!verifyPin(user,pin)){
            showLoginMessage("Incorrect mobile number or PIN.");
            return;
        }

        setCurrentMobile(user.mobile);

        showLoginMessage(
            "✓ Login successful. Redirecting...",
            "success"
        );

        const loginButton=form.querySelector("button[type='submit']");

        if(loginButton){
            loginButton.disabled=true;
            loginButton.textContent="Logging in...";
        }

        setTimeout(function(){
            location.href="dashboard.html";
        },500);
    });
});