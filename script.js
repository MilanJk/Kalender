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
        const eventDate = document.getElementById("eventDate").value; // Stelle sicher, dass du ein Datum wählst
        if (eventTitle && eventDate) {
            const newEvent = { title: eventTitle, start: eventDate };
            this.calendar.addEvent(newEvent);
            this.saveEvents();
            document.getElementById("eventTitle").value = ""; // Leere das Eingabefeld
            document.getElementById("eventDate").value = ""; // Leere das Datumsfeld
        } else {
            alert("Bitte Titel und Datum eingeben!");
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

    async importWebUntis() {
        const url = prompt("Bitte die WebUntis ICS-URL eingeben:");
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
            const start = entry.match(/DTSTART:(\d{8})/)?.[1];
            if (start) {
                const formattedDate = `${start.substring(0,4)}-${start.substring(4,6)}-${start.substring(6,8)}`;
                events.push({ title, start: formattedDate });
            }
        });
        events.forEach(event => this.calendar.addEvent(event));
        this.saveEvents();
    }
}

const calendarManager = new CalendarManager();
