// Dashboard page setup
document.addEventListener("DOMContentLoaded", function () {

    const user = setupShell("dashboard");

    if (!user) {
        return;
    }

    const balance = document.getElementById("balance");
    const account = document.getElementById("accountMobile");
    const recent = document.getElementById("recentBody");
    const toggle = document.getElementById("toggleBalance");
    const copy = document.getElementById("copyAccount");

    // Show account number
    if (account) {
        account.textContent = user.mobile;
    }

    // Update balance
    function updateBalance() {
        const currentUser = getCurrentUser();

        if (currentUser && balance) {
            balance.textContent = money(currentUser.balance);
        }
    }

    updateBalance();

    // Show or hide balance
    if (toggle && balance) {
        toggle.addEventListener("click", function () {

            if (balance.dataset.hidden === "true") {

                updateBalance();

                balance.dataset.hidden = "false";
                toggle.textContent = "◉";
                toggle.title = "Hide balance";

            } else {

                balance.textContent = "৳••••••";

                balance.dataset.hidden = "true";
                toggle.textContent = "◌";
                toggle.title = "Show balance";
            }

        });
    }

    // Copy account number
    if (copy) {
        copy.addEventListener("click", function () {
            copyText(user.mobile);
        });
    }

    // Get user's transactions
    let transactions = getUserTransactions(user.mobile);

    // Sort newest transaction first
    transactions.sort(function (a, b) {
        const dateA = new Date(
            (a.date || "") + " " + (a.time || "")
        );

        const dateB = new Date(
            (b.date || "") + " " + (b.time || "")
        );

        return dateB - dateA;
    });

    // Show recent transactions
    if (recent) {

        const recentTransactions = transactions.slice(0, 5);

        if (recentTransactions.length === 0) {

            recent.innerHTML =
                '<tr>' +
                '<td colspan="5">' +
                '<div class="dashboard-empty">' +
                'No transactions yet.' +
                '</div>' +
                '</td>' +
                '</tr>';

        } else {

            let html = "";

            for (let i = 0; i < recentTransactions.length; i++) {
                html += renderDashboardTransaction(
                    recentTransactions[i],
                    user.mobile
                );
            }

            recent.innerHTML = html;
        }
    }

    // Calculate financial overview
    let added = 0;
    let sent = 0;
    let spent = 0;

    for (let i = 0; i < transactions.length; i++) {

        const transaction = transactions[i];
        const amount = Number(transaction.amount) || 0;

        // Total money added
        if (transaction.type === "add_money") {
            added += amount;
        }

        // Total money sent
        if (transaction.type === "send_money") {
            sent += amount;
        }

        // Total money spent
        if (
            transaction.type === "cash_out" ||
            transaction.type === "mobile_recharge" ||
            transaction.type === "bill_payment"
        ) {
            spent += amount;
        }
    }

    const addedElement =
        document.getElementById("overviewAdded");

    const sentElement =
        document.getElementById("overviewSent");

    const spentElement =
        document.getElementById("overviewSpent");

    if (addedElement) {
        addedElement.textContent = money(added);
    }

    if (sentElement) {
        sentElement.textContent = money(sent);
    }

    if (spentElement) {
        spentElement.textContent = money(spent);
    }
});


// Create one dashboard transaction row
function renderDashboardTransaction(transaction, currentMobile) {

    const current = normalizeMobile(currentMobile);

    let incoming = false;
    let sign = "-";
    let color = "transaction-negative";

    let party = "-";
    let icon = "•";

    // Check incoming transaction
    if (transaction.type === "add_money") {
        incoming = true;
    }

    if (
        transaction.type === "received_money" &&
        normalizeMobile(transaction.recipient || "") === current
    ) {
        incoming = true;
    }

    if (incoming) {
        sign = "+";
        color = "transaction-positive";
    }

    // Add Money
    if (transaction.type === "add_money") {
        party =
            transaction.bankName ||
            transaction.provider ||
            transaction.method ||
            "Wallet";

        icon = "+";
    }

    // Send Money
    else if (transaction.type === "send_money") {
        party =
            "To " +
            (
                transaction.recipientName ||
                transaction.recipient ||
                "-"
            );

        icon = "↗";
    }

    // Received Money
    else if (transaction.type === "received_money") {
        party =
            "From " +
            (
                transaction.senderName ||
                transaction.sender ||
                "-"
            );

        icon = "↙";
    }

    // Cash Out
    else if (transaction.type === "cash_out") {
        party =
            "Agent " +
            (
                transaction.agent ||
                transaction.account ||
                "-"
            );

        icon = "↓";
    }

    // Mobile Recharge
    else if (transaction.type === "mobile_recharge") {
        party = transaction.mobile || "-";
        icon = "▣";
    }

    // Bill Payment
    else if (transaction.type === "bill_payment") {
        party = transaction.billNumber || "-";
        icon = "◫";
    }

    return `
        <tr class="transaction-row">
            <td>
                <div class="transaction-main">
                    <div class="transaction-icon">
                        ${icon}
                    </div>

                    <div class="transaction-info">
                        <strong>
                            ${escapeHTML(
                                transactionTypeLabel(transaction.type)
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(party)}
                        </span>

                        <small>
                            ${escapeHTML(transaction.id)}
                        </small>
                    </div>
                </div>
            </td>

            <td>
                <span class="transaction-amount ${color}">
                    ${sign}${money(transaction.amount)}
                </span>
            </td>

            <td>
                ${escapeHTML(party)}
            </td>

            <td>
                <div class="transaction-date">
                    <strong>
                        ${escapeHTML(transaction.date || "-")}
                    </strong>

                    <span>
                        ${escapeHTML(transaction.time || "")}
                    </span>
                </div>
            </td>

            <td>
                <span class="transaction-status">
                    <span class="transaction-status-dot"></span>
                    ${escapeHTML(transaction.status || "success")}
                </span>
            </td>
        </tr>
    `;
}