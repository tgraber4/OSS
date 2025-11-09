from math import cos, sin, pi, atan2, degrees

class SimulationManager:
    def __init__(self):
        self.planets = []
        self.dt = .1
        self.running = False

    def start(self, planets_data):
        """Initialize simulation with planets sent from frontend."""
        self.planets = []
        for obj in planets_data:
            thingid = obj.get("id", 0)
            pos = obj.get("pos", [0, 0])
            mass = obj.get("mass", 1)
            vel_mag = obj.get("vel_mag", 2)
            vel_deg = obj.get("vel_deg", 2)

            # Convert polar velocity (magnitude + angle) to Cartesian (x, y)
            vx = vel_mag * cos(vel_deg * pi / 180)
            vy = -vel_mag * sin(vel_deg * pi / 180)


            self.planets.append(Planet(thingid=thingid, p=pos, m=mass, v=(vx, vy)))
        # Store initial planets as deep copies of Planet objects for reset
        self.running = True

    def update(self):
        """Advance the simulation one time step and return updated data."""
        if not self.running:
            return self._get_planet_data_2()

        # Apply gravity and handle collisions
        for i, p1 in enumerate(self.planets):
            for j, p2 in enumerate(self.planets):
                if i == j:
                    continue
                p1.update_gravity(p2, self.dt)
                if p1.update_collision(p2, self.dt):
                    #  move the planet far far away
                    p2.pos = Vector(-100000000, -200000000)

        # Move all planets based on velocity
        for p in self.planets:
            p.update_movement(self.dt)

        return self._get_planet_data_2()

    def pause(self):
        """Pause the simulation."""
        self.running = False
        return self._get_planet_data()

    def _get_planet_data_2(self):
        """Helper to return all planet info in JSON-friendly format."""
        # for p in self.planets:
        #     print("x: " + str(p.pos.x))
        #     print("y: " + str(p.pos.y))
        #     print("vx: " + str(p.vel.x))
        #     print("vy: " + str(p.vel.y))
        return [
            {"id": p.thingid, "pos": [p.pos.x, p.pos.y]}
            for p in self.planets
        ]
    
    def _get_planet_data(self):
        """Helper to return all planet info in JSON-friendly format."""
        return [ # (p.vel.x**2 + p.vel.y**2)**0.5, atan2(-p.vel.y, p.vel.x)
            {"id": p.thingid, "pos": [p.pos.x, p.pos.y], "vel": (p.vel.x**2 + p.vel.y**2)**0.5, "direction":
             degrees(atan2(-p.vel.y, p.vel.x))} # (degrees(atan2(p.vel.y, p.vel.x))+360)%360
            for p in self.planets
        ]

class Vector:
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __add__(self, vector):
        return Vector(self.x+vector.x, self.y+vector.y)
    def __sub__(self, vector):
        return Vector(self.x-vector.x, self.y-vector.y)
    def __mul__(self, num = float):
        return Vector(self.x*num, self.y*num)
    def __truediv__(self, num = float):
        return Vector(self.x/num, self.y/num)
    
    def __getitem__(self, index):
        return self.x if index == 0 else self.y
    
    def __setitem__(self, index, value):
        if index == 0:
            self.x = value
        else:
            self.y = value
    
    def dot(self, vector):
        return self.x*vector.x+self.y*vector.y
    
    def mag(self):
        return (self.x*self.x+self.y*self.y)**0.5
    
    def normalize(self):
        mag = self.mag()
        self.x /= mag
        self.y /= mag


class Planet:
    
    def __init__(self, thingid=0, p = (0.0, 0.0), r = 14, m = 50000, v = (0.0, 0.0), s = False):
        self.thingid = thingid
        self.pos = Vector(p[0], p[1])
        self.radius = r
        self.mass = m
        self.vel = Vector(v[0], v[1])
        self.is_static = s
    
    def update_gravity(self, planet, dt):
        direction = planet.pos-self.pos
        mag = direction.mag()*1000000
        if (mag == 0):
            return
        
        direction.normalize()
        
        force = 6.6743e-14*self.mass*planet.mass/(mag*mag)
        self.vel += direction*(force*dt/(self.mass))
    
    
    def combine(self, planet):
        radius = (self.radius*self.radius + planet.radius*planet.radius)**0.5
        mass = self.mass+planet.mass
        vel = (self.vel * self.mass + planet.vel * planet.mass) / mass
        return Planet(self.thingid, (self.pos + planet.pos)/2, radius, mass, vel)
    
    def update_collision(self, planet, dt):
        dist = self.pos-planet.pos
        if (dist.mag() < (self.radius + planet.radius)/2):
            new_planet = self.combine(planet)
            self.pos = new_planet.pos
            self.radius = new_planet.radius
            self.mass = new_planet.mass
            self.vel = new_planet.vel
            return True
        return False
    
    def update_movement(self, dt):
        if (not self.is_static):
            self.pos += self.vel * dt