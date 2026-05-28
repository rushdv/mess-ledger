"use client";

import { useState } from "react";
import { 
  BookOpen, Home, Users, ShoppingCart, Zap, DollarSign, 
  Receipt, FileText, BarChart3, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, AlertCircle, Download
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

export default function HelpPage() {
  const [openSection, setOpenSection] = useState<string | null>("getting-started");

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const lineHeight = 7;
    let yPos = margin;

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }
      
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight;
      });
    };

    const addSpace = (space: number = 5) => {
      yPos += space;
    };

    // Title Page
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("MESS LEDGER", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("Byabohar Nirdesika", pageWidth / 2, 30, { align: "center" });
    
    yPos = 50;
    doc.setTextColor(0, 0, 0);

    // Introduction
    addText("Mess Ledger ki?", 18, true);
    addSpace(3);
    addText("Mess Ledger holo ekta sampurno mess management system jekhane apni apnar mess er sokol hisab-nikash sohoje rakhte parben. Khabar, bazar, bill, payment - sob kisur hisab ek jaygate!");
    addSpace(8);

    // Getting Started
    addText("Shuru Kora (Getting Started)", 16, true);
    addSpace(5);
    
    addText("1. Account Toiri Korun", 13, true);
    addSpace(2);
    addText("Email diye:", 11, true);
    addText("Apnar email ebong password diye sign up korun");
    addSpace(2);
    addText("Google diye:", 11, true);
    addText("Sorasori Google account diye login korun");
    addSpace(5);

    addText("2. Mess Toiri ba Join Korun", 13, true);
    addSpace(2);
    addText("Notun Mess toiri korte:", 11, true);
    addText("1. Login korar por 'Create New Mess' e click korun");
    addText("2. Mess er nam din (jemon: 'Dhaka Hostel Mess')");
    addText("3. Ekta unique code toiri korun (jemon: 'DHAKA2024')");
    addText("4. Create korun - apni automatically Admin hoye jaben");
    addSpace(3);
    addText("Bidyoman Mess e Join korte:", 11, true);
    addText("1. 'Join Existing Mess' e click korun");
    addText("2. Mess er code ta likhun (Admin er kach theke nin)");
    addText("3. Join korun - apni Member hisebe jukto hoben");
    addSpace(8);

    // User Roles
    addText("User Roles (Bhumika)", 16, true);
    addSpace(5);
    
    addText("Admin (Proshashok)", 13, true);
    addSpace(2);
    addText("- Mess toiri koren");
    addText("- Sob kisu add, edit, delete korte paren");
    addText("- Member der Moderator banaite paren");
    addText("- Sampurno niyontron");
    addSpace(4);

    addText("Moderator", 13, true);
    addSpace(2);
    addText("- Admin er moto pray sob access");
    addText("- Meal, cost, payment add/remove korte paren");
    addText("- Shudhu member der role change korte paren na");
    addSpace(4);

    addText("Member (Sodosso)", 13, true);
    addSpace(2);
    addText("- Shudhu dekhte paren");
    addText("- Nijer meal count dekhte paren");
    addText("- Report dekhte paren");
    addText("- Kisu add/edit/delete korte paren na");
    addSpace(8);

    // Main Features
    addText("Mul Features", 16, true);
    addSpace(5);

    addText("1. Meals (Khabar)", 13, true);
    addSpace(2);
    addText("Ki korte parben:");
    addText("- Protidin er breakfast, lunch, dinner count kora");
    addText("- Kon member kotota khabar kheyeche dekha");
    addText("- Month wise meal summary dekha");
    addSpace(2);
    addText("Kivabe byabohar korben:");
    addText("1. Sidebar theke 'Meals' e jan");
    addText("2. Month/Year select korun");
    addText("3. Admin/Moderator: 'Add Meal' button e click korun");
    addText("4. Date select korun");
    addText("5. Member select korun");
    addText("6. Breakfast, Lunch, Dinner er sonkha din");
    addText("7. 'Add Meal' e click korun");
    addSpace(2);
    addText("Tips:");
    addText("- Ekoi dine ekoi member er jonno ekadik entry korte parben na");
    addText("- Edit korte chaile delete kore notun kore add korun");
    addSpace(5);

    addText("2. Bazar", 13, true);
    addSpace(2);
    addText("Ki korte parben:");
    addText("- Protidin er bazar khoroch record kora");
    addText("- Kon din koto taka khoroch hoyeche dekha");
    addText("- Total bazar cost dekha");
    addSpace(2);
    addText("Kivabe byabohar korben:");
    addText("1. Sidebar theke 'Bazar' e jan");
    addText("2. Month/Year select korun");
    addText("3. Admin/Moderator: 'Add Entry' button e click korun");
    addText("4. Date select korun (kobe bazar korechhen)");
    addText("5. Amount likhun (taka)");
    addText("6. Description likhun (optional - jemon: 'Sobji, mach, chal')");
    addText("7. 'Add Entry' e click korun");
    addSpace(2);
    addText("Tips:");
    addText("- Protidin bazar korar por entry korun");
    addText("- Description e ki ki kinechhen likhe rakhun");
    addSpace(5);

    addText("3. Utility (Bill)", 13, true);
    addSpace(2);
    addText("Ki korte parben:");
    addText("- Electricity, Gas, Water, Internet, Dust bill record kora");
    addText("- Type onujayi khoroch dekha");
    addText("- Total utility cost dekha");
    addSpace(2);
    addText("Kivabe byabohar korben:");
    addText("1. Sidebar theke 'Utility' te jan");
    addText("2. Month/Year select korun");
    addText("3. Admin/Moderator: 'Add Entry' button e click korun");
    addText("4. Date select korun (kobe bill diyechhen)");
    addText("5. Type select korun:");
    addText("   - Electricity (Bidyut bill)");
    addText("   - Gas (Gas bill)");
    addText("   - Water (Pani bill)");
    addText("   - Internet (Internet bill)");
    addText("   - Dust Bill (Dust bill)");
    addText("   - Other (Onnanno)");
    addText("6. Amount likhun");
    addText("7. Description likhun (optional)");
    addText("8. 'Add Entry' e click korun");
    addSpace(2);
    addText("Tips:");
    addText("- Proti mashe bill ashar por entry korun");
    addText("- Description e bill number ba meter reading likhte paren");
    addSpace(5);

    addText("4. Payments (Payment)", 13, true);
    addSpace(2);
    addText("Ki korte parben:");
    addText("- Member der payment/deposit record kora");
    addText("- Ke koto taka diyeche dekha");
    addText("- Total payment dekha");
    addSpace(2);
    addText("Kivabe byabohar korben:");
    addText("1. Sidebar theke 'Payments' e jan");
    addText("2. Month/Year select korun");
    addText("3. Admin/Moderator: 'Add Payment' button e click korun");
    addText("4. Date select korun");
    addText("5. Member select korun");
    addText("6. Amount likhun");
    addText("7. Note likhun (optional - jemon: 'May masher advance')");
    addText("8. 'Add Payment' e click korun");
    addSpace(2);
    addText("Tips:");
    addText("- Member payment korar shathe shathe entry korun");
    addText("- Note e payment method likhte paren (bKash, Cash, etc.)");
    addSpace(5);

    addText("5. Individual Cost (Byaktigoto Khoroch)", 13, true);
    addSpace(2);
    addText("Ki korte parben:");
    addText("- Kono specific member er personal khoroch record kora");
    addText("- Jemon: Osudh, personal grocery, etc.");
    addSpace(2);
    addText("Kivabe byabohar korben:");
    addText("1. Sidebar theke 'Individual Cost' e jan");
    addText("2. Month/Year select korun");
    addText("3. Admin/Moderator: 'Add Cost' button e click korun");
    addText("4. Date select korun");
    addText("5. Member select korun (jar jonno khoroch)");
    addText("6. Amount likhun");
    addText("7. Description likhun (ki khoroch hoyeche)");
    addText("8. 'Add Cost' e click korun");
    addSpace(2);
    addText("Tips:");
    addText("- Shudhu sei khoroch ja ekjon member er jonno specific");
    addText("- Description e clearly likhun ki khoroch hoyeche");
    addSpace(5);

    addText("6. Shared Cost (Share Kora Khoroch)", 13, true);
    addSpace(2);
    addText("Ki korte parben:");
    addText("- Kisu member er moddhe bhag kora khoroch record kora");
    addText("- Jemon: Koyekjon mile baire kheyechhen");
    addSpace(2);
    addText("Kivabe byabohar korben:");
    addText("1. Sidebar theke 'Shared Cost' e jan");
    addText("2. Month/Year select korun");
    addText("3. Admin/Moderator: 'Add Cost' button e click korun");
    addText("4. Date select korun");
    addText("5. Total amount likhun");
    addText("6. Description likhun");
    addText("7. Je member ra share korbe tader select korun");
    addText("8. 'Add Cost' e click korun");
    addSpace(2);
    addText("Tips:");
    addText("- Amount automatically selected member der moddhe bhag hobe");
    addText("- Jara khoroche ongsho niyeche shudhu tader select korun");
    addSpace(5);

    addText("7. Report (Report)", 13, true);
    addSpace(2);
    addText("Ki dekhte paben:");
    addText("- Puro masher sampurno hisab");
    addText("- Prottek member er:");
    addText("  * Total meals");
    addText("  * Meal cost");
    addText("  * Utility share");
    addText("  * Individual cost");
    addText("  * Shared cost");
    addText("  * Total paid");
    addText("  * Due/Advance");
    addText("- Meal rate (per meal koto taka)");
    addText("- Utility per head");
    addSpace(2);
    addText("Kivabe byabohar korben:");
    addText("1. Sidebar theke 'Report' e jan");
    addText("2. Month/Year select korun");
    addText("3. 'Calculate Report' button e click korun");
    addText("4. Sampurno hisab dekhun");
    addText("5. PDF Download: 'Export PDF' button e click korun");
    addSpace(2);
    addText("Tips:");
    addText("- Mash sheshe report calculate korun");
    addText("- PDF download kore shobar shathe share korun");
    addText("- Due thakle lal ronge, advance thakle shobuj ronge dekhabe");
    addSpace(8);

    // Monthly Workflow
    addText("Mashik Kajer Flow", 16, true);
    addSpace(5);

    addText("Masher Shurute:", 13, true);
    addSpace(2);
    addText("1. Notun month select korun");
    addText("2. Shob member active ache kina check korun");
    addSpace(4);

    addText("Protidin:", 13, true);
    addSpace(2);
    addText("1. Meals: Protidin er meal count entry korun");
    addText("2. Bazar: Bazar korar por khoroch entry korun");
    addSpace(4);

    addText("Masher Majhe:", 13, true);
    addSpace(2);
    addText("1. Utility: Bill ashle entry korun");
    addText("2. Payments: Member payment korle entry korun");
    addText("3. Individual/Shared Cost: Proyojon onujayi entry korun");
    addSpace(4);

    addText("Mash Sheshe:", 13, true);
    addSpace(2);
    addText("1. Report: Calculate korun");
    addText("2. PDF: Download korun");
    addText("3. Shobar shathe share korun");
    addText("4. Due collect korun");
    addSpace(8);

    // Tips & Best Practices
    addText("Tips & Best Practices", 16, true);
    addSpace(5);

    addText("Koronio:", 13, true);
    addSpace(2);
    addText("- Protidin meal ebong bazar entry korun");
    addText("- Payment pawar shathe shathe entry korun");
    addText("- Mash sheshe report calculate korun");
    addText("- PDF download kore backup rakhun");
    addText("- Description clearly likhun");
    addSpace(4);

    addText("Borjonio:", 13, true);
    addSpace(2);
    addText("- Bhul date select korben na");
    addText("- Future date select korben na");
    addText("- Duplicate entry korben na");
    addText("- Member role randomly change korben na");
    addSpace(8);

    // Permissions Table
    addText("Quick Reference - Permissions", 16, true);
    addSpace(5);
    addText("Feature          | Admin | Moderator | Member", 10, true);
    addText("----------------------------------------------");
    addText("View Data        |   Yes |    Yes    |  Yes");
    addText("Add Meals        |   Yes |    Yes    |  No");
    addText("Add Bazar        |   Yes |    Yes    |  No");
    addText("Add Utility      |   Yes |    Yes    |  No");
    addText("Add Payment      |   Yes |    Yes    |  No");
    addText("Add Costs        |   Yes |    Yes    |  No");
    addText("View Report      |   Yes |    Yes    |  Yes");
    addText("Export PDF       |   Yes |    Yes    |  Yes");
    addText("Change Roles     |   Yes |    No     |  No");
    addText("Delete Entries   |   Yes |    Yes    |  No");
    addSpace(8);

    // Conclusion
    addText("Shuru Korun!", 16, true);
    addSpace(3);
    addText("Ekhon apni Mess Ledger byabohar korte prostut!");
    addSpace(2);
    addText("1. Login korun");
    addText("2. Mess toiri ba join korun");
    addText("3. Data entry shuru korun");
    addText("4. Mash sheshe report dekhun");
    addSpace(5);
    addText("Happy Managing!", 14, true);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.text(`Prishtha ${i} / ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      doc.text("Mess Ledger - Byabohar Nirdesika", margin, pageHeight - 10);
      doc.text("May 2026", pageWidth - margin, pageHeight - 10, { align: "right" });
    }

    // Save PDF
    doc.save("Mess_Ledger_Byabohar_Nirdesika.pdf");
  };

  const sections: Section[] = [
    {
      id: "getting-started",
      title: "Getting Started (শুরু করা) ",
      icon: Home,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">১. একাউন্ট তৈরি করুন</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li><strong>Email দিয়ে:</strong> আপনার email এবং password দিয়ে sign up করুন</li>
              <li><strong>Google দিয়ে:</strong> সরাসরি Google account দিয়ে login করুন</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">২. Mess তৈরি বা Join করুন</h4>
            <div className="space-y-3 ml-4">
              <div>
                <p className="text-sm font-medium">নতুন Mess তৈরি করতে:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Login করার পর "Create New Mess" এ ক্লিক করুন</li>
                  <li>Mess এর নাম দিন (যেমন: "Dhaka Hostel Mess")</li>
                  <li>একটা unique code তৈরি করুন (যেমন: "DHAKA2024")</li>
                  <li>Create করুন - আপনি automatically Admin হয়ে যাবেন</li>
                </ol>
              </div>
              <div>
                <p className="text-sm font-medium">বিদ্যমান Mess এ Join করতে:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>"Join Existing Mess" এ ক্লিক করুন</li>
                  <li>Mess এর code টা লিখুন (Admin এর কাছ থেকে নিন)</li>
                  <li>Join করুন - আপনি Member হিসেবে যুক্ত হবেন</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "roles",
      title: "User Roles (ভূমিকা)",
      icon: Users,
      content: (
        <div className="space-y-3">
          <div className="rounded-lg border p-3 bg-amber-50 dark:bg-amber-950">
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <span className="text-amber-600">🔱</span> Admin (প্রশাসক)
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Mess তৈরি করেন</li>
              <li>সব কিছু add, edit, delete করতে পারেন</li>
              <li>Member দের Moderator বানাতে পারেন</li>
              <li>সম্পূর্ণ নিয়ন্ত্রণ</li>
            </ul>
          </div>
          <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950">
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <span className="text-blue-600">🛡️</span> Moderator (মডারেটর)
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Admin এর মতো প্রায় সব access</li>
              <li>Meal, cost, payment add/remove করতে পারেন</li>
              <li>শুধু member দের role change করতে পারেন না</li>
            </ul>
          </div>
          <div className="rounded-lg border p-3 bg-gray-50 dark:bg-gray-900">
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <span className="text-gray-600">👤</span> Member (সদস্য)
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>শুধু দেখতে পারেন</li>
              <li>নিজের meal count দেখতে পারেন</li>
              <li>Report দেখতে পারেন</li>
              <li>কিছু add/edit/delete করতে পারেন না</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "meals",
      title: "Meals (খাবার)",
      icon: Receipt,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">প্রতিদিনের breakfast, lunch, dinner count করুন</p>
          <div>
            <h4 className="font-semibold mb-2">কিভাবে ব্যবহার করবেন:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Sidebar থেকে "Meals" এ যান</li>
              <li>Month/Year select করুন</li>
              <li><strong>Admin/Moderator:</strong> "Add Meal" button এ ক্লিক করুন</li>
              <li>Date select করুন</li>
              <li>Member select করুন</li>
              <li>Breakfast, Lunch, Dinner এর সংখ্যা দিন</li>
              <li>"Add Meal" এ ক্লিক করুন</li>
            </ol>
          </div>
          <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300 ml-4 mt-1">
              <li>একই দিনে একই member এর জন্য একাধিক entry করতে পারবেন না</li>
              <li>Edit করতে চাইলে delete করে নতুন করে add করুন</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "bazar",
      title: "Bazar (বাজার)",
      icon: ShoppingCart,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">প্রতিদিনের bazar খরচ record করুন</p>
          <div>
            <h4 className="font-semibold mb-2">কিভাবে ব্যবহার করবেন:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Sidebar থেকে "Bazar" এ যান</li>
              <li>Month/Year select করুন</li>
              <li><strong>Admin/Moderator:</strong> "Add Entry" button এ ক্লিক করুন</li>
              <li>Date select করুন (কবে bazar করেছেন)</li>
              <li>Amount লিখুন (টাকা)</li>
              <li>Description লিখুন (optional - যেমন: "সবজি, মাছ, চাল")</li>
              <li>"Add Entry" এ ক্লিক করুন</li>
            </ol>
          </div>
          <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300 ml-4 mt-1">
              <li>প্রতিদিন bazar করার পর entry করুন</li>
              <li>Description এ কি কি কিনেছেন লিখে রাখুন</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "utility",
      title: "Utility (বিল)",
      icon: Zap,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Electricity, Gas, Water, Internet, Dust bill record করুন</p>
          <div>
            <h4 className="font-semibold mb-2">কিভাবে ব্যবহার করবেন:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Sidebar থেকে "Utility" তে যান</li>
              <li>Month/Year select করুন</li>
              <li><strong>Admin/Moderator:</strong> "Add Entry" button এ ক্লিক করুন</li>
              <li>Date select করুন (কবে bill দিয়েছেন)</li>
              <li>Type select করুন (Electricity, Gas, Water, Internet, Dust Bill, Other)</li>
              <li>Amount লিখুন</li>
              <li>Description লিখুন (optional)</li>
              <li>"Add Entry" এ ক্লিক করুন</li>
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="text-xs p-2 rounded border">⚡ Electricity - বিদ্যুৎ বিল</div>
            <div className="text-xs p-2 rounded border">🔥 Gas - গ্যাস বিল</div>
            <div className="text-xs p-2 rounded border">💧 Water - পানি বিল</div>
            <div className="text-xs p-2 rounded border">📡 Internet - ইন্টারনেট বিল</div>
            <div className="text-xs p-2 rounded border">🗑️ Dust Bill - ডাস্ট বিল</div>
            <div className="text-xs p-2 rounded border">⋯ Other - অন্যান্য</div>
          </div>
        </div>
      ),
    },
    {
      id: "payments",
      title: "Payments (পেমেন্ট)",
      icon: DollarSign,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Member দের payment/deposit record করুন</p>
          <div>
            <h4 className="font-semibold mb-2">কিভাবে ব্যবহার করবেন:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Sidebar থেকে "Payments" এ যান</li>
              <li>Month/Year select করুন</li>
              <li><strong>Admin/Moderator:</strong> "Add Payment" button এ ক্লিক করুন</li>
              <li>Member select করুন</li>
              <li>Amount লিখুন</li>
              <li>Note লিখুন (optional - যেমন: "May মাসের advance")</li>
              <li>"Add Payment" এ ক্লিক করুন</li>
            </ol>
          </div>
          <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300 ml-4 mt-1">
              <li>Member payment করার সাথে সাথে entry করুন</li>
              <li>Note এ payment method লিখতে পারেন (bKash, Cash, etc.)</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "report",
      title: "Report (রিপোর্ট)",
      icon: BarChart3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">পুরো মাসের সম্পূর্ণ হিসাব দেখুন</p>
          <div>
            <h4 className="font-semibold mb-2">কি দেখতে পাবেন:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>প্রতিটি member এর total meals</li>
              <li>Meal cost (meals × meal rate)</li>
              <li>Utility share (utility ÷ members)</li>
              <li>Individual cost (personal charges)</li>
              <li>Shared cost (split among selected members)</li>
              <li>Total paid</li>
              <li>Due/Advance (লাল = বাকি, সবুজ = advance)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">কিভাবে ব্যবহার করবেন:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Sidebar থেকে "Report" এ যান</li>
              <li>Month/Year select করুন</li>
              <li>"Calculate Report" button এ ক্লিক করুন</li>
              <li>সম্পূর্ণ হিসাব দেখুন</li>
              <li><strong>PDF Download:</strong> "Export PDF" button এ ক্লিক করুন</li>
            </ol>
          </div>
          <div className="rounded-lg border p-3 bg-green-50 dark:bg-green-950">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">✅ Best Practice:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-300 ml-4 mt-1">
              <li>মাস শেষে report calculate করুন</li>
              <li>PDF download করে সবার সাথে share করুন</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "monthly-flow",
      title: "মাসিক কাজের Flow",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              মাসের শুরুতে:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>নতুন month select করুন</li>
              <li>সব member active আছে কিনা check করুন</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              প্রতিদিন:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li><strong>Meals:</strong> প্রতিদিনের meal count entry করুন</li>
              <li><strong>Bazar:</strong> bazar করার পর খরচ entry করুন</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              মাসের মাঝে:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li><strong>Utility:</strong> bill আসলে entry করুন</li>
              <li><strong>Payments:</strong> member payment করলে entry করুন</li>
              <li><strong>Individual/Shared Cost:</strong> প্রয়োজন অনুযায়ী entry করুন</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
              মাস শেষে:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li><strong>Report:</strong> Calculate করুন</li>
              <li><strong>PDF:</strong> Download করুন</li>
              <li>সবার সাথে share করুন</li>
              <li>Due collect করুন</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "tips",
      title: "Tips & Best Practices",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border p-3 bg-green-50 dark:bg-green-950">
            <h4 className="font-semibold flex items-center gap-2 mb-2 text-green-900 dark:text-green-100">
              <CheckCircle2 className="h-4 w-4" />
              করণীয়:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-300 ml-4">
              <li>প্রতিদিন meal এবং bazar entry করুন</li>
              <li>Payment পাওয়ার সাথে সাথে entry করুন</li>
              <li>মাস শেষে report calculate করুন</li>
              <li>PDF download করে backup রাখুন</li>
              <li>Description clearly লিখুন</li>
            </ul>
          </div>
          <div className="rounded-lg border p-3 bg-red-50 dark:bg-red-950">
            <h4 className="font-semibold flex items-center gap-2 mb-2 text-red-900 dark:text-red-100">
              <XCircle className="h-4 w-4" />
              বর্জনীয়:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300 ml-4">
              <li>ভুল date select করবেন না</li>
              <li>Future date select করবেন না</li>
              <li>Duplicate entry করবেন না</li>
              <li>Member role randomly change করবেন না</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Help & Guide
          </h1>
          <p className="text-muted-foreground">Mess Ledger কিভাবে ব্যবহার করবেন</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download PDF Guide</span>
          <span className="sm:hidden">Download PDF</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">User Roles</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 dark:bg-green-900 p-2">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">7</p>
              <p className="text-xs text-muted-foreground">Main Features</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900 p-2">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">PDF</p>
              <p className="text-xs text-muted-foreground">Export Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = openSection === section.id;
          
          return (
            <div key={section.id} className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-left">{section.title}</h3>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              
              {isOpen && (
                <div className="border-t p-4 bg-muted/20">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Permissions Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Quick Reference - Permissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-sm font-semibold">Feature</th>
                <th className="text-center p-3 text-sm font-semibold">Admin</th>
                <th className="text-center p-3 text-sm font-semibold">Moderator</th>
                <th className="text-center p-3 text-sm font-semibold">Member</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { feature: "View Data", admin: true, moderator: true, member: true },
                { feature: "Add Meals", admin: true, moderator: true, member: false },
                { feature: "Add Bazar", admin: true, moderator: true, member: false },
                { feature: "Add Utility", admin: true, moderator: true, member: false },
                { feature: "Add Payment", admin: true, moderator: true, member: false },
                { feature: "Add Costs", admin: true, moderator: true, member: false },
                { feature: "View Report", admin: true, moderator: true, member: true },
                { feature: "Export PDF", admin: true, moderator: true, member: true },
                { feature: "Change Roles", admin: true, moderator: false, member: false },
                { feature: "Delete Entries", admin: true, moderator: true, member: false },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="p-3 text-sm">{row.feature}</td>
                  <td className="p-3 text-center">
                    {row.admin ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {row.moderator ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {row.member ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
        <h3 className="text-xl font-bold mb-2">শুরু করুন! 🎉</h3>
        <p className="text-muted-foreground mb-4">
          এখন আপনি Mess Ledger ব্যবহার করতে প্রস্তুত!
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-primary/20">Login করুন</span>
          <span className="px-3 py-1 rounded-full bg-primary/20">Mess তৈরি/Join করুন</span>
          <span className="px-3 py-1 rounded-full bg-primary/20">Data entry শুরু করুন</span>
          <span className="px-3 py-1 rounded-full bg-primary/20">Report দেখুন</span>
        </div>
      </div>
    </div>
  );
}
