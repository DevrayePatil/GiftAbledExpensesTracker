const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const submitExpenseButton = document.getElementById("addExpense");
const cancelUpdateButton = document.getElementById("cancelUpdate");

let expenses = [];

let isUpdating = false;
let updatingExpenseId = null;


async function initializeExpenseTracker() {
    expenses = await getExpenses();
    displayExpenses(expenses);
}

async function getExpenses() {
    const response = await fetch("http://localhost:8000/expenses");
    const expenses = await response.json();

    return expenses.expenses;
}

async function displayExpenses() {
    expenses = await getExpenses();
    const expenseList = document.getElementById("expenses");
    expenseList.innerHTML = "";

    if (expenses.length === 0) {
        expenseList.innerHTML = "<li>No expenses recorded.</li>";
    } else {
        expenses.forEach((expense) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <div class="expense-card">
                    <h3>${expense.description}</h3>
                    <p>Amount: $${expense.amount}</p>
                    <p>Category: ${expense.category}</p>
                    <div class="expense-actions">
                        <button class="remove-button">Delete</button>
                        <button class="edit-button">Edit</button>
                    </div>
                </div>
            `;

            listItem.querySelector(".remove-button").addEventListener("click", () => {
                deleteExpense(expense.id);
            });
            listItem.querySelector(".edit-button").addEventListener("click", () => {
                editExpense(expense.id);
            });

            expenseList.appendChild(listItem);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeExpenseTracker();
});


async function submitExpense() {
    const description = descriptionInput.value;
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;

    if (!description || isNaN(amount)) {
        alert("Please enter a valid description and amount.");
        return;
    }

    const url = isUpdating ? `http://localhost:8000/expenses/${updatingExpenseId}` : "http://localhost:8000/expenses";
    const method = isUpdating ? "PUT" : "POST";

    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ description, amount, category }),
    });

    if (response.ok) {
        displayExpenses();
        resetForm();
    } else {
        alert("Failed to submit expense.");
    }
}


async function deleteExpense(expenseId) {
    const response = await fetch(`http://localhost:8000/expenses/${expenseId}`, {
        method: "DELETE",
    });

    if (response.ok) {
        displayExpenses();
    } else {
        alert("Failed to delete expense.");
    }
}

async function editExpense(expenseId) {
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) {
        alert("Expense not found.");
        return;
    }

    descriptionInput.value = expense.description;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;

    isUpdating = true;
    updatingExpenseId = expenseId;


    submitExpenseButton.textContent = "Update Expense";
    cancelUpdateButton.style.display = "inline-block";
}


function cancelUpdate() {
    resetForm();
}


function resetForm() {
    descriptionInput.value = "";
    amountInput.value = "";
    categoryInput.value = "";


    isUpdating = false;
    updatingExpenseId = null;
    submitExpenseButton.textContent = "Add Expense";
    cancelUpdateButton.style.display = "none";
}

submitExpenseButton.addEventListener("click", submitExpense);

cancelUpdateButton.addEventListener("click", cancelUpdate);