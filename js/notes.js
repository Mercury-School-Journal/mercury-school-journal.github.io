$(document).ready(() => {
    const request = indexedDB.open("GradesDB", 3);

    request.onsuccess = (event) => {
        const db = event.target.result;

        const transaction = db.transaction(["grades"], "readonly");
        const store = transaction.objectStore("grades");
        const requestAll = store.getAll();

        requestAll.onsuccess = (event) => {
            const grades = event.target.result;

            const notes = grades.filter(grade => grade.grade_type === "behavior_note");

            if (notes.length === 0) {
                $('.table tbody').append('<tr><td colspan="3">Brak uwag</td></tr>');
                return;
            }

            notes.forEach(note => {
                const teacher = note.teacher_id || "Nieznany nauczyciel";
                const content = note.grade || "Brak treści";
                const date = note.date || "Brak daty";

                const row = `
                    <tr>
                        <td><span>${teacher}</span></td>
                        <td><span>${content}</span></td>
                        <td><span>${date}</span></td>
                    </tr>
                `;
                $('.table tbody').append(row);
            });
        };

        requestAll.onerror = (event) => {
            console.error("Błąd odczytu ocen:", event.target.error);
        };
    };

    request.onerror = (event) => {
        console.error("Błąd otwierania bazy danych:", event.target.errorCode);
    };
});
