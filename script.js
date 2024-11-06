const inputBox = document.getElementById("input-box");
const dueDateInput = document.getElementById("due-date");
const priorityInput = document.getElementById("priority");
const listContainer = document.getElementById("list-container");

//nambah tugas baru, inputannya ada teks, tanggal due date, dan prioritas, fungsi ini menampilkan opsi mengedit dan menghapus tugas pada task yang dibuat
function addTask() {
    if (inputBox.value === '') {
        alert("Tugas Tidak Boleh Kosong!");
    } else {
        let li = document.createElement("li");

        let dueDateText = dueDateInput.value === '' ? 'No Date' : dueDateInput.value;
        
        //Nambah text, due date, dan level prioritas tugas
        li.innerHTML = `<span class="task-text">${inputBox.value}</span>
                        <span class="due-date">${dueDateText}</span>`;

        li.classList.add(priorityInput.value);

        // Nambahin edit button
        let editBtn = document.createElement("span");
        editBtn.innerHTML = "✎"; 
        editBtn.classList.add("edit");
        editBtn.onclick = () => editTask(li); 
        li.appendChild(editBtn);

        // Nambahin delete button
        let deleteBtn = document.createElement("span");
        deleteBtn.innerHTML = "\u00D7"; 
        deleteBtn.classList.add("delete");
        li.appendChild(deleteBtn);

        // Nambahin tugas dibawah dan reset inputan
        listContainer.appendChild(li);
        inputBox.value = "";
        dueDateInput.value = "";
        priorityInput.value = "low";
        
        saveData();
        updateProgressBar();
    }
}

//Mengubah to-do list pada bagian text, due date, dan opsi untuk save atau cancel
function editTask(taskItem) {
    // Ngambil teks tugas dan due date
    const taskText = taskItem.querySelector(".task-text");
    const dueDate = taskItem.querySelector(".due-date");

    // membuat supaya bisa mengedit pada tugas
    const taskInput = document.createElement("input");
    taskInput.type = "text";
    taskInput.value = taskText.textContent;
    taskText.replaceWith(taskInput);

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    
    //Cek apakah due date terisi atau tidak
    const currentDate = new Date(dueDate.textContent);
    dateInput.value = !isNaN(currentDate) ? dueDate.textContent : '';
    dueDate.replaceWith(dateInput);

    // Logo Edit Ke Logo Save
    const editBtn = taskItem.querySelector(".edit");
    editBtn.innerHTML = "✔"; 
    editBtn.onclick = () => saveEdit(taskItem, taskInput, dateInput);
}

//memastikan bahwa setiap perubahan yang dibuat pada tugas tersimpan dan ditampilkan dengan benar pada list tugas.
function saveEdit(taskItem, taskInput, dateInput) {
    // Menggantikan input dan due date
    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = taskInput.value;

    const dueDate = document.createElement("span");
    dueDate.className = "due-date";
    dueDate.textContent = dateInput.value || 'No Date';

    taskInput.replaceWith(taskText);
    dateInput.replaceWith(dueDate);

    // Ngubah button save ke button edit kembali
    const editBtn = taskItem.querySelector(".edit");
    editBtn.innerHTML = "✎";
    editBtn.onclick = () => editTask(taskItem);

    saveData(); 
}

//Fungsi ini menambahkan event listener ke listContainer untuk menangani klik pada item tugas (<li>) atau tombol delete
listContainer.addEventListener("click", function(e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
        updateProgressBar();
    } else if (e.target.tagName === "SPAN" && e.target.classList.contains("delete")) {
        e.target.parentElement.remove();
        updateProgressBar();
    }
    saveData();
}, false);

//Fungsi untuk menampilkan tugas berdasarkan status tugas itu
function filterTasks(status) {
    const tasks = listContainer.getElementsByTagName("li");
    for (let task of tasks) {
        if (status === "all") {
            task.style.display = "";
        } else if (status === "active" && !task.classList.contains("checked")) {
            task.style.display = "";
        } else if (status === "completed" && task.classList.contains("checked")) {
            task.style.display = "";
        } else {
            task.style.display = "none";
        }
    }
}

//mengurutkan tugas berdasarkan tanggal jatuh tempo (due date) secara berurutan dari yang paling awal hingga yang paling akhir.
//Jika terdapat No Value (atau tidak memasukan tanggal due date) maka akan dijauhkan ke tahun 9999
function sortTasksByDueDate() {
    const tasks = Array.from(listContainer.getElementsByTagName("li"));
    tasks.sort((a, b) => {
        const dateA = a.querySelector(".due-date").textContent;
        const dateB = b.querySelector(".due-date").textContent;

        //Jika terdapat No Value (atau tidak memasukan tanggal due date) maka akan dijauhkan ke tahun 9999
        const parsedDateA = dateA === 'No Date' ? new Date("9999-12-31") : new Date(dateA);
        const parsedDateB = dateB === 'No Date' ? new Date("9999-12-31") : new Date(dateB);

        return parsedDateA - parsedDateB;
    });

    listContainer.innerHTML = ""; 
    tasks.forEach(task => listContainer.appendChild(task)); 
}

//Fungsi untuk mengurutkan berdasarkan prioritas tugas
function filterByPriority(priorityLevel) {
    const tasks = listContainer.getElementsByTagName("li");
    for (let task of tasks) {
        if (task.classList.contains(priorityLevel)) {
            task.style.display = ""; 
        } else {
            task.style.display = "none"; 
        }
    }
}

//Fungsi untuk mengelompokan berdasarkan tanggal yang dipilih user
function filterTasksByDate() {
    const selectedDate = document.getElementById("filter-date").value;
    const tasks = listContainer.getElementsByTagName("li");
    for (let task of tasks) {
        const taskDate = task.querySelector(".due-date").textContent;
        task.style.display = taskDate === selectedDate ? "" : "none";
    }
}

//Fungsi untuk mengupdate progress bar yg menunjukkan banyak tugas yang bersifat Completed
function updateProgressBar() {
    const tasks = Array.from(listContainer.getElementsByTagName("li"));
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.classList.contains("checked")).length;

    const progressPercentage = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

    document.getElementById("progress-bar").style.width = progressPercentage + "%";
    document.getElementById("progress-text").textContent = `${completedTasks}/${totalTasks}`;
}

//Menghapus semua Tugas pada list tugas
function deleteAllTasks() {
    // Konfirmasi user yakin atau tidak untuk menghapus semua task
    if (confirm("Apakah Anda yakin ingin menghapus semua tugas?")) {
        listContainer.innerHTML = ""; 
        saveData(); 
    }
    updateProgressBar();
}

//Fungsi untuk menyimpan semua data tugas di listContainer ke localStorage agar ketika halaman di refresh tidak akan hilang
function saveData() {
    const tasks = [];
    listContainer.querySelectorAll("li").forEach(taskItem => {
        const taskText = taskItem.querySelector(".task-text").textContent;
        const dueDate = taskItem.querySelector(".due-date").textContent;
        const priority = taskItem.classList.contains("low") ? "low" : 
                         taskItem.classList.contains("medium") ? "medium" : "high";
        const isChecked = taskItem.classList.contains("checked");
        tasks.push({ text: taskText, date: dueDate, priority, checked: isChecked });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

//Fungsi untuk memuat dan menampilkan daftar tugas yang ada di localStorage
function showTask() {
    listContainer.innerHTML = "";
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => {
        let li = document.createElement("li");
        li.classList.add(task.priority);
        if (task.checked) li.classList.add("checked");

        li.innerHTML = `<span class="task-text">${task.text}</span>
                        <span class="due-date">${task.date || 'No Date'}</span>`;
        
        let editBtn = document.createElement("span");
        editBtn.innerHTML = "✎"; 
        editBtn.classList.add("edit");
        editBtn.onclick = () => editTask(li); 
        li.appendChild(editBtn);


        let deleteBtn = document.createElement("span");
        deleteBtn.innerHTML = "\u00D7"; 
        deleteBtn.classList.add("delete");
        deleteBtn.onclick = () => { li.remove(); saveData(); };
        li.appendChild(deleteBtn);

        listContainer.appendChild(li);
    });
    updateProgressBar();
}

//memanggil fungsi showTask() dan fungsi updateProgressBar()
showTask();
updateProgressBar();

