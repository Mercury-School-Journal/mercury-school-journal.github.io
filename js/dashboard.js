$(document).ready(function () {
    let currentDayIndex = 0;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    function showDay(index) {
        $('.day-container').removeClass('active');
        $('#' + days[index]).addClass('active');
    }

    $('#prevDay').click(function () {
        currentDayIndex = (currentDayIndex === 0) ? days.length - 1 : currentDayIndex - 1;
        showDay(currentDayIndex);
    });

    $('#nextDay').click(function () {
        currentDayIndex = (currentDayIndex === days.length - 1) ? 0 : currentDayIndex + 1;
        showDay(currentDayIndex);
    });

    const request = indexedDB.open("GradesDB", 3);

    request.onsuccess = (event) => {
        db = event.target.result;

        // === OCENY ===
        const subjectsTransaction = db.transaction(["subjects"], "readonly");
        const subjectsStore = subjectsTransaction.objectStore("subjects");
        const subjectsRequest = subjectsStore.getAll();

        subjectsRequest.onsuccess = (event) => {
            const subjects = event.target.result;

            subjects.forEach(subject => {
                const gradesTransaction = db.transaction(["grades"], "readonly");
                const gradesStore = gradesTransaction.objectStore("grades");
                const gradesRequest = gradesStore.getAll();

                gradesRequest.onsuccess = (event) => {
                    const grades = event.target.result;
                    const subjectGrades = grades.filter(grade => grade.subject_id === subject.id);
                    if (sessionStorage.getItem("newIds") != '[]') {
                        const subjectDiv = $('<div class="rating-subject"></div>');
                        const subjectNameDiv = $('<div class="rating-subject-name"></div>').text(subject.name);
                        const ratingsDiv = $('<div class="ratings"></div>');

                        subjectGrades.forEach(grade => {
                            const gradeDiv = $('<div class="rating-square"></div>').text(grade.grade);
                            ratingsDiv.append(gradeDiv);
                        });

                        subjectDiv.append(subjectNameDiv).append(ratingsDiv);
                        $('.rating-container').append(subjectDiv);
                    } else {
                        $('.rating-container').append('<p class="no-grades">Brak nowych ocen</p>');
                    }
                };
            });

            // === PLAN LEKCJI ===
            const subjectMap = {};
            subjects.forEach(subject => {
                subjectMap[subject.id] = subject.name;
            });

            const timetableTransaction = db.transaction(["timetable"], "readonly");
            const timetableStore = timetableTransaction.objectStore("timetable");
            const timetableRequest = timetableStore.getAll();

            timetableRequest.onsuccess = (event) => {
                const timetable = event.target.result;

                $('#days .day-container').each(function () {
                    $(this).find('.subject').remove();
                });

                timetable.sort((a, b) => {
                    const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                    const dayA = order.indexOf(a.day.toLowerCase());
                    const dayB = order.indexOf(b.day.toLowerCase());
                    return dayA !== dayB ? dayA - dayB : a.class_period - b.class_period;
                });

                timetable.forEach(entry => {
                    const dayId = entry.day.toLowerCase();
                    const subjectName = subjectMap[entry.subject_id] || `ID: ${entry.subject_id}`;
                    const subjectDiv = $('<div class="subject"></div>');
                    const hourSpan = $('<span class="hour"></span>').text(entry.class_period);
                    subjectDiv.append(hourSpan).append(subjectName);
                    $('#' + dayId).append(subjectDiv);
                });
            };
        };
    };

    request.onerror = (event) => {
        console.error("Database error: " + event.target.errorCode);
    };
    $.ajax({
        url: atob(localStorage.getItem("api")) + '/api/lucky-number',
        type: 'GET',
        headers: {},
        success: (lucky_number) => {
            $(".lucky-number").text(`Szczęśliwy numerek to: ${lucky_number.lucky_number}`);
        }
    });
});