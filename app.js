const classList = document.getElementById("classList");
const todayDate = document.getElementById("todayDate");

const quickAddButton = document.getElementById("quickAddButton");
const quickAddOverlay = document.getElementById("quickAddOverlay");
const closeQuickAdd = document.getElementById("closeQuickAdd");

const classNameInput = document.getElementById("className");
const assignmentTitleInput = document.getElementById("assignmentTitle");

const dueDateInput = document.getElementById("dueDate");
const dueTimeInput = document.getElementById("dueTime");

const todayButton = document.getElementById("todayButton");
const tomorrowButton = document.getElementById("tomorrowButton");

const addAssignmentButton =
    document.getElementById("addAssignmentButton");


const classes = [
    "Operating Systems",
    "Programming Languages",
    "Programming Techniques",
    "Computational Thinking"
];


let assignments =
    JSON.parse(localStorage.getItem("assignments")) || [];


let editingAssignmentId = null;


function showCurrentDate() {

    const today = new Date();

    todayDate.textContent =
        today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric"
        });
}


function saveAssignments() {

    localStorage.setItem(
        "assignments",
        JSON.stringify(assignments)
    );
}


function formatDate(dateString, timeString) {

    const date =
        new Date(`${dateString}T${timeString}`);

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}


function getDueStatus(dateString, timeString) {

    const now = new Date();

    const dueDate =
        new Date(`${dateString}T${timeString}`);

    const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(
        tomorrowStart.getDate() + 1
    );

    const dayAfterTomorrow = new Date(todayStart);
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
        dueDate.getTime() - now.getTime();

    const hours =
        Math.floor(
            difference / (1000 * 60 * 60)
        );

    const days =
        Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );


    if (days >= 1) {

        return {
            text: `${days} day${days === 1 ? "" : "s"} left`,
            type: "upcoming"
        };
    }


    return {
        text: `${hours} hour${hours === 1 ? "" : "s"} left`,
        type: "upcoming"
    };
}


function renderAssignments() {

    classList.innerHTML = "";


    assignments.sort((a, b) => {

        const dateA =
            new Date(`${a.date}T${a.time}`);

        const dateB =
            new Date(`${b.date}T${b.time}`);

        return dateA - dateB;
    });


    classes.forEach((className) => {

        const classCard =
            document.createElement("section");

        classCard.className = "class-card";


        const heading =
            document.createElement("h2");

        heading.textContent = className;


        const assignmentHeading =
            document.createElement("p");

        assignmentHeading.className =
            "assignment-heading";

        assignmentHeading.textContent =
            "Assignments Due:";


        classCard.appendChild(heading);
        classCard.appendChild(
            assignmentHeading
        );


        const classAssignments =
            assignments.filter(
                assignment =>
                    assignment.className === className &&
                    !assignment.completed
            );


        if (classAssignments.length === 0) {

            const emptyText =
                document.createElement("p");

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
                        document.createElement("div");

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
                                event.target.tagName === "BUTTON"
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

                            assignment.completed = true;

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
                                        item.id !== assignment.id
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
    });
}


function openQuickAdd() {

    editingAssignmentId = null;

    assignmentTitleInput.value = "";
    dueDateInput.value = "";
    dueTimeInput.value = "23:59";

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

    editingAssignmentId = null;

    addAssignmentButton.textContent =
        "Add Assignment";
}


quickAddButton.addEventListener(
    "click",
    openQuickAdd
);


closeQuickAdd.addEventListener(
    "click",
    closeQuickAddSheet
);


todayButton.addEventListener(
    "click",
    () => {

        const today = new Date();

        dueDateInput.value =
            today.toISOString().split("T")[0];
    }
);


tomorrowButton.addEventListener(
    "click",
    () => {

        const tomorrow = new Date();

        tomorrow.setDate(
            tomorrow.getDate() + 1
        );

        dueDateInput.value =
            tomorrow.toISOString().split("T")[0];
    }
);


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
            dueTimeInput.value || "23:59";


        if (!className || !title || !date) {

            alert(
                "Enter a class, assignment, and due date."
            );

            return;
        }


        if (editingAssignmentId) {

            const assignment =
                assignments.find(
                    item =>
                        item.id === editingAssignmentId
                );


            assignment.className =
                className;

            assignment.title =
                title;

            assignment.date =
                date;

            assignment.time =
                time;


        } else {

            assignments.push({

                id: Date.now(),

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


showCurrentDate();
renderAssignments();


if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker.register(
                "./service-worker.js"
            );
        }
    );
}