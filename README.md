# CampusFlow: Academic Operations Intelligence

CampusFlow is an enterprise grade academic operations platform designed for timetable optimization, scheduling conflict diagnostics, and campus infrastructure management. The system utilizes graph theory to model relationships between faculty, rooms, and student batches, ensuring a collision free academic environment.

## Executive Summary

The platform provides a unified interface for three core academic stakeholders:

1. **Academic Coordinators**: Utilize the Diagnostic Audit Center for topological resource mapping and conflict resolution.
2. **Faculty**: Manage session scheduling with real time clash detection and administrative overrides.
3. **Students**: Access personalized timetable boards filtered by course, year, section, and laboratory batch.

## Core Capabilities

### Role Based Access Control (RBAC)
The system implements a session based authentication model separating administrative scheduling authority from student read-only personalized views.

- **Faculty Role**: Full authority to arrange extra lectures, perform administrative overrides, and manage the campus complaint lifecycle.
- **Student Role**: Personalized dashboard experience centered on the student's specific academic profile: Degree, Course (e.g., CSE, ICT), Year, Section, and Lab Batch.

### Diagnostic Audit Center
A network level visualization tool that maps scheduling requests as nodes in an undirected graph. Conflicts are represented as edges when sessions overlap in time or share restricted resources.

### Campus Operations Hub
A reporting and tracking system for infrastructure maintenance. It features automated routing based on issue category, Service Level Agreement (SLA) tracking, and escalation path management.

## Architecture

```mermaid
graph TD
    User((User)) --> Client[React Frontend]
    
    subgraph ClientLayer [Client Side]
        Client --> Auth[Auth Context / RBAC]
        Client --> Store[Local Storage Persistence]
        Auth --> StudentBoard[Personalized Timetable]
        Auth --> AdminTools[Scheduling Engine]
    end

    ClientLayer -- "API Calls" --> Server[Java Backend]

    subgraph ServerLayer [Server Side]
        Server --> API[ApiController]
        API --> ConflictSvc[Conflict Graph Service]
        API --> TimetableSvc[Timetable Service]
        ConflictSvc --> GraphModel[Adjacency List Graph]
        TimetableSvc --> DataStore[In Memory Session Store]
    end
```

## Stakeholder Workflows

### Student Personalization Engine
Students provide their academic profile during authentication. The system then applies a multi-dimensional filtering algorithm to the global master schedule.

```mermaid
flowchart LR
    Start([User Login]) --> Input[Enter Course, Section, Batch]
    Input --> Logic{Filtering Engine}
    Logic -->|Match Course| C[Filter by Subject]
    Logic -->|Match Section| S[Filter by Group]
    Logic -->|Match Batch| B[Filter by Lab]
    C & S & B --> Render[Render Personalized Board]
```

### Scheduling & Conflict Trace
When a faculty member requests a new session, the engine performs a deep trace against the existing graph topology.

```mermaid
sequenceDiagram
    participant F as Faculty
    participant E as Conflict Engine
    participant G as Graph Topology
    
    F->>E: Submit Slot Request
    E->>G: Scan for Resource Overlaps
    alt No Conflicts
        G-->>E: Validation Success
        E-->>F: Confirm Booking
    else Resource Collision
        G-->>E: Identify Edge Clashes (Room/Faculty/Class)
        E-->>F: Provide Alternative Slot Suggestions
    end
```

## Conflict Detection Parameters

The system identifies a conflict between two sessions if they occur on the same day, have overlapping time windows, and meet any of the following criteria:

- **Faculty Level**: The same instructor is assigned to concurrent sessions.
- **Venue Level**: The same room or laboratory is booked for simultaneous use.
- **Group Level**: The same student section or specific lab batch is required in two locations at once.

## Technical Implementation

### Frontend
- **Framework**: React 19 with Vite for high performance rendering.
- **Styling**: Vanilla CSS utilizing a glassmorphism design system for a premium aesthetic.
- **State Management**: Context API for authentication and RBAC.
- **Persistence**: Browser LocalStorage for session metadata and user profiles.

### Backend
- **Language**: Java.
- **Web Framework**: NioFlow (Lightweight NIO based server).
- **Data Model**: Adjacency list representation for conflict relationships.

## Directory Structure

```text
DMGTProject/
├── client/                # React Frontend Application
│   ├── src/
│   │   ├── components/    # Reusable UI Patterns
│   │   ├── context/       # Auth and RBAC State
│   │   ├── pages/         # Dashboard and Audit Views
│   │   └── services/      # API Communication Layer
│   └── public/            # Static Assets
└── server/                # Java Backend Application
    ├── controller/        # API Endpoints
    ├── graph/             # Conflict Detection Logic
    ├── model/             # Session and Graph Nodes
    └── service/           # Business Logic Layer
```

## Getting Started

### Backend Setup
Execute the following commands from the root directory to initiate the Java server:
```powershell
Set-Location .\server
.\run.ps1
```
The server will initialize on `http://localhost:8080`.

### Frontend Setup
Initiate the development server:
```powershell
Set-Location .\client
npm install
npm run dev
```
The application will be accessible via the localized Vite proxy.

## Project Vision

CampusFlow transitions traditional timetable management from a static viewing experience to a dynamic, graph-aware decision platform. By centralizing conflict intelligence and infrastructure reporting, the platform ensures that academic operations are both visible and optimized across the entire campus ecosystem.
