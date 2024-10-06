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

// Need to refactor goal progress and such
class Goal {
    constructor(section, budget) {
        this.section = section; // Parent Node (Section)
        this.budget = budget; // Budget amount
    }

    // Get the amount spent so far in the section
    getSpentAmount() {
        return this.section.totalCost;
    }

    // Calculate the on-track number
    getOnTrackNumber() {
        return this.budget - this.getSpentAmount(); // Positive number means under budget
    }

    // Get the goal progress percentage
    getGoalProgress() {
        return ((this.getSpentAmount() / this.budget) * 100).toFixed(2); // Percentage spent
    }

    // Get an encouraging message based on goal progress
    getGoalMessage() {
        const progress = this.getGoalProgress();
        const onTrack = this.getOnTrackNumber();

        if (progress < 100) {
            return `You're at ${progress}% of your goal. Keep it up! You have $${onTrack} left to stay on track.`;
        } else {
            return `You've exceeded your goal by $${Math.abs(onTrack)}. Consider adjusting your budget!`;
        }
    }
}
