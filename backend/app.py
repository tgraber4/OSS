from flask import Flask, request, jsonify
from flask_cors import CORS
from simulation import SimulationManager
import copy

app = Flask(__name__)
CORS(app)

# Single global simulation manager
sim = SimulationManager()

@app.route("/start_simulation", methods=["POST"])
def start_simulation():
    """Start a new simulation with planet data from the frontend."""
    data = request.get_json()
    planets = data.get("planets", [])
    sim.start(planets)
    return jsonify({"status": "running", "planets": sim._get_planet_data()}), 200

@app.route("/update_positions", methods=["GET"])
def update_positions():
    """Return updated planet positions for rendering."""
    return jsonify({
        "running": sim.running,
        "planets": sim.update()
    }), 200

@app.route("/pause_simulation", methods=["GET"])
def pause_simulation():
    """Pause the simulation and return current planet data."""
    return jsonify({
        "status": "paused",
        "planets": sim.pause()
    }), 200

@app.route("/reset_simulation", methods=["POST"])
def reset_simulation():
    """Reset simulation to initial state."""
    return jsonify({
        "status": "reset",
    }), 200

if __name__ == "__main__":
    app.run(port=5000, debug=True)