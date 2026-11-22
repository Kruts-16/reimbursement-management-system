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
import { auth } from "./config";
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
  groupId: string;
}

export async function addExpense(expense: ExpenseData) {
  // Find the employee's assigned group
  const groupRef = doc(db, "groups", expense.groupId);
  const groupSnap = await getDoc(groupRef);

  if (!groupSnap.exists()) {
    throw new Error("Employee group not found.");
  }

  const group = groupSnap.data();

  if (group.companyId !== expense.companyId) {
    throw new Error("Invalid employee group.");
  }

  if (!group.managerId) {
    throw new Error("No manager assigned to this group.");
  }

  if (!Number.isFinite(expense.amount) || expense.amount <= 0) {
    throw new Error("Please enter a valid expense amount.");
  }

  // ₹5,000 and above requires admin approval
  const requiresAdminApproval = expense.amount >= 5000;

  const expenseRef = await addDoc(collection(db, "expenses"), {
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    description: expense.description,

    companyId: expense.companyId,
    userId: expense.userId,
    userName: expense.userName,

    groupId: expense.groupId,
    assignedManagerId: group.managerId,

    status: "pending",
    approvalLevel: 1,
    totalApprovalLevels: requiresAdminApproval ? 2 : 1,
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
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in first.");
  }

  const profile = await getUserProfile(user.uid);

  if (!profile) {
    throw new Error("User profile not found.");
  }

  const expenseRef = doc(db, "expenses", expenseId);
  const expenseSnap = await getDoc(expenseRef);

  if (!expenseSnap.exists()) {
    throw new Error("Expense not found.");
  }

  const expense = expenseSnap.data();

  if (expense.companyId !== profile.companyId) {
    throw new Error("You cannot access this expense.");
  }

  if (expense.status !== "pending") {
    throw new Error("This expense is no longer pending.");
  }

  const isManager = profile.role === "manager";
  const isAdmin = profile.role === "admin";

  if (status === "rejected") {
    if (isManager) {
      if (
        expense.currentApproverRole !== "manager" ||
        expense.assignedManagerId !== user.uid
      ) {
        throw new Error("This expense is not assigned to you.");
      }
    } else if (isAdmin) {
      if (expense.currentApproverRole !== "admin") {
        throw new Error("This expense is not awaiting admin approval.");
      }
    } else {
      throw new Error("You are not authorized to reject expenses.");
    }

    await updateDoc(expenseRef, {
      status: "rejected",
      rejectedBy: user.uid,
      rejectedAt: serverTimestamp(),
    });

    return;
  }

  if (status !== "approved") {
    throw new Error("Invalid approval status.");
  }

  // Manager approval
  if (isManager) {
    if (
      expense.currentApproverRole !== "manager" ||
      expense.assignedManagerId !== user.uid
    ) {
      throw new Error("This expense is not assigned to you.");
    }

    const requiresAdminApproval = Number(expense.amount) >= 5000;

    if (requiresAdminApproval) {
      await updateDoc(expenseRef, {
        approvalLevel: 2,
        currentApproverRole: "admin",
        managerApprovedBy: user.uid,
        managerApprovedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(expenseRef, {
        status: "approved",
        approvalLevel: 1,
        currentApproverRole: null,
        managerApprovedBy: user.uid,
        managerApprovedAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
      });
    }

    return;
  }

  // Admin final approval
  if (isAdmin) {
    if (expense.currentApproverRole !== "admin") {
      throw new Error("This expense is not awaiting admin approval.");
    }

    await updateDoc(expenseRef, {
      status: "approved",
      approvalLevel: 2,
      currentApproverRole: null,
      adminApprovedBy: user.uid,
      adminApprovedAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
    });

    return;
  }

  throw new Error("You are not authorized to approve expenses.");
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

export async function createGroup(
  name: string,
  companyId: string,
  managerId: string
) {
  const groupRef = await addDoc(collection(db, "groups"), {
    name,
    companyId,
    managerId,
    createdAt: serverTimestamp(),
  });

  return groupRef.id;
}

export async function getCompanyGroups(companyId: string) {
  const groupsQuery = query(
    collection(db, "groups"),
    where("companyId", "==", companyId)
  );

  const snapshot = await getDocs(groupsQuery);

  return snapshot.docs.map((groupDoc) => ({
    id: groupDoc.id,
    ...groupDoc.data(),
  }));
}

export async function assignEmployeeToGroup(
  employeeId: string,
  groupId: string
) {
  await updateDoc(doc(db, "users", employeeId), {
    groupId,
  });
}

export async function createManagerRequest(
  userId: string,
  user: {
    name: string;
    email: string;
    companyId: string;
  }
) {
  await setDoc(doc(db, "users", userId), {
    name: user.name,
    email: user.email,
    companyId: user.companyId,
    role: "pending_manager",
    requestedRole: "manager",
    accountStatus: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function approveManagerRequest(managerId: string) {
  const managerRef = doc(db, "users", managerId);
  const managerSnap = await getDoc(managerRef);

  if (!managerSnap.exists()) {
    throw new Error("Manager request not found.");
  }

  const manager = managerSnap.data();

  if (manager.role !== "pending_manager") {
    throw new Error("This account is not a pending manager request.");
  }

  await updateDoc(managerRef, {
    role: "manager",
    accountStatus: "approved",
    approvedAt: serverTimestamp(),
  });
}
