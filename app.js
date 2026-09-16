const classList =
    document.getElementById("classList");

const todayDate =
    document.getElementById("todayDate");

const viewRange =
    document.getElementById("viewRange");


const quickAddButton =
    document.getElementById("quickAddButton");

const quickAddOverlay =
    document.getElementById("quickAddOverlay");

const closeQuickAdd =
    document.getElementById("closeQuickAdd");


const classNameInput =
    document.getElementById("className");

const assignmentTitleInput =
    document.getElementById("assignmentTitle");

const dueDateInput =
    document.getElementById("dueDate");

const dueTimeInput =
    document.getElementById("dueTime");


const todayButton =
    document.getElementById("todayButton");

const tomorrowButton =
    document.getElementById("tomorrowButton");

const addAssignmentButton =
    document.getElementById("addAssignmentButton");


const classes = [
    "Operating Systems",
    "Programming Languages",
    "Programming Techniques",
    "Computational Thinking"
];


let assignments =
    JSON.parse(
        localStorage.getItem("assignments")
    ) || [];


let editingAssignmentId = null;


/* LOAD SAVED VIEW RANGE */

const savedRange =
    localStorage.getItem("viewRange");

if (savedRange) {

    viewRange.value =
        savedRange;

}


/* CURRENT DATE */

function showCurrentDate() {

    const today = new Date();

    todayDate.textContent =
        today.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "short",
                day: "numeric"
            }
        );
}


/* SAVE */

function saveAssignments() {

    localStorage.setItem(
        "assignments",
        JSON.stringify(assignments)
    );
}


/* FORMAT DATE */

function formatDate(
    dateString,
    timeString
) {

    const date =
        new Date(
            `${dateString}T${timeString}`
        );

    return date.toLocaleString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


/* DUE STATUS */

function getDueStatus(
    dateString,
    timeString
) {

    const now =
        new Date();

    const dueDate =
        new Date(
            `${dateString}T${timeString}`
        );


    const todayStart =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    const tomorrowStart =
        new Date(todayStart);

    tomorrowStart.setDate(
        tomorrowStart.getDate() + 1
    );


    const dayAfterTomorrow =
        new Date(todayStart);

    dayAfterTomorrow.setDate(
        dayAfterTomorrow.getDate() + 2
    );


    if (dueDate < now) {

        return {
            text: "Overdue",
            type: "overdue"
        };

    }


    if (
        dueDate >= todayStart &&
        dueDate < tomorrowStart
    ) {

        return {
            text: "Due Today",
            type: "today"
        };

    }


    if (
        dueDate >= tomorrowStart &&
        dueDate < dayAfterTomorrow
    ) {

        return {
            text: "Due Tomorrow",
            type: "tomorrow"
        };

    }


    const difference =
        dueDate.getTime() -
        now.getTime();


    const hours =
        Math.floor(
            difference /
            (1000 * 60 * 60)
        );


    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );


    if (days >= 1) {

        return {
            text:
                `${days} day${days === 1 ? "" : "s"} left`,

            type:
                "upcoming"
        };

    }


    return {
        text:
            `${hours} hour${hours === 1 ? "" : "s"} left`,

        type:
            "upcoming"
    };
}


/* FILTER BY VIEW RANGE */

function assignmentIsVisible(
    assignment
) {

    const now =
        new Date();


    const dueDate =
        new Date(
            `${assignment.date}T${assignment.time}`
        );


    /*
        Always show overdue assignments.
    */

    if (dueDate < now) {

        return true;

    }


    const selectedRange =
        viewRange.value;


    /*
        Show everything.
    */

    if (
        selectedRange === "all"
    ) {

        return true;

    }


    const maxDate =
        new Date(now);


    maxDate.setDate(
        maxDate.getDate() +
        Number(selectedRange)
    );


    return dueDate <= maxDate;
}


/* RENDER */

function renderAssignments() {

    classList.innerHTML = "";


    assignments.sort(
        (a, b) => {

            const dateA =
                new Date(
                    `${a.date}T${a.time}`
                );

            const dateB =
                new Date(
                    `${b.date}T${b.time}`
                );

            return dateA - dateB;

        }
    );


    classes.forEach(
        className => {

            const classCard =
                document.createElement(
                    "section"
                );

            classCard.className =
                "class-card";


            const heading =
                document.createElement(
                    "h2"
                );

            heading.textContent =
                className;


            const assignmentHeading =
                document.createElement(
                    "p"
                );

            assignmentHeading.className =
                "assignment-heading";

            assignmentHeading.textContent =
                "Assignments Due:";


            classCard.appendChild(
                heading
            );

            classCard.appendChild(
                assignmentHeading
            );


            const classAssignments =
                assignments.filter(
                    assignment => {

                        return (
                            assignment.className ===
                                className &&

                            !assignment.completed &&

                            assignmentIsVisible(
                                assignment
                            )
                        );

                    }
                );


            if (
                classAssignments.length === 0
            ) {

                const emptyText =
                    document.createElement(
                        "p"
                    );

                emptyText.className =
                    "empty-message";

                emptyText.textContent =
                    "No assignments due.";

                classCard.appendChild(
                    emptyText
                );

            } else {

                classAssignments.forEach(
                    assignment => {

                        const status =
                            getDueStatus(
                                assignment.date,
                                assignment.time
                            );


                        const assignmentElement =
                            document.createElement(
                                "div"
                            );


                        assignmentElement.className =
                            `assignment ${status.type}`;


                        assignmentElement.innerHTML = `

                            <div class="assignment-main">

                                <div>

                                    <div class="assignment-title">
                                        ${assignment.title}
                                    </div>

                                    <div class="assignment-date">
                                        ${formatDate(
                                            assignment.date,
                                            assignment.time
                                        )}
                                    </div>

                                </div>

                                <div class="assignment-status">
                                    ${status.text}
                                </div>

                            </div>


                            <div class="assignment-actions hidden">

                                <button class="complete-button">
                                    ✓ Complete
                                </button>

                                <button class="edit-button">
                                    Edit
                                </button>

                                <button class="delete-button">
                                    Delete
                                </button>

                            </div>
                        `;


                        assignmentElement.addEventListener(
                            "click",
                            event => {

                                if (
                                    event.target.tagName ===
                                    "BUTTON"
                                ) {

                                    return;

                                }


                                const actions =
                                    assignmentElement.querySelector(
                                        ".assignment-actions"
                                    );


                                actions.classList.toggle(
                                    "hidden"
                                );

                            }
                        );


                        const completeButton =
                            assignmentElement.querySelector(
                                ".complete-button"
                            );


                        const editButton =
                            assignmentElement.querySelector(
                                ".edit-button"
                            );


                        const deleteButton =
                            assignmentElement.querySelector(
                                ".delete-button"
                            );


                        completeButton.addEventListener(
                            "click",
                            () => {

                                assignment.completed =
                                    true;

                                saveAssignments();

                                renderAssignments();

                            }
                        );


                        editButton.addEventListener(
                            "click",
                            () => {

                                editingAssignmentId =
                                    assignment.id;


                                classNameInput.value =
                                    assignment.className;


                                assignmentTitleInput.value =
                                    assignment.title;


                                dueDateInput.value =
                                    assignment.date;


                                dueTimeInput.value =
                                    assignment.time;


                                addAssignmentButton.textContent =
                                    "Save Changes";


                                quickAddOverlay.classList.remove(
                                    "hidden"
                                );

                            }
                        );


                        deleteButton.addEventListener(
                            "click",
                            () => {

                                const confirmed =
                                    confirm(
                                        `Delete "${assignment.title}"?`
                                    );


                                if (!confirmed) {

                                    return;

                                }


                                assignments =
                                    assignments.filter(
                                        item =>
                                            item.id !==
                                            assignment.id
                                    );


                                saveAssignments();

                                renderAssignments();

                            }
                        );


                        classCard.appendChild(
                            assignmentElement
                        );

                    }
                );

            }


            classList.appendChild(
                classCard
            );

        }
    );

}


/* QUICK ADD */

function openQuickAdd() {

    editingAssignmentId =
        null;


    assignmentTitleInput.value =
        "";


    dueDateInput.value =
        "";


    dueTimeInput.value =
        "23:59";


    addAssignmentButton.textContent =
        "Add Assignment";


    quickAddOverlay.classList.remove(
        "hidden"
    );


    assignmentTitleInput.focus();

}


function closeQuickAddSheet() {

    quickAddOverlay.classList.add(
        "hidden"
    );


    editingAssignmentId =
        null;


    addAssignmentButton.textContent =
        "Add Assignment";

}


/* QUICK ADD EVENTS */

quickAddButton.addEventListener(
    "click",
    openQuickAdd
);


closeQuickAdd.addEventListener(
    "click",
    closeQuickAddSheet
);


/* TODAY BUTTON */

todayButton.addEventListener(
    "click",
    () => {

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                today.getDate()
            ).padStart(
                2,
                "0"
            );


        dueDateInput.value =
            `${year}-${month}-${day}`;

    }
);


/* TOMORROW BUTTON */

tomorrowButton.addEventListener(
    "click",
    () => {

        const tomorrow =
            new Date();


        tomorrow.setDate(
            tomorrow.getDate() + 1
        );


        const year =
            tomorrow.getFullYear();


        const month =
            String(
                tomorrow.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                tomorrow.getDate()
            ).padStart(
                2,
                "0"
            );


        dueDateInput.value =
            `${year}-${month}-${day}`;

    }
);


/* ADD / EDIT ASSIGNMENT */

addAssignmentButton.addEventListener(
    "click",
    () => {

        const className =
            classNameInput.value;


        const title =
            assignmentTitleInput.value.trim();


        const date =
            dueDateInput.value;


        const time =
            dueTimeInput.value ||
            "23:59";


        if (
            !className ||
            !title ||
            !date
        ) {

            alert(
                "Enter a class, assignment, and due date."
            );

            return;

        }


        if (
            editingAssignmentId
        ) {

            const assignment =
                assignments.find(
                    item =>
                        item.id ===
                        editingAssignmentId
                );


            if (assignment) {

                assignment.className =
                    className;

                assignment.title =
                    title;

                assignment.date =
                    date;

                assignment.time =
                    time;

            }

        } else {

            assignments.push({

                id:
                    Date.now(),

                className:
                    className,

                title:
                    title,

                date:
                    date,

                time:
                    time,

                completed:
                    false

            });

        }


        saveAssignments();

        renderAssignments();

        closeQuickAddSheet();

    }
);


/* VIEW RANGE */

viewRange.addEventListener(
    "change",
    () => {

        localStorage.setItem(
            "viewRange",
            viewRange.value
        );


        renderAssignments();

    }
);


/* START APP */

showCurrentDate();

renderAssignments();


/* SERVICE WORKER */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker.register(
                "./service-worker.js"
            );

        }
    );

}