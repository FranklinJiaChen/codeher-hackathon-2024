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

    findSection(sectionPath) {
        const pathArray = sectionPath.split("/"); // Split path by "/"
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
        return currentSection;

        
    }

    getData() {
        return {
            labels: [...this.slices.map(slice => slice.sectionName)],
            data: [...this.slices.map(slice => slice.totalCost)]
        };
    }


    // Method to add an expense to the tree based on a path
    addExpense(cost, date, path) { // Will only be called on the root node
        // Find the section based on the path
        const parentSection = this.findSection(path);

        // Add the expense to the last section in the path
        const newExpense = new Expense(cost, date, parentSection);
        parentSection.addSlice(newExpense);
        console.log(`Added an expense of $${cost} on ${date} to ${parentSection.sectionName}`);

        // Update total cost for all parent nodes
        this.updateParentCosts(parentSection, cost);
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

    getOnTrackNumber() {
        const startDate = new Date('2024-09-01');
        const endDate = new Date('2024-12-31');
        const currentDate = new Date();

        const totalTime = endDate - startDate;
        const elapsedTime = currentDate - startDate;

        const percentagePassed = Math.min(Math.max(elapsedTime / totalTime, 0), 1) * 100;

        return parseFloat(percentagePassed.toFixed(1));
    }



    // Get the goal progress percentage
    getGoalProgress() {
        return ((this.getSpentAmount() / this.budget) * 100).toFixed(2); // Percentage spent
    }

    // Get an encouraging message based on goal progress
    getGoalMessage() {
        const progress = this.getGoalProgress();
        const onTrack = this.getOnTrackNumber();

        // if (progress < 100) {
        //     return `You're at ${progress}% of your goal. Keep it up! You have $${onTrack} left to stay on track.`;
        // } else {
        //     return `You've exceeded your goal by $${Math.abs(onTrack)}. Consider adjusting your budget!`;
        // }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const goalsList = document.getElementById('goals-list');
    const budgetInput = document.getElementById('budget-input');
    const sectionInput = document.getElementById('section-input');
    const addGoalButton = document.getElementById('add-goal-button');

    // Sample goals array (you can replace this with your actual goals from a database or API)
    const goals = [];

    // Function to render goals
    function renderGoals() {
        goalsList.innerHTML = ''; // Clear existing goals
        goals.forEach((goal, index) => {
            const li = document.createElement('li');
            li.innerHTML = `Budget: $${goal.budget}, Section: ${goal.section.sectionName} <canvas id="progress-bar-${index}" width="300" height="50"></canvas>`;
            goalsList.appendChild(li);

            // Calculate percentages
            const currentSpent = goal.getSpentAmount();
            const currentPercentage = (currentSpent / goal.budget) * 100;
            const onTrackPercentage = goal.getOnTrackNumber();

            // Create the progress bar using Chart.js
            const ctx = document.getElementById(`progress-bar-${index}`).getContext('2d');
            const progressBar = new Chart(ctx, {
                type: 'bar', // Use 'bar' for horizontal bars
                data: {
                    labels: ['Current Progress (' + currentSpent.toFixed(2) + ')', 'On Track (' + (onTrackPercentage * goal.budget / 100).toFixed(2) + ')'],
                    datasets: [{
                        label: 'Progress Percentage',
                        data: [currentPercentage.toFixed(2), onTrackPercentage.toFixed(2)],
                        backgroundColor: ['#4caf50', '#2196F3'], // Green for current progress, Blue for on track
                    }]
                },
                options: {
                    indexAxis: 'y', // Makes the bars horizontal
                    scales: {
                        x: {
                            beginAtZero: true,
                            max: 100, // Set the maximum value to 100
                            ticks: {
                                stepSize: 10
                            }
                        },
                        y: {
                            beginAtZero: true,
                            stacked: true // Enable stacking
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw}%`;
                                }
                            }
                        }
                    }
                }
            });
        });
    }


    // Event listener for adding a new goal
    addGoalButton.addEventListener('click', () => {
        console.log("Button clicked");
        const budget = budgetInput.value.trim();
        const section = sectionInput.value.trim();

        if (!isNaN(budget) && section) {
            const newGoal = new Goal(rootSection.findSection(categoryPaths[section]), budget); // Create a new Goal instance
            goals.push(newGoal); // Add the new goal instance to the goals array
            budgetInput.value = ''; // Clear the budget input
            sectionInput.value = ''; // Clear the section input
            renderGoals(); // Re-render goals
        } else {
            console.error("Invalid budget or section name");
        }
    });

    // Initial render
    renderGoals();
});

// Test the Section class
const rootSection = new Section("Fall 2024", "Fall 2024");

// Test adding expenses
rootSection.addExpense(900, "2024-09-01", "Housing");
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

const categoryPaths = {
    "Housing": "Housing",
    "Food": "Food",
    "Restaurant": "Food/Restaurant",
    "On Campus": "Food/On Campus",
    "Fast Food": "Food/Fast Food",
    "Mcdonalds": "Food/Fast Food/Mcdonalds"
};

getCurrentDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


console.log(getCurrentDate());

// Test the Goal class
const housingGoal = new Goal(rootSection.slices[0], 3600);
console.log(housingGoal.getGoalProgress()); // 100%
console.log(housingGoal.getOnTrackNumber()); // 29.6% done this term