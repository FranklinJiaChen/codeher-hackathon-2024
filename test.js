class Section {
    /**
     * Represents a non-leaf node that contains information about an expense category.
     *
     * @param {string} sectionName - The name of the section (i.e. "Food" or "Games").
     * @param {string} treeName - The name of the tree (i.e. "Fall 2024").
     * @param {number} totalCost - The total cost (i.e. sum of the pie chart).
     * @param {Array} slices - An array of child nodes (either sections or leaves).
     */
    constructor(sectionName, treeName, totalCost, slices = []) {
        this.sectionName = sectionName;
        this.treeName = treeName;
        this.totalCost = totalCost;
        this.slices = slices; // Array of child nodes (sections or leaves)
    }

    // Method to add a child node to this section
    addSlice(node) {
        this.slices.push(node);
    }
}

// Example usage:
const section = new Section("Food", "Fall 2024", 1000, []);
const fastFoodSection = new Section("Fast Food", "Fall 2024", 300);
const restaurantSection = new Section("Restaurant", "Fall 2024", 700);

// Create the "Food" section and add "Fast Food" and "Restaurant" as child nodes
const foodSection = new Section("Food", "Fall 2024", 1000);
foodSection.addSlice(fastFoodSection);
foodSection.addSlice(restaurantSection);

// Example output to show the structure
console.log(foodSection);
