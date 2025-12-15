import pygame

# Initialize Pygame
pygame.init()

# Set up the display
window = pygame.display.set_mode((800, 600))
pygame.display.set_caption("Physics Test! :)")


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
    
    def __init__(self, p = (0.0, 0.0), r = 14, m = 50000, v = (0.0, 0.0), s = False):
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
        return Planet((self.pos + planet.pos)/2, radius, mass, vel)
    
    def update_collision(self, planet, dt):
        dist = self.pos-planet.pos
        if (dist.mag() < (self.radius + planet.radius)):
            #new_planet = self.combine(planet)
            #self.pos = new_planet.pos
            #self.radius = new_planet.radius
            #self.mass = new_planet.mass
            #self.vel = new_planet.vel
            return True
        return False
    
    def update_movement(self, dt):
        if (not self.is_static):
            self.pos += self.vel * dt
    

class PlanetData:
    
    def __init__(self, data):
        self.name = data[0]
        self.mass = float(data[1])
        self.distance = float(data[2])
        self.velocity = float(data[3])


def read_planet_data():
    planet_data = []
    i = 0
    with open("planet_data.txt", "r") as file:    
        for line in file:
            if (i == 0):
                i += 1
                continue
            planet = PlanetData(line.split(","))
            planet_data.append(planet)
    
    return planet_data


class FlaskPlanetData:
    
    def __init__(self):
        self.pos = (0, 0)
        self.mass = 0
        self.vel_mag = 0
        self.vel_deg = 0
        self.id = 0


def get_data(data):
    planets = []
    
    for obj in data:
        v = (obj.vel_mag*cos(vel_deg/180*3.14159), obj.vel_mag*sin(vel_deg/180*3.14159))
        planets.append(Planet(obj.pos, 0, obj.mass, v, False))


def send_data(start_time, end_time):
    data = []
    dt = 1/60
    for i in range(start_time/dt, end_time/dt):
        for i in range(0, len(planets)):
            for j in range(0, len(planets)):
                if (i != j):
                    planets[i].update_gravity(planets[j], dt)
        
        planet_pos_data = []
        for planet in planets:
            planet.update_movement(dt)
            planet_pos_data.append(planet.pos)

        data.append(i*dt, planet_pos_data)
    
    return data


planet_data = read_planet_data()


sun_pos = (400, 300)
planets = []
for i in range(6):
    planets.append(Planet(p = (sun_pos[0]-planet_data[i].distance/1000000, sun_pos[1]), m = planet_data[i].mass, v = (0, -planet_data[i].velocity)))
planets[0].radius = 28

planets[3].vel[0] = -10
planets[3].pos[0] = 800-planets[3].pos[0]

clock = pygame.time.Clock()

# Main loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    dt = 1/30
    for i in range(0, len(planets)):
        for j in range(0, len(planets)):
            if (i != j):
                planets[i].update_gravity(planets[j], dt)
                if planets[i].update_collision(planets[j], dt):
                    actual_diff = planets[i].pos-planets[j].pos
                    normal_diff = Vector(actual_diff.x/actual_diff.mag(), actual_diff.y/actual_diff.mag())
                    
                    diff = actual_diff - (normal_diff * (planets[i].radius+planets[j].radius))

                    planets[i].pos = planets[i].pos + diff/1.99 - planets[i].vel*dt
                    planets[j].pos = planets[j].pos - diff/1.99 - planets[j].vel*dt
    
    for planet in planets:
        planet.update_movement(dt)
    
    window.fill((5, 5, 5))
    for planet in planets:
        pygame.draw.circle(window, (160, 20, 20), (planet.pos[0], planet.pos[1]), planet.radius)


    pygame.display.flip()
    clock.tick(60)

pygame.quit()

