# KarunaNidhan (KN)

A technical coordination layer providing digital infrastructure to track, vaccinate, and coordinate rescues for stray animals. 

**Live Product:** [Insert Link to App/Website Here]

> **Note on Production Code:** This repository contains the core V1 backend and architectural foundation. Due to the sensitive nature of user location data and the security requirements of our 14,000+ active users, the live production API endpoints and scaled database configurations are currently maintained in a private repository.

## System Architecture 

KarunaNidhan operates strictly as a digital infrastructure layer, connecting decentralized welfare efforts through real-time spatial tracking. 

* **Backend:** Python (Django / FastAPI)
* **Frontend:** React Native 
* **Database:** PostgreSQL with PostGIS extension

## Spatial Indexing & Scaling

As the platform scaled, calculating distances across thousands of active logs using standard coordinate math became a critical bottleneck, delaying alert times for volunteers on the ground. 

To resolve this, the backend architecture was migrated to a dedicated spatial database structure:
* **Spatial Queries:** Integrated **PostGIS** to handle radius scans and rescue boundary filtering natively at the database level.
* **GiST Indexing:** Replaced full table scans with Generalized Search Tree (GiST) indexes.
* **R-Tree Implementation:** Leveraged R-trees to efficiently filter location geometries using bounding boxes, turning slow database scans into lightning-fast spatial queries.
* **Outcome:** Drastically reduced API response times and CPU load, ensuring real-time alerts during emergency rescue coordination.

## Core Features
* Real-time spatial tracking for stray animal logs.
* Automated alert distribution based on geographic boundaries.
* Centralized dashboard for volunteer coordination and vaccination tracking.

---
## Copyright & Ownership

&copy; 2026 KarunaNidhan. All rights reserved. 

The code, architecture, and documentation contained within this repository are the exclusive intellectual property of KarunaNidhan. Unauthorized copying, distribution, modification, or commercial use of this material without explicit permission is strictly prohibited.
