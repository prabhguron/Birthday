// Store RSVP data in localStorage
let rsvpData = [];

// DOM elements
const rsvpForm = document.getElementById('rsvpForm');
const guestList = document.getElementById('guestList');
const foodGroup = document.getElementById('foodGroup');
const attendanceSelect = document.getElementById('attendance');
const foodQuantityInput = document.getElementById('foodQuantity');
const increaseBtn = document.getElementById('increaseBtn');
const decreaseBtn = document.getElementById('decreaseBtn');

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    rsvpForm.addEventListener('submit', handleFormSubmit);
    attendanceSelect.addEventListener('change', toggleFoodField);
    
    // Quantity button event listeners
    increaseBtn.addEventListener('click', increaseQuantity);
    decreaseBtn.addEventListener('click', decreaseQuantity);
    
    // Prevent form submission when quantity buttons are clicked
    increaseBtn.addEventListener('click', (e) => e.preventDefault());
    decreaseBtn.addEventListener('click', (e) => e.preventDefault());
    
    // Load existing RSVP data from localStorage and display it
    loadRSVPData();
    displayRSVPs();
});

// Quantity control functions
function increaseQuantity() {
    const currentValue = parseInt(foodQuantityInput.value) || 1;
    if (currentValue < 99) {
        foodQuantityInput.value = currentValue + 1;
    }
}

function decreaseQuantity() {
    const currentValue = parseInt(foodQuantityInput.value) || 1;
    if (currentValue > 1) {
        foodQuantityInput.value = currentValue - 1;
    }
}

// Load RSVP data from localStorage
function loadRSVPData() {
    try {
        const savedData = localStorage.getItem('shreya-birthday-rsvp');
        if (savedData) {
            rsvpData = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Error loading RSVP data:', error);
        rsvpData = [];
    }
}

// Save RSVP data to localStorage
function saveRSVPData() {
    try {
        localStorage.setItem('shreya-birthday-rsvp', JSON.stringify(rsvpData));
    } catch (error) {
        console.error('Error saving RSVP data:', error);
        showNotification('Error saving data. Please try again.', 'error');
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(rsvpForm);
    const guestName = formData.get('guestName').trim();
    const attendance = formData.get('attendance');
    const foodBringing = formData.get('foodBringing').trim();
    const foodQuantity = parseInt(formData.get('foodQuantity')) || 1;
    
    // Validate required fields
    if (!guestName || !attendance) {
        alert('Please fill in your name and attendance status!');
        return;
    }
    
    // Check if guest already exists
    const existingGuestIndex = rsvpData.findIndex(guest => 
        guest.name.toLowerCase() === guestName.toLowerCase()
    );
    
    const guestData = {
        name: guestName,
        attendance: attendance,
        food: foodBringing || 'Not specified',
        quantity: attendance === 'yes' ? foodQuantity : 0,
        timestamp: new Date().toISOString()
    };
    
    if (existingGuestIndex !== -1) {
        // Update existing guest
        rsvpData[existingGuestIndex] = guestData;
        showNotification(`Updated RSVP for ${guestName}!`);
    } else {
        // Add new guest
        rsvpData.push(guestData);
        showNotification(`Thanks for your RSVP, ${guestName}!`);
    }
    
    // Save to localStorage
    saveRSVPData();
    
    // Clear form and refresh display
    rsvpForm.reset();
    foodQuantityInput.value = 1; // Reset quantity to 1
    toggleFoodField(); // Reset food field visibility
    displayRSVPs();
}

// Toggle food field based on attendance selection
function toggleFoodField() {
    const attendance = attendanceSelect.value;
    const foodInput = document.getElementById('foodBringing');
    
    if (attendance === 'yes') {
        foodGroup.classList.remove('hidden');
        foodInput.required = true;
    }  
    else if (attendance === 'maybe') {
        foodGroup.classList.remove('hidden');
        foodInput.required = true;}
    
    
    
    else {
        foodGroup.classList.add('hidden');
        foodInput.required = false;
        foodInput.value = ''; // Clear the field
        foodQuantityInput.value = 1; // Reset quantity
    }
}

// Display all RSVPs
function displayRSVPs() {
    if (rsvpData.length === 0) {
        guestList.innerHTML = '<p style="text-align: center; font-style: italic;">No RSVPs yet. Be the first to respond!</p>';
        return;
    }
    
    // Sort guests: Yes first, then Maybe, then No
    const sortedGuests = [...rsvpData].sort((a, b) => {
        const order = { 'yes': 1, 'maybe': 2, 'no': 3 };
        return order[a.attendance] - order[b.attendance];
    });
    
    guestList.innerHTML = sortedGuests.map(guest => createGuestHTML(guest)).join('');
}

// Create HTML for a single guest
function createGuestHTML(guest) {
    const statusIcons = {
        'yes': '✅',
        'no': '❌',
        'maybe': '🤔'
    };
    
    const statusTexts = {
        'yes': 'Coming!',
        'no': 'Can\'t make it',
        'maybe': 'Maybe coming'
    };
    
    const statusColors = {
        'yes': '#4ecdc4',
        'no': '#ff6b6b',
        'maybe': '#ffa726'
    };
    
    let foodInfo = '';
    if (guest.attendance === 'yes' && guest.food && guest.food !== 'Not specified') {
        const quantityText = guest.quantity > 1 ? ` (${guest.quantity})` : '';
        foodInfo = `<div class="guest-food">Bringing: ${guest.food}${quantityText}</div>`;
    }
    
    return `
        <div class="guest-item" style="border-left-color: ${statusColors[guest.attendance]}">
            <div class="guest-name">${guest.name}</div>
            <div class="guest-status">${statusIcons[guest.attendance]} ${statusTexts[guest.attendance]}</div>
            ${foodInfo}
        </div>
    `;

    
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    
    const backgroundColor = type === 'error' 
        ? 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)'
        : 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add some fun interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add click effect to party text
    const partyText = document.querySelector('.party-text');
    if (partyText) {
        partyText.addEventListener('click', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'bounce 0.5s ease-out';
            }, 10);
        });
    }
    
    // Add hover effect to special elements
    const specialElements = document.querySelectorAll('.tdStyle');
    specialElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Optional: Add a function to clear all data (for testing purposes)
function clearAllRSVPs() {
    if (confirm('Are you sure you want to clear all RSVP data? This cannot be undone.')) {
        rsvpData = [];
        localStorage.removeItem('shreya-birthday-rsvp');
        displayRSVPs();
        showNotification('All RSVP data cleared.');
    }
}

// Optional: Add a function to export data
function exportRSVPData() {
    if (rsvpData.length === 0) {
        showNotification('No RSVP data to export.', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(rsvpData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `shreya-birthday-rsvp-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('RSVP data exported successfully!');
}

// Console commands for managing data (for admin use)
console.log('🎉 Shreya\'s Birthday RSVP System Loaded!');
console.log('Available commands:');
console.log('- clearAllRSVPs() - Clear all RSVP data');
console.log('- exportRSVPData() - Export RSVP data as JSON');
console.log('- rsvpData - View current RSVP data');