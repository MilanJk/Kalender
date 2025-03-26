class CalendarManager {
    constructor() {
        this.calendarEl = document.getElementById('calendar');
        this.calendar = new FullCalendar.Calendar(this.calendarEl, {
            initialView: 'dayGridMonth',
            events: JSON.parse(localStorage.getItem("events")) || [],
            editable: true,
            eventClick: (info) => this.removeEvent(info.event)
        });
        this.calendar.render();
    }

    addEvent() {
        const eventTitle = document.getElementById("eventTitle").value.trim();
        if (eventTitle) {
            const newEvent = { title: eventTitle, start: new Date().toISOString().split("T")[0] };
            this.calendar.addEvent(newEvent);
            this.saveEvents();
        }
    }

    removeEvent(event) {
        event.remove();
        this.saveEvents();
    }

    saveEvents() {
        const events = this.calendar.getEvents().map(event => ({ title: event.title, start: event.startStr }));
        localStorage.setItem("events", JSON.stringify(events));
    }

    async loginWebUntis() {
        const school = prompt("Bitte den Schulnamen eingeben:");
        const username = prompt("Benutzername eingeben:");
        const password = prompt("Passwort eingeben:");

        if (school && username && password) {
            const response = await fetch("https://webuntis-api.example.com/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ school, username, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.importWebUntis(data.icsUrl);
            } else {
                alert("Login fehlgeschlagen. Bitte überprüfe deine Eingaben.");
            }
        }
    }

    async importWebUntis(url) {
        if (url) {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            this.parseICS(data.contents);
        }
    }

    parseICS(icsData) {
        const events = [];
        icsData.split("BEGIN:VEVENT").slice(1).forEach(entry => {
            const title = entry.match(/SUMMARY:(.+)/)?.[1] || "Unbekannter Termin";
            const start = entry.match(/DTSTART:(\d{8}T\d{6})/)?.[1];
            if (start) {
                const formattedDate = `${start.substring(0,4)}-${start.substring(4,6)}-${start.substring(6,8)}T${start.substring(9,11)}:${start.substring(11,13)}`;
                events.push({ title, start: formattedDate });
            }
        });
        events.forEach(event => this.calendar.addEvent(event));
        this.saveEvents();
    }
}

const calendarManager = new CalendarManager();
