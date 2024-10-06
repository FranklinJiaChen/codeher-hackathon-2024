class Section {
    constructor(sectionName, treeName, totalCost = 0, parentNode = null) {
        this.sectionName = sectionName;
        this.treeName = treeName;
        this.totalCost = totalCost;
        this.parentNode = parentNode;
        this.slices = []; // Initialize as an empty array
    }

    // Method to add a child node to this section
    addSlice(node) {
        this.slices.push(node);
    }

    // Method to add an expense to the tree based on a path
    addExpense(cost, date, path) { // Will only be called on the root node
        const pathArray = path.split("/"); // Split path by "/"
        let currentSection = this;

        // Traverse or create sections based on the path
        for (let sectionName of pathArray) {
            // Check if the section exists
            let existingSection = currentSection.slices.find(
                (slice) => slice instanceof Section && slice.sectionName === sectionName
            );

            // If it doesn't exist, create a new section
            if (!existingSection) {
                existingSection = new Section(sectionName, currentSection.treeName, 0, currentSection);
                currentSection.addSlice(existingSection); // Add new section to the current section
                console.log(`Created section: ${sectionName}`);
            }

            // Move to the next section
            currentSection = existingSection;
        }

        // Add the expense to the last section in the path
        const newExpense = new Expense(cost, date, currentSection);
        currentSection.addSlice(newExpense);
        console.log(`Added an expense of $${cost} on ${date} to ${currentSection.sectionName}`);

        // Update total cost for all parent nodes
        this.updateParentCosts(currentSection, cost);
    }

    // Method to update total cost for parent nodes
    updateParentCosts(section, cost) {
        let current = section;
        while (current) {
            current.totalCost += cost; // Update the total cost
            current = current.parentNode; // Move to the parent node
        }
    }

    // Method to log the structure of the section and its slices
    logStructure(indent = "") {
        console.log(`${indent}- ${this.sectionName}: $${this.totalCost}`);
        for (const slice of this.slices) {
            if (slice instanceof Section) {
                slice.logStructure(indent + "  "); // Call logStructure for Section
            } else if (slice instanceof Expense) {
                console.log(`${indent}  - Expense: $${slice.cost} on ${slice.date}`); // Log Expense details
            }
        }
    }
}

class Expense {
    constructor(cost, date, parentNode) {
        this.cost = cost;
        this.date = date;
        this.parentNode = parentNode;
    }
}

// Example usage:

// Create the root section
const rootSection = new Section("Root", "Fall 2024");

// Test adding expenses
rootSection.addExpense(900, "2024-9-01", "Housing");
rootSection.addExpense(900, "2024-10-01", "Housing");
rootSection.addExpense(900, "2024-11-01", "Housing");
rootSection.addExpense(900, "2024-12-01", "Housing");

rootSection.addExpense(50, "2024-10-02", "Food/Restaurant");
rootSection.addExpense(70, "2024-10-22", "Food/Restaurant");
rootSection.addExpense(70, "2024-10-17", "Food/On Campus");
rootSection.addExpense(20, "2024-10-03", "Food/Fast Food/Mcdonalds");
rootSection.addExpense(20, "2024-10-23", "Food/Fast Food/Mcdonalds");
rootSection.addExpense(20, "2024-11-13", "Food/Fast Food/Mcdonalds");
rootSection.addExpense(20, "2024-12-03", "Food/Fast Food/Mcdonalds");


rootSection.logStructure();
