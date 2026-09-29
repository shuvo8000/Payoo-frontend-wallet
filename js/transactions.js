
document.addEventListener("DOMContentLoaded",function(){
    const user=setupShell("transactions");
    if(!user)return;

    const body=document.getElementById("transactionBody");
    const search=document.getElementById("search");
    const typeFilter=document.getElementById("typeFilter");

    if(!body)return;

    function renderTransactions(){
        let transactions=getUserTransactions(user.mobile);

        // Sort newest first
        transactions.sort(function(a,b){
            const dateA=new Date((a.date||"")+" "+(a.time||""));
            const dateB=new Date((b.date||"")+" "+(b.time||""));
            return dateB-dateA;
        });

        const query=search?search.value.trim().toLowerCase():"";
        const selectedType=typeFilter?typeFilter.value:"";
        let filteredTransactions=[];

        for(let i=0;i<transactions.length;i++){
            const transaction=transactions[i];

            let searchText=transaction.id||"";
            searchText+=" "+(transaction.type||"");
            searchText+=" "+(transaction.sender||"");
            searchText+=" "+(transaction.senderName||"");
            searchText+=" "+(transaction.recipient||"");
            searchText+=" "+(transaction.recipientName||"");
            searchText+=" "+(transaction.account||"");
            searchText+=" "+(transaction.mobile||"");
            searchText+=" "+(transaction.billNumber||"");
            searchText+=" "+(transaction.billType||"");
            searchText+=" "+(transaction.method||"");
            searchText+=" "+(transaction.provider||"");
            searchText+=" "+(transaction.bankName||"");
            searchText+=" "+(transaction.amount||"");
            searchText+=" "+(transaction.date||"");
            searchText+=" "+(transaction.time||"");
            searchText+=" "+(transaction.status||"");

            searchText=searchText.toLowerCase();

            if(query&&!searchText.includes(query))continue;
            if(selectedType&&transaction.type!==selectedType)continue;

            filteredTransactions.push(transaction);
        }

        // Show results
        if(filteredTransactions.length===0){
            body.innerHTML=
                '<tr>'+
                '<td colspan="6">'+
                '<div class="empty">'+
                '<strong>No transactions found</strong>'+
                '<span>Your completed transactions will appear here.</span>'+
                '</div>'+
                '</td>'+
                '</tr>';

            return;
        }

        let html="";

        for(let i=0;i<filteredTransactions.length;i++){
            html+=renderTransactionRow(
                filteredTransactions[i],
                user.mobile
            );
        }

        body.innerHTML=html;
    }

    if(search){
        search.addEventListener("input",renderTransactions);
    }

    if(typeFilter){
        typeFilter.addEventListener("change",renderTransactions);
    }

    renderTransactions();
});