import {
  addDoc,
  collection,
  serverTimestamp,
  setDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

import { db } from "./config";

interface ExpenseData {
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  companyId: string;
  userId: string;
  userName: string;
}
export async function addExpense(expense: ExpenseData) {
  const expenseRef = await addDoc(collection(db, "expenses"), {
  title: expense.title,
  amount: expense.amount,
  category: expense.category,
  date: expense.date,
  description: expense.description,
  companyId: expense.companyId,
  userId: expense.userId,
  userName: expense.userName,

  status: "pending",

  approvalLevel: 1,
  totalApprovalLevels: 2,
  currentApproverRole: "manager",

  submittedAt: serverTimestamp(),
});

  return expenseRef.id;
}
interface CompanyData {
  name: string;
  createdBy: string;
}

export async function createCompany(
  companyId: string,
  company: CompanyData
) {
  await setDoc(doc(db, "companies", companyId), {
    name: company.name,
    createdBy: company.createdBy,
    createdAt: serverTimestamp(),
  });
}

interface UserData {
  name: string;
  email: string;
  role: string;
  companyId: string;
}

export async function createUserProfile(
  userId: string,
  user: UserData
) {
  await setDoc(doc(db, "users", userId), {
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    createdAt: serverTimestamp(),
  });
}
export async function getUserProfile(userId: string) {
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    return null;
  }

  return userSnapshot.data();
}

export async function getCompanyStats(companyId: string) {
  const usersSnapshot = await getDocs(
    query(
      collection(db, "users"),
      where("companyId", "==", companyId)
    )
  );

  const expensesSnapshot = await getDocs(
    query(
      collection(db, "expenses"),
      where("companyId", "==", companyId)
    )
  );

  let employees = 0;
  let pendingExpenses = 0;
  let totalReimbursements = 0;

  usersSnapshot.forEach((doc) => {
    const user = doc.data();

    if (user.role === "employee" || user.role === "manager") {
      employees++;
    }
  });

  expensesSnapshot.forEach((doc) => {
    const expense = doc.data();

    if (expense.status === "pending") {
      pendingExpenses++;
    }

    if (expense.status === "approved") {
      totalReimbursements += Number(expense.amount) || 0;
    }
  });

  return {
    employees,
    pendingExpenses,
    totalReimbursements,
  };
}
export async function getCompanyExpenses(companyId: string) {
  const expensesQuery = query(
    collection(db, "expenses"),
    where("companyId", "==", companyId)
  );

  const snapshot = await getDocs(expensesQuery);

  const expenses = snapshot.docs.map((expenseDoc) => ({
    id: expenseDoc.id,
    ...expenseDoc.data(),
  }));

  return expenses;
}

export async function updateExpenseStatus(
  expenseId: string,
  status: string
) {
  const expenseRef = doc(db, "expenses", expenseId);
  const expenseSnap = await getDoc(expenseRef);

  if (!expenseSnap.exists()) {
    throw new Error("Expense not found");
  }

  const expense = expenseSnap.data();

  if (status === "rejected") {
    await updateDoc(expenseRef, {
      status: "rejected",
      rejectedAt: serverTimestamp(),
    });
    return;
  }

  if (status === "approved") {
    const approvalLevel = expense.approvalLevel || 1;
    const totalApprovalLevels =
      expense.totalApprovalLevels || 2;

    if (approvalLevel < totalApprovalLevels) {
      await updateDoc(expenseRef, {
        approvalLevel: approvalLevel + 1,
        currentApproverRole:
          approvalLevel + 1 === totalApprovalLevels
            ? "admin"
            : "manager",
      });
    } else {
      await updateDoc(expenseRef, {
        status: "approved",
        currentApproverRole: null,
        approvedAt: serverTimestamp(),
      });
    }
  }
}


export async function createEmployee(
  employee: UserData
) {
  const employeeRef = await addDoc(
    collection(db, "users"),
    {
      name: employee.name,
      email: employee.email,
      role: employee.role,
      companyId: employee.companyId,
      createdAt: serverTimestamp(),
    }
  );

  return employeeRef.id;
}
export async function getCompanyEmployees(companyId: string) {
  const employeesQuery = query(
    collection(db, "users"),
    where("companyId", "==", companyId)
  );

  const snapshot = await getDocs(employeesQuery);

  return snapshot.docs.map((employeeDoc) => ({
    id: employeeDoc.id,
    ...employeeDoc.data(),
  }));
}

export async function getOrCreateCompanyCode(companyId: string) {
  const companyRef = doc(db, "companies", companyId);
  const companySnap = await getDoc(companyRef);

  if (!companySnap.exists()) {
    throw new Error("Company not found");
  }

  const existingCode = companySnap.data().signupCode;

  if (existingCode) {
    return existingCode as string;
  }

  const signupCode =
    "CLM-" +
    Math.random().toString(36).substring(2, 8).toUpperCase();

  await updateDoc(companyRef, { signupCode });

  return signupCode;
}

export async function getCompanyBySignupCode(code: string) {
  const companyQuery = query(
    collection(db, "companies"),
    where("signupCode", "==", code.trim().toUpperCase())
  );

  const snapshot = await getDocs(companyQuery);

  if (snapshot.empty) {
    return null;
  }

  const companyDoc = snapshot.docs[0];

  return {
    id: companyDoc.id,
    ...companyDoc.data(),
  };
}
