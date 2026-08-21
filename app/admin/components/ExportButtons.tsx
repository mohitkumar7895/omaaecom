"use client";

import { useState } from "react";

export default function ExportButtons({ tableId, filename = "export" }: { tableId: string, filename?: string }) {
  
  // Extracts data from the HTML table, ignoring the last "Action" column
  const extractTableData = () => {
    const table = document.getElementById(tableId) as HTMLTableElement;
    if (!table) return [];
    
    const rows = Array.from(table.querySelectorAll('tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('th, td'));
      // Remove the last cell if it's the Action column
      if (cells.length > 0) {
        const lastCellText = cells[cells.length - 1].textContent?.trim().toLowerCase();
        // A generic way: just remove the last column for exports assuming it's always Action
        cells.pop();
      }

      return cells.map(cell => {
        const input = cell.querySelector('input:not([type="hidden"])') as HTMLInputElement;
        const select = cell.querySelector('select') as HTMLSelectElement;
        
        if (select) return select.options[select.selectedIndex]?.text || '';
        if (input) return input.value || '';
        
        return cell.textContent?.trim().replace(/\s+/g, ' ') || '';
      });
    });
  };

  const handleCopy = async () => {
    const data = extractTableData();
    const tsv = data.map(row => row.join('\t')).join('\n');
    try {
      await navigator.clipboard.writeText(tsv);
      alert("Table copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy table.");
    }
  };

  const handleExcel = () => {
    const data = extractTableData();
    const csvContent = data.map(row => {
      return row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',');
    }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Opens a clean window with ONLY the table records (no sidebar, no actions)
  const handlePrint = () => {
    const table = document.getElementById(tableId) as HTMLTableElement;
    if (!table) return;

    // Clone the table to manipulate it safely
    const clonedTable = table.cloneNode(true) as HTMLTableElement;
    
    // Remove the last column (Action) from all rows in the cloned table
    const rows = clonedTable.querySelectorAll('tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('th, td');
      if (cells.length > 0) {
        cells[cells.length - 1].remove();
      }
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h2 { text-align: center; color: #333; }
          </style>
        </head>
        <body>
          <h2>${filename.replace(/-/g, ' ').toUpperCase()}</h2>
          ${clonedTable.outerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex items-center space-x-1 text-white no-print">
      <button onClick={handleCopy} className="bg-gray-500 hover:bg-gray-600 px-3 py-1.5 rounded-sm shadow-sm transition text-xs font-medium">
        Copy
      </button>
      <button onClick={handleExcel} className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-sm shadow-sm transition text-xs font-medium">
        Excel
      </button>
      <button onClick={handlePrint} className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-sm shadow-sm transition text-xs font-medium">
        PDF
      </button>
      <button onClick={handlePrint} className="bg-cyan-500 hover:bg-cyan-600 px-3 py-1.5 rounded-sm shadow-sm transition text-xs font-medium">
        Print
      </button>
    </div>
  );
}
