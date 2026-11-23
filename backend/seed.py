# Copyright (c) 2026 Khoa Cao. All rights reserved.

import os
from core.database import Base, SessionLocal, engine
from core.security import hash_pass
from models.user import User
from models.mission import Mission
from models.drone import Drone

def seed_data():

    # Force to create 2 table Users and Missions
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    admin_default = os.getenv("SEED_ADMIN_PASSWORD", "admin123")
    pilot_default = os.getenv("SEED_PILOT_PASSWORD", "pilot123")

    test_users = [
        {"email": "admin@flyby.com", "password": admin_default, "role": "ADMIN"},
        {"email": "pilot1@flyby.com", "password": pilot_default, "role": "PILOT"},
        {"email": "pilot2@flyby.com", "password": pilot_default, "role": "PILOT"},
    ]

    test_drones = [
        {"name": "Flyby F-11 Alpha", "model": "Flyby F-11 Tactical", "serial_number": "FB-AL-001", "status": "AVAILABLE", "battery_level": 100},
        {"name": "Flyby F-11 Bravo", "model": "Flyby F-11 Tactical", "serial_number": "FB-BR-002", "status": "AVAILABLE", "battery_level": 92},
        {"name": "Flyby Recon X1", "model": "Flyby Recon Survey", "serial_number": "FB-RECO-003", "status": "AVAILABLE", "battery_level": 85},
        {"name": "Flyby Heavy Lifter", "model": "Flyby Cargo H1", "serial_number": "FB-HEA-004", "status": "MAINTENANCE", "battery_level": 24}
    ]

    try:
        for u in test_users:
            existing_user = db.query(User).filter(User.email == u["email"]).first()
            if not existing_user:
                new_user = User(
                    email=u["email"],
                    hashed_password=hash_pass(u["password"]),
                    role=u["role"],
                )
                db.add(new_user)
                print(f"Created {u['role']}: {u['email']} / {u['password']}")
            else:
                print(f"User {u['email']} already exists!")

        for d in test_drones:
                existing_drone = db.query(Drone).filter(Drone.serial_number == d["serial_number"]).first()
                if not existing_drone:
                    new_drone = Drone(
                        name=d["name"],
                        model=d["model"],
                        serial_number=d["serial_number"],
                        status=d["status"],
                        battery_level=d["battery_level"]
                    )
                    db.add(new_drone)
                    print(f"Created drone {d['name']}: {d['model']}")
                else:
                    print(f"Drone {d['serial_number']} already exists!")
                db.commit()
                print("-> Seeding drones completed successfully!")
        db.commit()
    
        print("-> Seeding users and drones completed successfully!")
    finally:
        db.close()
        
if __name__ == "__main__":
    seed_data()