import csv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class Expense(BaseModel):
    id: int
    description: str
    amount: float
    category: str


class CreateExpenseRequest(BaseModel):
    description: str
    amount: float
    category: str


app = FastAPI(title="Expense Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/expenses")
def get_expenses():
    expenses = []
    try:
        with open("expenses.csv", "r") as f:
            reader = csv.reader(f)
            for row in reader:
                expenses.append(
                    Expense(
                        id=int(row[0]),
                        description=row[1],
                        amount=float(row[2]),
                        category=row[3],
                    )
                )
    except FileNotFoundError:
        pass
    return {"expenses": expenses}


@app.post("/expenses")
def add_expense(expense: CreateExpenseRequest):

    existing_expenses: list[Expense] = []
    try:
        with open("expenses.csv", "r") as f:
            reader = csv.reader(f)
            for row in reader:
                existing_expenses.append(
                    Expense(
                        id=int(row[0]),
                        description=row[1],
                        amount=float(row[2]),
                        category=row[3],
                    )
                )
    except FileNotFoundError:
        pass

    next_id = max([int(e.id) for e in existing_expenses], default=0) + 1

    with open("expenses.csv", "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            next_id,
            expense.description,
            expense.amount,
            expense.category,
        ])
    return {"message": "Expense added successfully", "expense": expense}


@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):
    expenses = []
    try:
        with open("expenses.csv", "r") as f:
            reader = csv.reader(f)
            for row in reader:
                expenses.append(
                    Expense(
                        id=int(row[0]),
                        description=row[1],
                        amount=float(row[2]),
                        category=row[3],
                    )
                )
    except FileNotFoundError:
        pass

    expenses = [e for e in expenses if e.id != expense_id]

    with open("expenses.csv", "w", newline="") as f:
        writer = csv.writer(f)
        for expense in expenses:
            writer.writerow([
                expense.id,
                expense.description,
                expense.amount,
                expense.category,
            ])
    return {"message": "Expense deleted successfully"}


@app.put("/expenses/{expense_id}")
def update_expense(expense_id: int, update_expense: CreateExpenseRequest):
    expenses = []
    try:
        with open("expenses.csv", "r") as f:
            reader = csv.reader(f)
            for row in reader:
                expenses.append(
                    Expense(
                        id=int(row[0]),
                        description=row[1],
                        amount=float(row[2]),
                        category=row[3],
                    )
                )
    except FileNotFoundError:
        pass

    for i, expense in enumerate(expenses):
        if expense.id == expense_id:
            updated_expense = Expense(
                id=expense_id,
                description=update_expense.description,
                amount=update_expense.amount,
                category=update_expense.category,
            )
            expenses[i] = updated_expense
            break
    else:
        return {"message": "Expense not found"}

    with open("expenses.csv", "w", newline="") as f:
        writer = csv.writer(f)
        for expense in expenses:
            writer.writerow([
                expense.id,
                expense.description,
                expense.amount,
                expense.category,
            ])
    return {"message": "Expense updated successfully", "expense": updated_expense}
