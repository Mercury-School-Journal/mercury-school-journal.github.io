$(document).ready(() => {

    const request = indexedDB.open("GradesDB", 3);

request.onsuccess = (event) => {
    const db = event.target.result;

    const subjectsTransaction = db.transaction(["subjects"], "readonly");
    const subjectsStore = subjectsTransaction.objectStore("subjects");
    const subjectsRequest = subjectsStore.getAll();

    subjectsRequest.onsuccess = (event) => {
        const subjects = event.target.result;

        const gradesTransaction = db.transaction(["grades"], "readonly");
        const gradesStore = gradesTransaction.objectStore("grades");
        const gradesRequest = gradesStore.getAll();

        gradesRequest.onsuccess = (event) => {
            const grades = event.target.result;

            if (subjects.length === 0 || grades.length === 0) {
                $('.rating-container').append('<p class="no-grades">Brak ocen lub przedmiotów</p>');
                return;
            }

            subjects.forEach(subject => {
                const subjectGrades = grades.filter(grade => grade.subject_id === subject.id);

                const subjectDiv = $('<div class="rating-subject"></div>');
                const subjectNameDiv = $('<div class="rating-subject-name"></div>').text(subject.name);
                const ratingsDiv = $('<div class="ratings"></div>');

                if (subjectGrades.length > 0) {
                    subjectGrades.forEach(grade => {
                        const gradeDiv = $('<div class="rating-square"></div>').text(grade.grade);
                        ratingsDiv.append(gradeDiv);
                    });
                } else {
                    ratingsDiv.append('<div class="no-grades">Brak ocen</div>');
                }

                subjectDiv.append(subjectNameDiv).append(ratingsDiv);
                $('.rating-container').append(subjectDiv);
            });
        };
    };
};

request.onerror = (event) => {
    console.error("Database error: " + event.target.errorCode);
};
});