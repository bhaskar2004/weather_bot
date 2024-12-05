import os
from flask import Flask, render_template, request, jsonify
import requests
import random
import re

class WeatherService:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "http://dataservice.accuweather.com"

    def get_location_key(self, location):
        """Get location key for a given city"""
        url = f"{self.base_url}/locations/v1/cities/search"
        params = {
            "apikey": self.api_key,
            "q": location
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            locations = response.json()
            return locations[0]['Key'] if locations else None
        except Exception as e:
            print(f"Location search error: {e}")
            return None

    def get_current_weather(self, location):
        """Fetch current weather for a location"""
        location_key = self.get_location_key(location)
        if not location_key:
            return "Could not find location."

        url = f"{self.base_url}/currentconditions/v1/{location_key}"
        params = {
            "apikey": self.api_key,
            "details": "true"
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            weather_data = response.json()[0]

            return f"""🌍 Weather in {location}:
🌡️ Temperature: {weather_data['Temperature']['Metric']['Value']}°C
☁️ Condition: {weather_data['WeatherText']}
💨 Wind: {weather_data['Wind']['Speed']['Metric']['Value']} km/h"""
        
        except Exception as e:
            print(f"Weather fetch error: {e}")
            return "Could not retrieve weather information."

# Flask Application
app = Flask(__name__)

# Initialize Weather Service
weather_service = WeatherService("t1kBhTAgDGGEJJCi36uhyX3JrTvBmjzp")

# Predefined responses
HELP_MESSAGE = """Available Commands:
- /weather [city]: Get current weather
- /help: Show this help menu
- exit: Close application"""

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    # Get user message
    user_message = request.json.get('message', '').strip()

    # Process commands
    if user_message.lower() == '/help':
        return jsonify({"response": HELP_MESSAGE})
    
    if user_message.lower() == 'exit':
        return jsonify({"response": "Goodbye!"})

    # Weather command
    weather_match = re.match(r'/weather\s*(.+)?', user_message)
    if weather_match:
        location = weather_match.group(1) or "New York"
        weather_response = weather_service.get_current_weather(location)
        return jsonify({"response": weather_response})

    # Default response
    return jsonify({
        "response": "Sorry, I didn't understand that command. Type /help for available commands."
    })

if __name__ == '__main__':
    app.run(debug=True)