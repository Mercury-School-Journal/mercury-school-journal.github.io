/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

$(document).ready(() => {
    const request = indexedDB.open("GradesDB", 3);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        const gradesStore = db.createObjectStore("grades", { keyPath: "id" });
        const subjectsStore = db.createObjectStore("subjects", { keyPath: "id" });
        const timetableStore = db.createObjectStore("timetable", { keyPath: "id" });

    };

    request.onsuccess = (event) => {
        db = event.target.result;
        $.ajax({
            url: atob(localStorage.getItem("api")) + '/api/user',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: (response) => {
                $(".userName").text(response.first_name + " " + response.last_name);
                $.ajax({
                    url: atob(localStorage.getItem("api")) + '/api/student/grades',
                    type: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    success: (grades) => {

                        const transaction = db.transaction(["grades"], "readwrite");
                        const objectStore = transaction.objectStore("grades");
                        const newIds = [];


                        const existingRequest = objectStore.getAll();

                        existingRequest.onsuccess = (event) => {
                            const existingGrades = event.target.result;

                            grades.forEach(grade => {
                                if (!existingGrades.some(existingGrade => existingGrade.id === grade.id && grade.grade === existingGrade.grade)) {
                                    newIds.push(grade.id);
                                    const request = objectStore.put(grade);
                                    request.onsuccess = () => {
                                        console.log(`Grade with ID ${grade.id} saved/updated.`);
                                    };
                                    request.onerror = (event) => {
                                        console.error("Error saving grade: ", event.target.error);
                                    };
                                };
                            });

                            transaction.oncomplete = () => {
                                sessionStorage.removeItem("newIds");
                                sessionStorage.setItem("newIds", JSON.stringify(newIds));
                                // sessionStorage.setItem("newIds", JSON.stringify([1]));
                                console.log("New Grade IDs saved to sessionStorage:", newIds);
                            };
                        };

                        existingRequest.onerror = (event) => {
                            console.error("Error retrieving existing grades: ", event.target.error);
                        };
                        $.ajax({
                            url: atob(localStorage.getItem("api")) + '/api/student/subjects',
                            type: 'GET',
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            success: (subjects) => {
                                const transaction = db.transaction(["subjects"], "readwrite");
                                const objectStore = transaction.objectStore("subjects");
                                const existingRequest = objectStore.getAll();
                                existingRequest.onsuccess = (event) => {
                                    const existingSubjects = event.target.result;
                                    subjects.forEach(subject => {
                                        if (!existingSubjects.some(existingSubject => existingSubject.id === subject.id)) {
                                            const request = objectStore.put(subject);
                                            request.onsuccess = () => {
                                                console.log(`Subject with ID ${subject.id} saved/updated.`);
                                            };
                                            request.onerror = (event) => {
                                                console.error("Error saving subject: ", event.target.error);
                                            };
                                        };
                                    });
                                };
                            }
                        });
                    },
                });
            },
        });

    };

    $.ajax({
        url: atob(localStorage.getItem("api")) + '/api/timetable',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: (timetable) => {
            const transaction = db.transaction(["timetable"], "readwrite");
            const store = transaction.objectStore("timetable");

            store.clear().onsuccess = () => {
                timetable.forEach(entry => {
                    store.put(entry);
                });
            };
        }
    });

    console.log("Database initialized.");
    request.onerror = (event) => {
        console.error("Database error: " + event.target.errorCode);
    };
    $('#content-area').load('subpages/dashboard.htm');
    $('.load-content').on('click', function (e) {
        e.preventDefault();
        $('title').text('Dziennik Mercury: ' + $(this).text());
        // $('<link/>', {
        //     rel: 'stylesheet',
        //     type: 'text/css',
        //     href: 'css/' + $(this).data('name') + '.css'
        // }).appendTo('head');
        $('#content-area').load($(this).data('url'));
    });
    $('.logoff').on('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem("login");
        window.location.href = '';
    })
});