// Chart configuration
let tempChart, lightChart;
const maxDataPoints = 20;

// Initialize charts
function initializeCharts() {
    const chartConfig = {
        type: 'line',
        options: {
            animation: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    // Temperature chart
    tempChart = new Chart(
        document.getElementById('tempChart'),
        {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            }
        }
    );

    // Light chart
    lightChart = new Chart(
        document.getElementById('lightChart'),
        {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    label: 'Light Level (%)',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        }
    );
}

// Update sensor cards with latest data
function updateSensorCards(data) {
    document.getElementById('temperature').textContent = `${data.temperature.toFixed(1)}°C`;
    document.getElementById('light').textContent = `${data.light.toFixed(1)}%`;
    
    const movement = Math.sqrt(
        Math.pow(data.accel_x, 2) +
        Math.pow(data.accel_y, 2) +
        Math.pow(data.accel_z, 2)
    );
    document.getElementById('movement').textContent = `${movement.toFixed(2)}g`;

    // Update card colors based on alert status
    document.getElementById('tempCard').classList.toggle('alert-active', data.temperature > 30);
    document.getElementById('lightCard').classList.toggle('alert-active', data.light < 100);
    document.getElementById('movementCard').classList.toggle('alert-active', movement > 2.0);
}

// Update charts with new data
function updateCharts(data) {
    const timestamp = new Date(data.timestamp).toLocaleTimeString();

    // Update temperature chart
    if (tempChart.data.labels.length > maxDataPoints) {
        tempChart.data.labels.shift();
        tempChart.data.datasets[0].data.shift();
    }
    tempChart.data.labels.push(timestamp);
    tempChart.data.datasets[0].data.push(data.temperature);
    tempChart.update();

    // Update light chart
    if (lightChart.data.labels.length > maxDataPoints) {
        lightChart.data.labels.shift();
        lightChart.data.datasets[0].data.shift();
    }
    lightChart.data.labels.push(timestamp);
    lightChart.data.datasets[0].data.push(data.light);
    lightChart.update();
}

// Update statistics
async function updateStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        document.getElementById('avgTemp').textContent = `${stats.avgTemp.toFixed(1)}°C`;
        document.getElementById('avgLight').textContent = `${stats.avgLight.toFixed(1)}%`;
        document.getElementById('alertCount').textContent = stats.alertCount;
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Fetch latest data
async function fetchLatestData() {
    try {
        const response = await fetch('/api/data/latest');
        const data = await response.json();
        
        if (data) {
            updateSensorCards(data);
            updateCharts(data);
        }
    } catch (error) {
        console.error('Error fetching latest data:', error);
    }
}

// Initialize the dashboard
function initializeDashboard() {
    initializeCharts();
    
    // Fetch initial data
    fetchLatestData();
    updateStats();

    // Set up periodic updates
    setInterval(fetchLatestData, 2000); // Update every 2 seconds
    setInterval(updateStats, 30000);    // Update stats every 30 seconds
}

// Start the dashboard when the page loads
window.addEventListener('load', initializeDashboard);
