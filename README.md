💼 Expense Management System
🌟 Overview

The Expense Management System is an intelligent full-stack web application built to simplify and automate the expense reimbursement process for organizations. It eliminates manual tracking, reduces human errors, and brings transparency through a multi-level approval workflow.

Employees can easily submit expenses, managers can review and approve claims, and admins can monitor the overall system, ensuring smooth and efficient financial operations.

🚀 Key Features
👨‍💻 For Employees:

✅ Expense Submission – Add expenses with amount, date, category, description, and receipt.
✅ OCR Auto-fill – Upload receipts to automatically extract amount, date, vendor, and other details using OCR.
✅ Expense History – View submitted, approved, and rejected expenses in one place.

👩‍💼 For Managers:

✅ Approval Dashboard – View and manage all pending expense approvals.
✅ Approve/Reject Requests – Take actions with comments and track employee expense status.
✅ Conditional Approvals – Approve based on set rules (percentage, specific approver, or hybrid).

🧑‍💼 For Administrators:

✅ Company Setup – On signup, a company is auto-created with default currency based on the selected country.
✅ User Management – Create, assign, or update roles (Employee/Manager/Admin).
✅ Multi-Level Approvals – Define approval sequences like Manager → Finance → Director.
✅ Rules & Permissions – Configure flexible approval rules and thresholds.
✅ System Overview – View all expenses, manage users, and override approvals if necessary.

🧠 Smart Features

🧾 OCR Integration – Automatically reads receipt details such as amount, date, and vendor name.
💱 Currency Conversion API – Real-time currency conversion via:

Country & Currency API: https://restcountries.com/v3.1/all?fields=name,currencies

Exchange Rate API: https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}
📈 Multi-Stage Workflow – Define and automate complex approval chains.

💻 Technology Stack
Layer	Technology
Frontend	React.js
Backend	Node.js, Express.js
Database	MongoDB
Authentication	JWT
OCR	Optical Character Recognition API / Tesseract.js
Currency API	RESTCountries + ExchangeRate API
Development Tools	Cursor / VS Code
⚙️ Installation & Setup
📌 Prerequisites

Install Node.js & npm

Install and run MongoDB

(Optional) Set up an OCR API key if using external services

🛠 Steps to Run the Project

1️⃣ Clone the Repository:

git clone https://github.com/your-username/expense-management-system.git
cd expense-management-system


2️⃣ Install Dependencies:

npm install bcrypt cloudinary cors dotenv express jsonwebtoken mongodb mongoose multer nodemailer validator


3️⃣ Set Up Environment Variables:
Create a .env file in the server directory and add:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_API_KEY=your_cloudinary_api_key


4️⃣ Run the Backend Server:

npm run server


5️⃣ Run the Frontend:

npm run dev


6️⃣ Access the Application:
🌐 Open http://localhost:5000
 in your browser.

🔮 Future Enhancements

🚀 Expense Analytics Dashboard – Graphical insights on spending trends.
📲 Mobile App Integration – For on-the-go expense management.
💬 Chat-based Approval Workflow – AI-assisted manager decisions.
🌍 Multi-Currency + Tax Calculation – Auto-detect tax rates by country.

📧 Contact Us

For queries or contributions, reach out to:

📩 Vrushibh: rishibh.bhalodiya@gmail.com

📩 Dhruvi: dhruvikalariya2002@gmail.com

💚 Developed with precision and passion by Vrushibh & Dhruvi ✨✨✨
