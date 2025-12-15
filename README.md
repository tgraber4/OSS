<h1>OSS (Objects in Space Simulator)</h1> <img width="1919" height="942" alt="Objects in Space Simulator" src="https://github.com/user-attachments/assets/b841e270-4105-496b-9673-7d42e0bbc652" /> <h2>Overview</h2> <p> Objects in Space Simulator (OSS) is a 2D physics-based space simulator that allows users to create and experiment with custom planetary systems. Users can place planets, modify physical properties, and observe how gravitational forces affect motion in real time. </p> <h2>Built With</h2> <ul> <li>JavaScript</li> <li>Konva.js</li> <li>Python</li> <li>Flask</li> </ul> <h2>What It Does</h2> <p> OSS allows users to select planets or the Sun from a built-in object library and drag them into the simulation space. Each object can be customized by changing its mass, radius, velocity, and direction. Once the system is set up, users can start the simulation and watch orbital paths, flybys, and gravitational interactions unfold based on physics calculations. </p> <p> Users can play and pause the simulation at any time, remove objects, or quickly start with preconfigured layouts to explore different scenarios. </p> <h2>Inspiration</h2> <p> The inspiration for this project came from viewing NASA websites that display real-time planetary data. While those visualizations were impressive, we wanted to explore what would happen if the system could be modified. OSS was created to allow users to freely change positions, masses, and velocities and observe how physics determines the outcome. </p> <h2>How We Built It</h2> <p> The frontend was built using Konva.js to handle 2D rendering, animations, and user interaction. The backend was written in Python to perform gravitational physics calculations. Flask was used to connect the frontend and backend, allowing object data and position updates to be exchanged in real time. </p> <h2>Running the Project</h2>

<p>To run the backend locally, follow these steps.</p>

<h3>Windows</h3>
<pre>
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
flask run
</pre>

<h3>macOS</h3>
<pre>
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
</pre>
<p>Go live with test.html</p>

