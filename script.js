/***********************
 * FIREBASE IMPORTS
 ***********************/
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("DB object:", db);

/***********************
 * DATE RESTRICTION (NO PAST DATES)
 ***********************/
const dateInput = document.getElementById("date");
if (dateInput) {
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
}

/***********************
 * CUSTOMER LOGIN
 ***********************/
function login() {
  const name = document.getElementById("name")?.value.trim();
  const mobile = document.getElementById("mobile")?.value;

  if (!name) {
    alert("Please enter your name");
    return;
  }

  if (mobile.length === 10 && !isNaN(mobile)) {
    localStorage.setItem("currentUser", JSON.stringify({ name, mobile }));
    window.location.href = "order.html";
  } else {
    alert("Enter valid 10-digit mobile number");
  }
}
window.login = login;

/***********************
 * SHOW USER ON ORDER PAGE
 ***********************/
const user = JSON.parse(localStorage.getItem("currentUser"));
if (document.getElementById("userInfo")) {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.getElementById("userInfo").innerText =
      `Customer: ${user.name} | Mobile: ${user.mobile}`;
  }
}

/***********************
 * PLACE ORDER (ONLY ONE FUNCTION)
 ***********************/
async function placeOrder() {
  try {
    if (!user) {
      alert("User not logged in");
      return;
    }

    const address = document.getElementById("address").value.trim();
    const milkType = document.getElementById("milkType").value;
    const quantity = Number(document.getElementById("quantity").value);
    const date = document.getElementById("date").value;
    const payment =
      document.querySelector('input[name="payment"]:checked').value;

    if (!address || !date) {
      alert("Please fill all fields");
      return;
    }

    // 🥛 PRICE LOGIC
    const pricePerLitre = milkType === "cow" ? 70 : 90;
    const totalAmount = pricePerLitre * quantity;

    await addDoc(collection(db, "orders"), {
      name: user.name,
      mobile: user.mobile,
      address,
      milkType,
      quantity,
      pricePerLitre,
      totalAmount,
      date,
      paymentType: payment,
      paymentStatus: "Unpaid",
      createdAt: new Date()
    });

    alert("Order placed successfully!");

    document.getElementById("date").value = "";

  } catch (error) {
    console.error("Firestore error:", error);
    alert("Order failed");
  }
}
window.placeOrder = placeOrder;

/***********************
 * RETAILER LOGIN
 ***********************/
function retailerLogin() {
  const username = document.getElementById("adminUser")?.value;
  const password = document.getElementById("adminPass")?.value;

  if (username === "Anurudh" && password === "Anurudh143") {
    localStorage.setItem("retailerLoggedIn", "true");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid retailer credentials");
  }
}
window.retailerLogin = retailerLogin;

/***********************
 * DASHBOARD SECURITY
 ***********************/
if (window.location.pathname.includes("dashboard.html")) {
  if (localStorage.getItem("retailerLoggedIn") !== "true") {
    window.location.href = "retailer-login.html";
  }
}

/***********************
 * LOAD DASHBOARD
 ***********************/
async function loadDashboard() {
  if (!document.getElementById("ordersTable")) return;

  const tbody = document.querySelector("#ordersTable tbody");
  let total = 0;
  tbody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "orders"));

  snapshot.forEach((docSnap) => {
    const o = docSnap.data();
    const pricePerLitre = o.milkType === "cow" ? 70 : 90;
    const amount = pricePerLitre * o.quantity;
    total += amount;

    tbody.innerHTML += `
      <tr>
        <td>${o.name}</td>
        <td>${o.mobile}</td>
        <td>${o.milkType}</td>
        <td>${o.quantity}</td>
        <td>₹${pricePerLitre}</td>
        <td>₹${amount}</td>
        <td>${o.date}</td>
        <td>${o.paymentType}</td>
        <td>${o.paymentStatus}</td>
        <td>
          ${
            o.paymentStatus === "Unpaid"
              ? `<button onclick="markPaid('${docSnap.id}')">Mark Paid</button>`
              : "Paid"
          }
        </td>
        <td>
          <button onclick="deleteOrder('${docSnap.id}')"
            style="background:red;color:white;border:none;padding:5px;">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  document.getElementById("total").innerText =
    "Estimated Total: ₹" + total;
}
loadDashboard();

/***********************
 * MARK PAID
 ***********************/
async function markPaid(id) {
  await updateDoc(doc(db, "orders", id), {
    paymentStatus: "Paid"
  });
  loadDashboard();
}
window.markPaid = markPaid;

/***********************
 * DELETE ORDER
 ***********************/
async function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;
  await deleteDoc(doc(db, "orders", id));
  loadDashboard();
}
window.deleteOrder = deleteOrder;

/***********************
 * LOGOUT
 ***********************/
function logoutRetailer() {
  localStorage.removeItem("retailerLoggedIn");
  window.location.href = "index.html";
}
window.logoutRetailer = logoutRetailer;