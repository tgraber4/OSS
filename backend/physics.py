

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
    
    def __getitem__(self, index):
        return self.x if index == 0 else self.y
    
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
        mag = direction.mag()
        direction.normalize()
        
        force = self.mass*planet.mass/(mag*mag)
        self.vel += direction*(force*dt/self.mass)
    
    def update_movement(self, dt):
        if (not self.is_static):
            self.pos += self.vel * dt


def update(dt):
    
    for i in range(0, len(planets)):
        for j in range(0, len(planets)):
            if (i != j):
                planets[i].update_gravity(planets[j], dt)
    
    for planet in planets:
        planet.update_movement(dt)
