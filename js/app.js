const form = document.getElementById("hisabForm");
    const tableBody = document.querySelector("#hisabTable tbody");
    const summaryDisplay = document.getElementById("summaryDisplay");
    const exportBtn = document.getElementById("exportBtn");

    let records = JSON.parse(localStorage.getItem("dailyHisab")) || [];
    let editIndex = -1;

    function renderTable() {
      tableBody.innerHTML = "";
      let totalReceived = 0, totalExpense = 0, totalBalance = 0;

      records.forEach((r, i) => {
        const row = tableBody.insertRow();
        const totalKhroch = r.jawa + r.asa + r.nasta + r.bazar;
        const baki = r.received - totalKhroch;

        row.insertCell(0).innerText = r.date;
        row.insertCell(1).innerText = r.received;
        row.insertCell(2).innerText = r.jawa;
        row.insertCell(3).innerText = r.jawaPlace || "-";
        row.insertCell(4).innerText = r.asa;
        row.insertCell(5).innerText = r.asaPlace || "-";
        row.insertCell(6).innerText = r.nasta;
        row.insertCell(7).innerText = r.bazar;
        row.insertCell(8).innerText = totalKhroch;
        row.insertCell(9).innerText = baki;

        const actionCell = row.insertCell(10);
        const editBtn = document.createElement("button");
        editBtn.innerText = "Edit";
        editBtn.classList.add("edit-btn");
        editBtn.onclick = () => editRecord(i);

        const delBtn = document.createElement("button");
        delBtn.innerText = "Delete";
        delBtn.classList.add("delete-btn");
        delBtn.onclick = () => deleteRecord(i);

        actionCell.append(editBtn, delBtn);

        totalReceived += r.received;
        totalExpense += totalKhroch;
        totalBalance += baki;
      });

      summaryDisplay.innerText = `🧾 মোট পাওয়া: ${totalReceived} ৳ | মোট খরচ: ${totalExpense} ৳ | মোট বাকি: ${totalBalance} ৳`;
    }

    function editRecord(index) {
      const record = records[index];
      document.getElementById("date").value = record.date;
      document.getElementById("received").value = record.received;
      document.getElementById("jawa").value = record.jawa;
      document.getElementById("asa").value = record.asa;
      document.getElementById("nasta").value = record.nasta;
      document.getElementById("bazar").value = record.bazar;
      document.getElementById("jawaPlace").value = record.jawaPlace || "";
      document.getElementById("asaPlace").value = record.asaPlace || "";
      editIndex = index;
    }

    function deleteRecord(index) {
      if (confirm("তুমি কি এই রেকর্ডটি মুছে ফেলতে চাও?")) {
        records.splice(index, 1);
        localStorage.setItem("dailyHisab", JSON.stringify(records));
        renderTable();
      }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newRecord = {
        date: document.getElementById("date").value,
        received: parseFloat(document.getElementById("received").value),
        jawa: parseFloat(document.getElementById("jawa").value),
        jawaPlace: document.getElementById("jawaPlace").value.trim(),
        asa: parseFloat(document.getElementById("asa").value),
        asaPlace: document.getElementById("asaPlace").value.trim(),
        nasta: parseFloat(document.getElementById("nasta").value),
        bazar: parseFloat(document.getElementById("bazar").value)
      };

      if (editIndex === -1) records.push(newRecord);
      else {
        records[editIndex] = newRecord;
        editIndex = -1;
      }

      localStorage.setItem("dailyHisab", JSON.stringify(records));
      form.reset();
      renderTable();
    });

    exportBtn.addEventListener("click", () => {
      if (records.length === 0) {
        alert("কোনো হিসাব নেই এক্সপোর্ট করার জন্য!");
        return;
      }

      const excelData = records.map(r => ({
        "তারিখ": r.date,
        "মোট পাওয়া": r.received,
        "যাওয়া": r.jawa,
        "কোথায় যাচ্ছি": r.jawaPlace || "",
        "আসা": r.asa,
        "কোথা থেকে আসছি": r.asaPlace || "",
        "নাস্তা": r.nasta,
        "বাজার": r.bazar,
        "মোট খরচ": r.jawa + r.asa + r.nasta + r.bazar,
        "বাকি": r.received - (r.jawa + r.asa + r.nasta + r.bazar)
      }));

      const totalReceived = records.reduce((t, r) => t + r.received, 0);
      const totalExpense = records.reduce((t, r) => t + (r.jawa + r.asa + r.nasta + r.bazar), 0);
      const totalBalance = totalReceived - totalExpense;

      excelData.push({});
      excelData.push({
        "তারিখ": "মোট সারাংশ",
        "মোট পাওয়া": totalReceived,
        "মোট খরচ": totalExpense,
        "বাকি": totalBalance
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Hisab");
      XLSX.writeFile(wb, "daily_hisab.xlsx");
    });

    renderTable();
