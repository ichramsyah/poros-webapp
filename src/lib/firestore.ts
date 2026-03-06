import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  increment,
  Timestamp,
  orderBy,
} from "firebase/firestore";

// Types
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
}

export interface Budget {
  id: string;
  userId: string;
  monthYear: string; // e.g., "2026-03"
  category: string;
  allocatedAmount: number;
  spentAmount: number;
}

export interface Expense {
  id?: string;
  userId: string;
  budgetId: string;
  amount: number;
  description: string;
  date: Timestamp;
}

export interface MonthlyIncome {
  id?: string;
  userId: string;
  monthYear: string;
  amount: number;
}

export async function getUserProfile(userId: string, email: string, displayName: string) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newUser: UserProfile = {
      id: userId,
      email,
      displayName,
      createdAt: Timestamp.now(),
    };
    await setDoc(userRef, newUser);
    return newUser;
  }
  return userSnap.data() as UserProfile;
}

export async function getMonthlyIncome(userId: string, monthYear: string): Promise<number> {
  const incomeRef = collection(db, "income");
  const q = query(
    incomeRef,
    where("userId", "==", userId),
    where("monthYear", "==", monthYear)
  );
  
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const data = querySnapshot.docs[0].data() as MonthlyIncome;
    return data.amount;
  }
  return 0; // Default if not set
}

export async function setMonthlyIncome(userId: string, monthYear: string, amount: number): Promise<void> {
  const incomeRef = collection(db, "income");
  const q = query(
    incomeRef,
    where("userId", "==", userId),
    where("monthYear", "==", monthYear)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Update existing
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, { amount });
  } else {
    // Create new
    await addDoc(incomeRef, {
      userId,
      monthYear,
      amount
    });
  }
}

export async function initializeMonthBudgets(userId: string, monthYear: string) {
  // We no longer auto-initialize default categories. 
  // Users will start with an empty state and add categories manually.
  return;
}

export async function getBudgets(userId: string, monthYear: string): Promise<Budget[]> {
  const budgetsRef = collection(db, "budgets");
  const q = query(
    budgetsRef,
    where("userId", "==", userId),
    where("monthYear", "==", monthYear)
  );

  const querySnapshot = await getDocs(q);
  const budgets: Budget[] = [];
  querySnapshot.forEach((doc) => {
    budgets.push(doc.data() as Budget);
  });

  return budgets;
}

export async function updateBudgetAllocation(budgetId: string, amount: number) {
  const budgetRef = doc(db, "budgets", budgetId);
  await updateDoc(budgetRef, {
    allocatedAmount: amount,
  });
}

export async function addCategory(userId: string, monthYear: string, categoryName: string, initialAmount: number = 0) {
  const budgetRef = doc(collection(db, "budgets"));
  await setDoc(budgetRef, {
    id: budgetRef.id,
    userId,
    monthYear,
    category: categoryName,
    allocatedAmount: initialAmount,
    spentAmount: 0,
  });
}

import { deleteDoc } from "firebase/firestore";

export async function deleteCategory(budgetId: string) {
  const budgetRef = doc(db, "budgets", budgetId);
  await deleteDoc(budgetRef);
}

export async function addExpense(expense: Omit<Expense, "id">) {
  // 1. Add expense document
  const expenseRef = await addDoc(collection(db, "expenses"), expense);
  
  // 2. Increment spentAmount in the corresponding budget
  const budgetRef = doc(db, "budgets", expense.budgetId);
  await updateDoc(budgetRef, {
    spentAmount: increment(expense.amount),
  });

  return expenseRef.id;
}

export async function getRecentExpenses(userId: string, monthYear: string, limitCount: number = 5): Promise<(Expense & {id: string})[]> {
  const expensesRef = collection(db, "expenses");
  
  // Create Date boundaries for the current month
  const [year, month] = monthYear.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  
  const q = query(
    expensesRef,
    where("userId", "==", userId),
    where("date", ">=", startOfMonth),
    where("date", "<=", endOfMonth),
    orderBy("date", "desc")
  );
  
  // Note: Firestore requires a composite index for where(userId) + where(date) + orderBy(date).
  
  const querySnapshot = await getDocs(q);
  const expenses: (Expense & {id: string})[] = [];
  
  let count = 0;
  querySnapshot.forEach((doc) => {
    if (count < limitCount) {
      expenses.push({ id: doc.id, ...doc.data() } as (Expense & {id: string}));
      count++;
    }
  });
  
  return expenses;
}

export async function getAvailableMonths(userId: string): Promise<string[]> {
  const budgetsRef = collection(db, "budgets");
  const q = query(budgetsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  const months = new Set<string>();
  querySnapshot.forEach((doc) => {
    const data = doc.data() as Budget;
    if (data.monthYear) {
      months.add(data.monthYear);
    }
  });
  
  // Sort descending (newest first)
  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

export async function resetMonthData(userId: string, monthYear: string) {
  // 1. Delete all expenses within this month
  const [year, month] = monthYear.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  
  const expensesRef = collection(db, "expenses");
  const expensesQuery = query(
    expensesRef,
    where("userId", "==", userId),
    where("date", ">=", startOfMonth),
    where("date", "<=", endOfMonth)
  );
  
  const expensesSnapshot = await getDocs(expensesQuery);
  const deleteExpensePromises = expensesSnapshot.docs.map(d => deleteDoc(doc(db, "expenses", d.id)));
  await Promise.all(deleteExpensePromises);

  // 2. Reset all budget spent amounts to 0
  const budgetsRef = collection(db, "budgets");
  const budgetsQuery = query(
    budgetsRef,
    where("userId", "==", userId),
    where("monthYear", "==", monthYear)
  );
  
  const budgetsSnapshot = await getDocs(budgetsQuery);
  const resetBudgetPromises = budgetsSnapshot.docs.map(d => updateDoc(doc(db, "budgets", d.id), { spentAmount: 0 }));
  await Promise.all(resetBudgetPromises);
}
