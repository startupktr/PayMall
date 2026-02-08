import * as RNHTMLtoPDF from "react-native-html-to-pdf";
import { Alert, Platform } from "react-native";

type InvoiceItem = {
  name: string;
  hsn: string;
  qty: number;
  rate: number;
  cgst: number;
  sgst: number;
};

type InvoiceData = {
  invoiceNo: string;
  orderId: string;
  invoiceDate: string;
  placeOfSupply: string;

  customerName: string;
  mobile: string;

  items: InvoiceItem[];

  paymentMode: string;
  transactionId: string;
};

export async function generateInvoicePDF(data: InvoiceData) {
  try {
    const itemRows = data.items
      .map((item, index) => {
        const total =
          item.qty * item.rate +
          item.cgst +
          item.sgst;

        return `
        <tr>
          <td>${index + 1}</td>
          <td style="text-align:left;">${item.name}</td>
          <td>${item.hsn}</td>
          <td>${item.qty}</td>
          <td>${item.rate.toFixed(2)}</td>
          <td>${item.cgst.toFixed(2)}</td>
          <td>${item.sgst.toFixed(2)}</td>
          <td><b>${total.toFixed(2)}</b></td>
        </tr>
        `;
      })
      .join("");

    const itemTotal = data.items.reduce(
      (sum, item) => sum + item.qty * item.rate,
      0
    );

    const totalCGST = data.items.reduce(
      (sum, item) => sum + item.cgst,
      0
    );

    const totalSGST = data.items.reduce(
      (sum, item) => sum + item.sgst,
      0
    );

    const grandTotal =
      itemTotal + totalCGST + totalSGST;

    const html = `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 30px;
          color: #111;
        }

        .header {
          display: flex;
          justify-content: space-between;
        }

        .brand {
          font-size: 28px;
          font-weight: bold;
          color: #2563EB;
        }

        hr {
          margin: 15px 0;
        }

        .title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 10px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        th {
          background-color: #2563EB;
          color: white;
          padding: 10px;
          font-size: 13px;
        }

        td {
          padding: 8px;
          border: 1px solid #ddd;
          font-size: 12px;
          text-align: center;
        }

        .right {
          text-align: right;
          font-weight: bold;
          margin-top: 5px;
        }

        .section-title {
          color: #2563EB;
          font-weight: bold;
          margin-top: 20px;
        }

        .footer {
          margin-top: 30px;
          font-size: 12px;
        }

      </style>
    </head>

    <body>

      <div class="header">
        <div>
          <strong>Shopping Mall Superstore</strong><br/>
          123 Main Street, Mumbai, MH - 400001<br/>
          GSTIN: 27ABCDE1234F1Z5<br/>
          FSSAI: 11519003000245
        </div>

        <div class="brand">PayMall</div>
      </div>

      <hr/>

      <div class="title">TAX INVOICE (IN-STORE PURCHASE)</div>

      <p>
        <strong>Invoice No:</strong> ${data.invoiceNo}<br/>
        <strong>Order ID:</strong> ${data.orderId}<br/>
        <strong>Invoice Date:</strong> ${data.invoiceDate}<br/>
        <strong>Place of Supply:</strong> ${data.placeOfSupply}
      </p>

      <hr/>

      <div class="section-title">BILL TO</div>

      <p>
        Customer Name: <strong>${data.customerName}</strong><br/>
        Mobile: ${data.mobile}
      </p>

      <table>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th>HSN</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>CGST</th>
          <th>SGST</th>
          <th>Total</th>
        </tr>
        ${itemRows}
      </table>

      <div class="right">Item Total: ₹${itemTotal.toFixed(2)}</div>
      <div class="right">CGST: ₹${totalCGST.toFixed(2)}</div>
      <div class="right">SGST: ₹${totalSGST.toFixed(2)}</div>
      <div class="right" style="font-size:14px;">
        Invoice Value: ₹${grandTotal.toFixed(2)}
      </div>

      <hr/>

      <p>
        <strong>Payment Mode:</strong> ${data.paymentMode}<br/>
        <strong>Transaction ID:</strong> ${data.transactionId}
      </p>

      <div class="footer">
        This is a system-generated invoice for an in-store purchase.
        <br/><br/>

        <strong>Seller</strong><br/>
        Shopping Mall Superstore,<br/>
        123 Main Street, Mumbai, MH - 400001

        <br/><br/>

        <strong>Platform:</strong><br/>
        PayMall Technologies Pvt. Ltd.<br/>
        Made in India 🇮🇳
      </div>

    </body>
    </html>
    `;

    const options = {
      html,
      fileName: `Invoice_${data.invoiceNo}`,
      directory: Platform.OS === "android" ? "Documents" : undefined,
    }
    const file = await (RNHTMLtoPDF as any).convert(options);

    Alert.alert("Success", "Invoice downloaded successfully!");
    return file.filePath;
  } catch (err) {
    console.log(err);
    Alert.alert("Error", "Invoice generation failed");
  }
}
