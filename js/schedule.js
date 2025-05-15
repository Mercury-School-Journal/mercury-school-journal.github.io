$(document).ready(() => {
    const request = indexedDB.open("GradesDB", 3);

    request.onsuccess = (event) => {
        const db = event.target.result;

        const subjectsStore = db.transaction(["subjects"], "readonly").objectStore("subjects");
        subjectsStore.getAll().onsuccess = (e) => {
            const subjects = e.target.result;
            const subjectMap = {};
            subjects.forEach(subject => {
                subjectMap[subject.id] = subject.name;
            });

            const timetableStore = db.transaction(["timetable"], "readonly").objectStore("timetable");
            timetableStore.getAll().onsuccess = (e) => {
                const timetable = e.target.result;

                timetable.sort((a, b) => a.class_period - b.class_period);

                if ($('.d-md-block').is(':visible')) {
                    const maxHour = Math.max(...timetable.map(e => e.class_period));
                    const tbody = $('<tbody></tbody>');

                    for (let hour = 0; hour <= maxHour; hour++) {
                        const row = $('<tr></tr>');
                        row.append(`<td class="hour">${hour}</td>`);

                        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
                            const cell = $('<td class="subject"></td>');
                            const entry = timetable.find(e => e.day.toLowerCase() === day && e.class_period === hour);
                            if (entry) {
                                const name = subjectMap[entry.subject_id] || `ID: ${entry.subject_id}`;
                                const room = entry.room ? ` (sala ${entry.room})` : '';
                                cell.text(name).attr('title', room ? `Sala: ${entry.room}` : '');
                            }
                            row.append(cell);
                        });

                        tbody.append(row);
                    }

                    $('table thead + tbody').remove();
                    $('table').append(tbody);
                }

                if ($('.d-md-none').is(':visible')) {
                    const dayMap = {
                        monday: "#collapseMonday",
                        tuesday: "#collapseTuesday",
                        wednesday: "#collapseWednesday",
                        thursday: "#collapseThursday",
                        friday: "#collapseFriday"
                    };

                    Object.values(dayMap).forEach(selector => {
                        $(selector).find('.accordion-body').empty();
                    });

                    Object.keys(dayMap).forEach(day => {
                        const dayEntries = timetable.filter(e => e.day.toLowerCase() === day);
                        const container = $(dayMap[day]).find('.accordion-body');

                        dayEntries.forEach(entry => {
                            const subjectName = subjectMap[entry.subject_id] || `ID: ${entry.subject_id}`;
                            const room = entry.room ? ` (sala ${entry.room})` : '';
                            const subjectDiv = $('<div class="subject"></div>');
                            const hourSpan = $('<span class="hour"></span>').text(entry.class_period);
                            subjectDiv.append(hourSpan).append(subjectName);
                            if (room) subjectDiv.attr('title', `Sala: ${entry.room}`);
                            container.append(subjectDiv);
                        });
                    });
                }
            };
        };
    };

    request.onerror = (event) => {
        console.error("Błąd otwierania bazy danych:", event.target.errorCode);
    };
});
