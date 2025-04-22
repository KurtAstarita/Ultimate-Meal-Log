const mealDate = document.getElementById("meal-date");
const mealEntries = document.getElementById("meal-entries");
const confirmationDialog = document.getElementById("confirmation-dialog");
const confirmYes = document.getElementById("confirm-yes");
const confirmNo = document.getElementById("confirm-no");

let mealToRemove = null;
let lastSaveTime = 0;
const saveInterval = 2000; // 2 seconds

function validateInput(inputId, type, maxLength, required = false) {
    const input = document.getElementById(inputId);
    const value = input ? input.value : "";
    let isValid = true;
    let errorMessage = "";

    if (required && !value) {
        isValid = false;
        errorMessage = `Please fill out the ${inputId.replace('-', ' ')} field.`;
    } else if (type === 'number') {
        if (isNaN(value) || parseInt(value) < 0) {
            isValid = false;
            errorMessage = `Invalid number for ${inputId.replace('-', ' ')}. Must be a non-negative integer.`;
        }
    } else if (type === 'text' && value.length > maxLength) {
        isValid = false;
        errorMessage = `${inputId.replace('-', ' ')} cannot exceed ${maxLength} characters.`;
    } else if (type === 'time') {
        if (!/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
            isValid = false;
            errorMessage = `Invalid time format for ${inputId.replace('-', ' ')}. Use HH:MM (24-hour format).`;
        }
    } else if (type === 'date' && isNaN(Date.parse(value))) {
        isValid = false;
        errorMessage = `Invalid date for ${inputId.replace('-', ' ')}.`;
    }

    if (!isValid && inputId) {
        alert(errorMessage);
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
        <input type="text" placeholder="HH:MM" id="mealTime-${Date.now()}">
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
    const currentTime = Date.now();
    if (currentTime - lastSaveTime < saveInterval) {
        alert("Please wait a moment before saving again.");
        return;
    }

    if (!validateInput('meal-date', 'date', null, true)) {
        return;
    }

    const entries = Array.from(mealEntries.children)
        .slice(1)
        .map(entry => {
            const inputs = Array.from(entry.querySelectorAll("input"));
            const mealNameValid = validateInput(inputs[0].id || "", 'text', 255, true);
            const mealTimeValid = validateInput(inputs[1].id || "", 'time', null, true);
            const ingredientsValid = validateInput(inputs[2].id || "", 'text', 1000, true); // Increased max length for ingredients
            const caloriesValid = validateInput(inputs[3].id || "", 'number', null, true);
            const notesValid = validateInput(inputs[4].id || "", 'text', 255, false);

            if (!mealNameValid || !mealTimeValid || !ingredientsValid || !caloriesValid || !notesValid) {
                return null;
            }

            return inputs.map(input => sanitizeInput(input.value));
        }).filter(entry => entry !== null);

    if (entries.some(entry => entry === null)) {
        return;
    }

    const log = {
        date: mealDate.value,
        entries: entries,
    };

    if (!log.date || log.entries.length === 0) {
        alert("Please complete all fields before saving.");
        return;
    }

    localStorage.setItem("mealLog", JSON.stringify(log));
    alert("Meal log saved!");
    lastSaveTime = currentTime;
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

    log.entries.forEach(entry => {
        document.getElementById("add-meal").click();
        const inputFields = mealEntries.lastChild.querySelectorAll("input");
        inputFields.forEach((input, index) => (input.value = entry[index] || ""));
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

        let headers = ["Meal Name", "Time", "Ingredients", "Calories", "Notes"];
        let rows = [];

        Array.from(mealEntries.children).slice(1).forEach(entry => {
            const inputs = Array.from(entry.querySelectorAll("input"));
            let rowData = inputs.map(input => input.value || "N/A");
            rows.push(rowData);
        });

        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 30,
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fontSize: 8,
                fillColor: [200, 200, 200],
            },
        });

        doc.save("meal-log.pdf");
        alert("Meal log PDF generated successfully!");

    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Failed to generate meal log PDF. Please try again.");
    }
});

document.getElementById("download-log").addEventListener("click", () => {
    const log = localStorage.getItem("mealLog");
    if (!log) return alert("No meal log to download. Add and save entries first!");

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
                !parsedData.hasOwnProperty('date') || typeof parsedData.date !== 'string' ||
                !parsedData.hasOwnProperty('entries') || !Array.isArray(parsedData.entries)
            ) {
                throw new Error("Invalid meal log structure.");
            }

            for (let i = 0; i < parsedData.entries.length; i++) {
                const entry = parsedData.entries[i];
                if (!Array.isArray(entry) || entry.length !== 5 ||
                    typeof entry[0] !== 'string' || typeof entry[1] !== 'string' ||
                    typeof entry[2] !== 'string' || (typeof entry[3] !== 'string' && isNaN(Number(entry[3]))) ||
                    typeof entry[4] !== 'string'
                ) {
                    throw new Error("Invalid meal entry structure.");
                }
                // Ensure calories are treated as a number
                if (typeof entry[3] === 'string' && !isNaN(Number(entry[3]))) {
                    parsedData.entries[i][3] = Number(entry[3]);
                } else if (typeof entry[3] !== 'number') {
                    throw new Error("Calories must be a number.");
                }
            }

            localStorage.setItem("mealLog", JSON.stringify(parsedData));
            document.getElementById("load-log").click();
            alert("Meal log uploaded successfully!");

        } catch (error) {
            alert("Invalid file uploaded: " + error.message);
        }
    };
    reader.readAsText(file);
});

//select all anchor elements in the footer.
const footerLinks = document.querySelectorAll('footer a');

footerLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        window.open(link.href, '_blank').focus(); // Open in a new tab/window
    });
});
