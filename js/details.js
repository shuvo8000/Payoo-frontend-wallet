
document.addEventListener("DOMContentLoaded",function(){
    const user=setupShell("");
    if(!user)return;

    const box=document.getElementById("details");
    const params=new URLSearchParams(location.search);
    const transactionId=params.get("id");

    if(!box)return;

    const transactions=getTransactions();
    let transaction=null;

    for(let i=0;i<transactions.length;i++){
        const currentTransaction=transactions[i];

        if(
            currentTransaction.id===transactionId&&
            (
                normalizeMobile(currentTransaction.sender||"")===user.mobile||
                normalizeMobile(currentTransaction.recipient||"")===user.mobile||
                normalizeMobile(currentTransaction.account||"")===user.mobile
            )
        ){
            transaction=currentTransaction;
            break;
        }
    }

    if(!transaction){
        box.innerHTML=
            '<div class="empty">'+
            '<strong>Transaction not found</strong>'+
            '<span>This transaction is unavailable.</span>'+
            '</div>';
        return;
    }

    let incoming=false;

    if(transaction.type==="add_money")incoming=true;

    if(
        transaction.type==="received_money"&&
        normalizeMobile(transaction.recipient||"")===user.mobile
    ){
        incoming=true;
    }

    let sign="-";
    let amountClass="amount-negative";

    if(incoming){
        sign="+";
        amountClass="amount-positive";
    }

    let html="";

    html+=
        '<div class="card-title">'+
        '<h2>'+escapeHTML(
            transactionTypeLabel(transaction.type)
        )+'</h2>'+
        '<span class="badge badge-success">'+
        escapeHTML(transaction.status||"success")+
        '</span></div>';

    html+='<div class="detail-list">';

    html+=
        '<div class="detail-row">'+
        '<span>Transaction ID</span>'+
        '<strong>'+escapeHTML(transaction.id)+'</strong>'+
        '</div>';

    html+=
        '<div class="detail-row">'+
        '<span>Amount</span>'+
        '<strong class="'+amountClass+'">'+
        sign+money(transaction.amount)+
        '</strong></div>';

    if(transaction.fee){
        html+=
            '<div class="detail-row">'+
            '<span>Fee</span>'+
            '<strong>'+money(transaction.fee)+'</strong>'+
            '</div>';
    }

    if(transaction.sender){
        html+=
            '<div class="detail-row">'+
            '<span>Sender</span>'+
            '<strong>'+
            escapeHTML(transaction.senderName||transaction.sender)+
            '</strong></div>';

        html+=
            '<div class="detail-row">'+
            '<span>Sender Number</span>'+
            '<strong>'+escapeHTML(transaction.sender)+'</strong>'+
            '</div>';
    }

    if(transaction.recipient){
        html+=
            '<div class="detail-row">'+
            '<span>Recipient</span>'+
            '<strong>'+
            escapeHTML(
                transaction.recipientName||
                transaction.recipient
            )+
            '</strong></div>';

        html+=
            '<div class="detail-row">'+
            '<span>Recipient Number</span>'+
            '<strong>'+escapeHTML(transaction.recipient)+'</strong>'+
            '</div>';
    }

    if(transaction.type==="cash_out"){
        html+=
            '<div class="detail-row">'+
            '<span>Agent Number</span>'+
            '<strong>'+escapeHTML(transaction.agent||"-")+'</strong>'+
            '</div>';
    }

    if(transaction.type==="mobile_recharge"){
        html+=
            '<div class="detail-row">'+
            '<span>Recharge Number</span>'+
            '<strong>'+escapeHTML(transaction.mobile||"-")+'</strong>'+
            '</div>';
    }

    if(transaction.operator){
        html+=
            '<div class="detail-row">'+
            '<span>Operator</span>'+
            '<strong>'+escapeHTML(transaction.operator)+'</strong>'+
            '</div>';
    }

    if(transaction.rechargeType){
        html+=
            '<div class="detail-row">'+
            '<span>Recharge Type</span>'+
            '<strong>'+escapeHTML(transaction.rechargeType)+'</strong>'+
            '</div>';
    }

    if(transaction.billNumber){
        html+=
            '<div class="detail-row">'+
            '<span>Bill Number</span>'+
            '<strong>'+escapeHTML(transaction.billNumber)+'</strong>'+
            '</div>';
    }

    if(transaction.billType){
        html+=
            '<div class="detail-row">'+
            '<span>Bill Type</span>'+
            '<strong>'+escapeHTML(transaction.billType)+'</strong>'+
            '</div>';
    }

    if(transaction.method){
        html+=
            '<div class="detail-row">'+
            '<span>Funding Method</span>'+
            '<strong>'+escapeHTML(transaction.method)+'</strong>'+
            '</div>';
    }

    if(transaction.bankName){
        html+=
            '<div class="detail-row">'+
            '<span>Bank</span>'+
            '<strong>'+escapeHTML(transaction.bankName)+'</strong>'+
            '</div>';
    }

    if(transaction.provider){
        html+=
            '<div class="detail-row">'+
            '<span>Provider</span>'+
            '<strong>'+escapeHTML(transaction.provider)+'</strong>'+
            '</div>';
    }

    if(transaction.sourceAccount){
        html+=
            '<div class="detail-row">'+
            '<span>Source Account</span>'+
            '<strong>'+escapeHTML(transaction.sourceAccount)+'</strong>'+
            '</div>';
    }

    html+=
        '<div class="detail-row">'+
        '<span>Date & Time</span>'+
        '<strong>'+
        escapeHTML(transaction.date||"-")+" "+
        escapeHTML(transaction.time||"")+
        '</strong></div>';

    html+=
        '<div class="detail-row">'+
        '<span>Balance After</span>'+
        '<strong>'+money(transaction.balanceAfter)+'</strong>'+
        '</div>';

    html+='</div>';

    box.innerHTML=html;
});