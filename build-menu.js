const fs = require('fs').promises;
const path = require('path');

// Helper function to generate HTML for menu items
function generateMenuItemHtml(item, categoryName) {
    let html = `
                        <div class="menu-item">`;

    // Special handling for Sides and Beverages sections
    if (categoryName === "Sides" || categoryName === "Beverages") {
        const headerContent = `<p>${item.name}</p>${item.price ? `<span class="price price--side">${item.price}</span>` : ''}`;
        html += `
                            <div class="menu-item-header">
                                ${headerContent}
                            </div>`;
    } else {
        const headerContent = `<h4>${item.name}</h4>${item.price ? `<span class="price">${item.price}</span>` : ''}`;
        html += `
                            <div class="menu-item-header">
                                ${headerContent}
                            </div>`;

        // Add additions, options, and descriptions
        if (item.additions) {
            html += `
                            <p class="additions">+ ${item.additions.join(' | ')}</p>`;
        }
        if (item.options) {
            html += `
                            <p class="additions options">${item.options.join(' | ')}</p>`;
        }
        if (item.description) {
            html += `
                            <p>${item.description}</p>`;
        }
    }

    html += `
                        </div>`;
    return html;
}

// Generate HTML for a category
function generateCategoryHtml(category) {
    let html = `
                <details>
                    <summary>${category.name}</summary>
                    <div class="menu-section-content">`;

    // Add category-wide note if it exists
    if (category.note) {
        html += `
                        <p class="additions">${category.note}</p>`;
    }

    // Add category-wide options if they exist
    if (category.options) {
        html += `
                        <p class="additions">• ${category.options.join(' | ')}</p>`;
    }

    // Add all items in this category
    console.log('building category: ', category);
    category.items.forEach(item => {
        html += generateMenuItemHtml(item, category.name);
    });

    html += `
                    </div>
                </details>`;
    return html;
}

// Generate the complete menu HTML
function generateMenuHtml(menuData) {
    let html = '';
    menuData.categories.forEach(category => {
        html += generateCategoryHtml(category);
    });
    return html;
}

// Main function to update the index.html file
async function updateMenuSection() {
    try {
        // Read the JSON and HTML files
        const menuData = JSON.parse(await fs.readFile(path.join(__dirname, 'menu.json'), 'utf8'));
        const indexHtml = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8');

        // Generate new menu HTML
        const newMenuHtml = generateMenuHtml(menuData);

        // Find and replace the menu container content
        const startTag = '<div class="menu-container">';
        const endTag = '</div><!-- end menu-container -->';

        const startIndex = indexHtml.indexOf(startTag);
        const endIndex = indexHtml.indexOf(endTag) + endTag.length;

        if (startIndex === -1 || endIndex === -1) {
            throw new Error('Could not find menu container tags in index.html');
        }

        // Combine everything back together
        const updatedHtml = indexHtml.slice(0, startIndex) +
            startTag +
            newMenuHtml +
            endTag +
            indexHtml.slice(endIndex);

        // Write the updated HTML back to the file
        await fs.writeFile(path.join(__dirname, 'index.html'), updatedHtml);

        console.log('Successfully updated menu section in index.html');

    } catch (error) {
        console.error('Error updating menu section:', error);
        process.exit(1);
    }
}

// Run the update
updateMenuSection();