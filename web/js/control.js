// MQTT client setup
const client = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', () => {
    console.log('Connected to MQTT broker');
});

client.on('error', (error) => {
    console.error('MQTT connection error:', error);
});

// Function to update thresholds
function updateThreshold(type) {
    let value;
    switch(type) {
        case 'temperature':
            value = document.getElementById('tempThreshold').value;
            break;
        case 'light':
            value = document.getElementById('lightThreshold').value;
            break;
        case 'movement':
            value = document.getElementById('movementThreshold').value;
            break;
    }

    const message = {
        type: type,
        value: parseFloat(value)
    };

    client.publish('envmonitor/control', JSON.stringify(message));
    alert(`${type} threshold updated to ${value}`);
}
