# Ultimate Meal Log

This is a simple web application for logging your daily meals. It allows you to:

* Add meal details like name, time, and ingredient entries.
* Save your meal logs to local storage.
* Load saved meal logs.
* Print meal logs as PDFs.
* Download meal logs as JSON files.
* Upload meal logs from JSON files.

## Features

* **Add/Remove Meals:** Easily add or remove meal entries from your meal log.
* **Save/Load Logs:** Save your meal logs to your browser's local storage and load them later.
* **PDF Generation:** Generate a PDF version of your meal log for easy printing or sharing.
* **JSON Import/Export:** Download your meal logs as JSON files and upload them later.
* **Input Validation:** Ensures that all required fields are filled and that the data is in the correct format.
* **Data Sanitization:** Uses DOMPurify to prevent XSS vulnerabilities.
* **Content Security Policy (CSP):** Implemented via a separate script to enhance security by restricting the resources that the browser is allowed to load.

## How to Use

1.  **Enter Log Details:** Fill in the log date.
2.  **Add Meals:** Click the "Add Meal" button to add meal entries.
3.  **Fill in Meal Details:** Enter the meal name, time, ingredients, calories, and notes for each meal.
4.  **Save the Log:** Click the "Save Log" button to save your meal log to local storage.
5.  **Load a Log:** Click the "Load Log" button to load a previously saved meal log.
6.  **Print as PDF:** Click the "Print as PDF" button to generate a PDF version of your log.
7.  **Download as JSON:** Click the "Download Log" button to download your log as a JSON file.
8.  **Upload JSON:** Click the "Upload Log" button to upload a JSON meal file.
9.  **Remove a Meal:** Click the "Remove Meal" button to remove the last meal entry.

## Technologies Used

* **HTML:** For the structure of the web page.
* **CSS:** For styling the web page.
* **JavaScript:** For the interactive functionality of the application.
* **jsPDF:** For generating PDF documents.
* **DOMPurify:** For sanitizing user-supplied HTML to prevent cross-site scripting (XSS) attacks.
* **Local Storage:** For storing meal log data in the browser.
* **JSON:** For data interchange when downloading and uploading meal logs.
* **Content Security Policy (CSP):** For enhanced security, using a separate script to define allowed resources.
* **FileReader API:** For reading the contents of uploaded JSON files.
* **Blob API:** For creating downloadable JSON files.
* **URL API:** For creating object URLs for downloaded files.

## DISCLAMER

**Read the disclaimer here:** [Ultimate Meal Log Disclaimer](/DISCLAIMER.md)

## Installation

1.  Clone the repository to your local machine.
2.  Open the `index.html` file in your web browser.

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

## Author

* Kurt Astarita

## Embed App

* [How To Embed](https://post40gains.blogspot.com/p/ultimate-shopping-log.html)
