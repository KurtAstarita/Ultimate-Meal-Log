const mealDate = document.getElementById("meal-date");
const mealEntries = document.getElementById("meal-entries");
const confirmationDialog = document.getElementById("confirmation-dialog");
const confirmYes = document.getElementById("confirm-yes");
const confirmNo = document.getElementById("confirm-no");

let mealToRemove = null;

function validateInput(inputId, type, maxLength, required = false) {
  const input = document.getElementById(inputId);
  const value = input ? input.value : "";
  let isValid = true;

  if (required && !value) {
    isValid = false;
  } else if (type === 'number') {
    if (isNaN(value) || parseFloat(value) < 0) {
      isValid = false;
    }
  } else if (type === 'text' && value.length > maxLength) {
    isValid = false;
  } else if (type === 'date' && isNaN(Date.parse(value))) {
    isValid = false;
  }

  if (!isValid && inputId) {
    alert(`Invalid input for ${inputId}.`);
    input.classList.add('invalid-input');
    input.focus();
    return false;
  } else if (inputId) {
    input.classList.remove('invalid-input');
  }
  return isValid;
}

document.getElementById("add-meal").addEventListener("click", () => {
  const meal = document.createElement("div");
  meal.classList.add("meal-entry");
  meal.innerHTML = `
        <input type="text" placeholder="Meal Name" id="mealName-${Date.now()}">
        <input type="time" placeholder="Time" id="time-${Date.now()}">
        <input type="text" placeholder="Ingredients" id="ingredients-${Date.now()}">
        <input type="number" placeholder="Calories" min="0" id="calories-${Date.now()}">
        <input type="text" placeholder="Notes" id="notes-${Date.now()}">
    `;
  mealEntries.appendChild(meal);
});

document.getElementById("remove-meal").addEventListener("click", () => {
  if (mealEntries.children.length > 1) {
    mealToRemove = mealEntries.lastChild;
    confirmationDialog.style.display = "block";
  }
});

confirmYes.addEventListener("click", () => {
  mealEntries.removeChild(mealToRemove);
  confirmationDialog.style.display = "none";
  mealToRemove = null;
});

confirmNo.addEventListener("click", () => {
  confirmationDialog.style.display = "none";
  mealToRemove = null;
});

document.getElementById('save-log').addEventListener('click', () => {
  if (!validateInput('meal-date', 'date', null, true)) {
    return;
  }

  const meals = Array.from(mealEntries.children)
    .slice(1)
    .map(meal => {
      const inputs = Array.from(meal.querySelectorAll("input"));
      if (!validateInput(inputs[0].id || "", 'text', 255, true) ||
          !validateInput(inputs[1].id || "", 'text', 255, true) ||
          !validateInput(inputs[2].id || "", 'text', 255, true) ||
          !validateInput(inputs[3].id || "", 'number', null, true) ||
          !validateInput(inputs[4].id || "", 'text', 255, false)) {
        return null;
      }

      return inputs.map(input => sanitizeInput(input.value));
    }).filter(meal => meal !== null);

  if (meals.some(meal => meal === null)) {
    return;
  }

  const log = {
    date: mealDate.value,
    meals: meals,
  };

  if (!log.date || log.meals.length === 0) {
    alert("Please complete all fields before saving.");
    return;
  }

  localStorage.setItem("mealLog", JSON.stringify(log));
  alert("Meal log saved!");
});

function sanitizeInput(input) {
  return DOMPurify.sanitize(input);
}

document.getElementById("load-log").addEventListener("click", () => {
  const savedLog = localStorage.getItem("mealLog");
  if (!savedLog) return alert("No saved meal log found.");

  const log = JSON.parse(savedLog);
  mealDate.value = log.date || "";

  while (mealEntries.children.length > 1) {
    mealEntries.removeChild(mealEntries.lastChild);
  }

  log.meals.forEach(meal => {
    document.getElementById("add-meal").click();
    const inputFields = mealEntries.lastChild.querySelectorAll("input");
    inputFields.forEach((input, index) => (input.value = meal[index] || ""));
  });
});

document.getElementById("print-pdf").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        alert("jsPDF library not loaded. PDF generation is unavailable.");
        return;
    }

    const doc = new jsPDF();

    try {
        doc.text("Daily Meal Log", 10, 10);
        doc.text(`Log Date: ${document.getElementById("meal-date").value || "No Date"}`, 10, 20);

        let headers = [];
        let rows = [];

        // Extract headers from the first row (header row)
        const headerRow = document.querySelector(".meal-entry.header");
        if (headerRow) {
            headerRow.querySelectorAll("input").forEach(input => {
                headers.push(input.placeholder || "Column"); // Use placeholder or "Column"
            });
        }

        // Extract data rows
        document.querySelectorAll(".meal-entry:not(.header)").forEach(meal => {
            const inputs = meal.querySelectorAll("input");
            let rowData = [];
            inputs.forEach(input => {
                rowData.push(input.value || "N/A");
            });
            rows.push(rowData);
        });

        // Use autoTable to create the table
        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 30, // Start table below the date
            styles: {
                fontSize: 8, // Smaller font size
                cellPadding: 2, // Reduce cell padding
            },
            headStyles: {
                fontSize: 8,
                fillColor: [200, 200, 200], // Light gray header
            },
        });

        doc.save("meal_log.pdf");

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while generating the PDF.");
    }
});

document.getElementById("download-log").addEventListener("click", () => {
  const log = localStorage.getItem("mealLog");
  if (!log) return alert("No workout log to download. You must add entries & fill them out, then click 'Save' before you can download!");

  const blob = new Blob([log], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mealLog.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById("upload-log").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsedData = JSON.parse(e.target.result);

      if (typeof parsedData !== 'object' || parsedData === null ||
          !parsedData.hasOwnProperty('date') || !parsedData.hasOwnProperty('meals') || !Array.isArray(parsedData.meals)) {
        throw new Error("Invalid meal log structure.");
      }

      for (const meal of parsedData.meals) {
        if (!Array.isArray(meal) || meal.length !== 5) {
          throw new Error("Invalid meal entry structure.");
        }
      }

      localStorage.setItem("mealLog", JSON.stringify(parsedData));
      document.getElementById("load-log").click();
      alert("Meal log uploaded!");

    } catch (error) {
      alert("Invalid file uploaded: " + error.message);
    }
  };
  reader.readAsText(file);
});

const footerLinks = document.querySelectorAll('footer a');

footerLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    window.parent.location.href = link.href;
  });
});
