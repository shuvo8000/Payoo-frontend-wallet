// Payoo AI Assistant page
document.addEventListener("DOMContentLoaded", function () {

    const user = setupShell("ai-assistant");

    if (!user) {
        return;
    }

    const input =
        document.getElementById("aiInput");

    const sendButton =
        document.getElementById("aiSend");

    const messages =
        document.getElementById("aiMessages");

    if (!input || !sendButton || !messages) {
        return;
    }

    // Get current user's transactions
    function getMyTransactions() {
        const currentUser =
            getCurrentUser();

        if (!currentUser) {
            return [];
        }

        return getUserTransactions(
            currentUser.mobile
        );
    }

    // Calculate spending
    function getSpending() {

        const transactions =
            getMyTransactions();

        const result = {
            cashOut: 0,
            recharge: 0,
            bill: 0,
            sent: 0,
            total: 0
        };

        for (let i = 0; i < transactions.length; i++) {

            const transaction =
                transactions[i];

            const amount =
                Number(transaction.amount) || 0;

            if (transaction.type === "cash_out") {
                result.cashOut += amount;
            }

            if (transaction.type === "mobile_recharge") {
                result.recharge += amount;
            }

            if (transaction.type === "bill_payment") {
                result.bill += amount;
            }

            if (transaction.type === "send_money") {
                result.sent += amount;
            }
        }

        result.total =
            result.cashOut +
            result.recharge +
            result.bill +
            result.sent;

        return result;
    }

    // Add AI message
    function addBotMessage(text) {

        const item =
            document.createElement("div");

        item.className =
            "ai-message ai-message-bot";

        item.innerHTML =
            '<div class="ai-message-avatar">✦</div>' +
            '<div class="ai-message-content">' +
            '<strong>Payoo AI</strong>' +
            '<p>' +
            text +
            '</p>' +
            '</div>';

        messages.appendChild(item);

        messages.scrollTop =
            messages.scrollHeight;
    }

    // Add user message
    function addUserMessage(text) {

        const item =
            document.createElement("div");

        item.className =
            "ai-message ai-message-user";

        item.innerHTML =
            '<div class="ai-message-content">' +
            '<strong>You</strong>' +
            '<p>' +
            escapeHTML(text) +
            '</p>' +
            '</div>';

        messages.appendChild(item);

        messages.scrollTop =
            messages.scrollHeight;
    }

    // Get five latest transactions
    function getRecentTransactions() {

        const transactions =
            getMyTransactions();

        transactions.sort(function (a, b) {

            const dateA = new Date(
                (a.date || "") +
                " " +
                (a.time || "")
            );

            const dateB = new Date(
                (b.date || "") +
                " " +
                (b.time || "")
            );

            return dateB - dateA;
        });

        return transactions.slice(0, 5);
    }

    // Create recent transaction response
    function recentTransactionsResponse() {

        const transactions =
            getRecentTransactions();

        if (transactions.length === 0) {

            return (
                "<strong>Recent Transactions</strong>" +
                "<br><br>" +
                "You don't have any recorded transactions yet."
            );
        }

        let html =
            "<strong>Your Recent Transactions</strong>" +
            "<br><br>";

        for (let i = 0; i < transactions.length; i++) {

            const transaction =
                transactions[i];

            let party = "Wallet";

            if (transaction.type === "send_money") {

                party =
                    "To " +
                    (
                        transaction.recipientName ||
                        transaction.recipient ||
                        "-"
                    );
            }

            else if (
                transaction.type === "received_money"
            ) {

                party =
                    "From " +
                    (
                        transaction.senderName ||
                        transaction.sender ||
                        "-"
                    );
            }

            else if (
                transaction.type === "cash_out"
            ) {

                party =
                    "Agent " +
                    (
                        transaction.account ||
                        "-"
                    );
            }

            else if (
                transaction.type === "mobile_recharge"
            ) {

                party =
                    transaction.mobile ||
                    "-";
            }

            else if (
                transaction.type === "bill_payment"
            ) {

                party =
                    transaction.billNumber ||
                    "-";
            }

            else if (
                transaction.type === "add_money"
            ) {

                party =
                    transaction.bankName ||
                    transaction.provider ||
                    transaction.method ||
                    "Wallet";
            }

            html +=
                '<div class="ai-transaction-item">' +
                '<div class="ai-transaction-info">' +
                '<strong>' +
                escapeHTML(
                    transactionTypeLabel(
                        transaction.type
                    )
                ) +
                '</strong>' +
                '<span>' +
                escapeHTML(party) +
                '</span>' +
                '<small>' +
                escapeHTML(
                    transaction.date || "-"
                ) +
                " " +
                escapeHTML(
                    transaction.time || ""
                ) +
                '</small>' +
                '</div>' +
                '<strong class="ai-transaction-amount">' +
                money(transaction.amount) +
                '</strong>' +
                '</div>';
        }

        return html;
    }

    // Create AI response
    function getResponse(question) {

        const q =
            question.toLowerCase().trim();

        const currentUser =
            getCurrentUser();

        if (!currentUser) {
            return "Please log in again to use Payoo AI.";
        }

        // Balance
        if (
            q.includes("balance") ||
            q.includes("how much money")
        ) {

            return (
                "Your current Payoo wallet balance is " +
                "<strong>" +
                money(currentUser.balance) +
                "</strong>."
            );
        }

        // Recent transactions
        if (
            q.includes("recent transaction") ||
            q.includes("latest transaction") ||
            q.includes("last transaction")
        ) {

            return recentTransactionsResponse();
        }

        // Spending summary
        if (
            q.includes("spending summary") ||
            q.includes("summary") ||
            q.includes("analyze") ||
            q.includes("breakdown")
        ) {

            const transactions =
                getMyTransactions();

            const spending =
                getSpending();

            if (transactions.length === 0) {
                return "You don't have any recorded transactions yet.";
            }

            return (
                "<strong>Your Payoo Spending Summary</strong>" +
                "<br><br>" +
                "Total transactions: " +
                "<strong>" +
                transactions.length +
                "</strong>" +
                "<br>" +
                "Total spending: " +
                "<strong>" +
                money(spending.total) +
                "</strong>" +
                "<br><br>" +
                "Cash Out: " +
                "<strong>" +
                money(spending.cashOut) +
                "</strong>" +
                "<br>" +
                "Mobile Recharge: " +
                "<strong>" +
                money(spending.recharge) +
                "</strong>" +
                "<br>" +
                "Bill Payment: " +
                "<strong>" +
                money(spending.bill) +
                "</strong>" +
                "<br>" +
                "Send Money: " +
                "<strong>" +
                money(spending.sent) +
                "</strong>"
            );
        }

        // Total spending
        if (
            q.includes("spend") ||
            q.includes("spent") ||
            q.includes("expense")
        ) {

            const spending =
                getSpending();

            return (
                "You have spent " +
                "<strong>" +
                money(spending.total) +
                "</strong>" +
                " in your recorded transactions." +
                "<br><br>" +
                "Cash Out: " +
                "<strong>" +
                money(spending.cashOut) +
                "</strong>" +
                "<br>" +
                "Mobile Recharge: " +
                "<strong>" +
                money(spending.recharge) +
                "</strong>" +
                "<br>" +
                "Bill Payment: " +
                "<strong>" +
                money(spending.bill) +
                "</strong>" +
                "<br>" +
                "Send Money: " +
                "<strong>" +
                money(spending.sent) +
                "</strong>"
            );
        }

        // Number of transactions
        if (
            q.includes("how many") &&
            q.includes("transaction")
        ) {

            return (
                "You have " +
                "<strong>" +
                getMyTransactions().length +
                "</strong>" +
                " recorded transactions in your Payoo wallet."
            );
        }

        // Add Money
        if (
            q.includes("add money") ||
            q.includes("deposit") ||
            q.includes("added")
        ) {

            const transactions =
                getMyTransactions();

            let totalAdded = 0;

            for (let i = 0; i < transactions.length; i++) {

                if (
                    transactions[i].type ===
                    "add_money"
                ) {

                    totalAdded +=
                        Number(
                            transactions[i].amount
                        ) || 0;
                }
            }

            return (
                "You have added a total of " +
                "<strong>" +
                money(totalAdded) +
                "</strong>" +
                " to your Payoo wallet."
            );
        }

        // Recharge
        if (q.includes("recharge")) {

            const spending =
                getSpending();

            return (
                "Your recorded mobile recharge spending is " +
                "<strong>" +
                money(spending.recharge) +
                "</strong>."
            );
        }

        // Cash Out
        if (
            q.includes("cash out") ||
            q.includes("cashout")
        ) {

            const spending =
                getSpending();

            return (
                "Your recorded Cash Out amount is " +
                "<strong>" +
                money(spending.cashOut) +
                "</strong>."
            );
        }

        // Bill
        if (q.includes("bill")) {

            const spending =
                getSpending();

            return (
                "Your recorded bill payment amount is " +
                "<strong>" +
                money(spending.bill) +
                "</strong>."
            );
        }

        // Send Money
        if (
            q.includes("send money") ||
            q.includes("sent")
        ) {

            const spending =
                getSpending();

            return (
                "You have sent a total of " +
                "<strong>" +
                money(spending.sent) +
                "</strong>" +
                " through Send Money transactions."
            );
        }

        // Greeting
        if (
            q === "hi" ||
            q === "hello" ||
            q === "hey" ||
            q === "hi there" ||
            q === "hello payoo"
        ) {

            return (
                "Hello " +
                "<strong>" +
                escapeHTML(currentUser.name) +
                "</strong>! 👋" +
                "<br><br>" +
                "How can I help you with your Payoo wallet?"
            );
        }

        // Help
        if (
            q.includes("help") ||
            q.includes("what can you do") ||
            q.includes("what can i ask")
        ) {

            return (
                "<strong>" +
                "I can help you understand your Payoo wallet." +
                "</strong>" +
                "<br><br>" +
                "Try asking:" +
                '<ul class="ai-help-list">' +
                "<li>What is my current balance?</li>" +
                "<li>How much did I spend?</li>" +
                "<li>Show my spending summary.</li>" +
                "<li>Show my recent transactions.</li>" +
                "<li>How many transactions did I make?</li>" +
                "<li>How much did I recharge?</li>" +
                "<li>How much did I cash out?</li>" +
                "<li>How much did I send?</li>" +
                "</ul>"
            );
        }

        // Default response
        return (
            "I can help you with your " +
            "<strong>balance</strong>, " +
            "<strong>spending</strong>, " +
            "<strong>recharge</strong>, " +
            "<strong>cash out</strong>, " +
            "and <strong>transactions</strong>."
        );
    }

    // Send message
    function sendMessage() {

        const question =
            input.value.trim();

        if (!question) {
            return;
        }

        addUserMessage(question);

        input.value = "";

        sendButton.disabled = true;

        // Show typing message
        const typing =
            document.createElement("div");

        typing.className =
            "ai-message ai-message-bot";

        typing.innerHTML =
            '<div class="ai-message-avatar">✦</div>' +
            '<div class="ai-message-content">' +
            '<strong>Payoo AI</strong>' +
            '<p>Typing...</p>' +
            '</div>';

        messages.appendChild(typing);

        messages.scrollTop =
            messages.scrollHeight;

        // Create response
        setTimeout(
            function () {

                typing.remove();

                addBotMessage(
                    getResponse(question)
                );

                sendButton.disabled = false;

                input.focus();
            },
            300
        );
    }

    // Send button
    sendButton.addEventListener(
        "click",
        sendMessage
    );

    // Enter key
    input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();
            }
        }
    );

    // Suggested questions
    const questionButtons =
        document.querySelectorAll(
            "[data-ai-question]"
        );

    for (
        let i = 0;
        i < questionButtons.length;
        i++
    ) {

        questionButtons[i].addEventListener(
            "click",
            function () {

                input.value =
                    questionButtons[i].dataset.aiQuestion;

                sendMessage();
            }
        );
    }
});